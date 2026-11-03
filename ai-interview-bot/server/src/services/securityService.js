import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import {
  ANSWER_TOKEN_TTL,
  MAX_SECURITY_ATTEMPTS,
  SECURITY_LOCK_MINUTES,
  SECURITY_RESET_HOURS,
} from "../constants/security.js";
import { ApiError } from "../utils/ApiError.js";

const noSecurity = () =>
  new ApiError(
    400,
    "No security question is set for this account",
    "NO_SECURITY_QUESTION",
  );

const normalizeAnswer = (answer) =>
  answer
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const formatWait = (seconds) => {
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
};

const lockedResult = (seconds) => ({
  retryAfterSeconds: seconds,
  message: `Too many wrong answers. Try again in ${formatWait(seconds)}`,
});

export const hashAnswer = async (answer) => {
  const normalized = normalizeAnswer(answer);
  if (normalized.length < 2)
    throw new ApiError(
      400,
      "Security answer must have at least 2 letters or numbers",
    );
  return bcrypt.hash(normalized, 12);
};

export const getQuestionKey = (user) => {
  if (!user.security?.question) throw noSecurity();
  return user.security.question;
};

export const getLockSeconds = (user) => {
  const lockedUntil = user.security?.lockedUntil;
  if (!lockedUntil) return 0;
  return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
};

export const verifyAnswer = async (user, answer) => {
  const security = user.security;
  if (!security?.answerHash) throw noSecurity();

  const lockSeconds = getLockSeconds(user);
  if (lockSeconds > 0) return lockedResult(lockSeconds);

  const staleAfterMs = SECURITY_RESET_HOURS * 60 * 60 * 1000;
  if (
    security.lastFailedAt &&
    Date.now() - security.lastFailedAt > staleAfterMs
  ) {
    security.attempts = 0;
    security.lockCount = 0;
  }

  const isMatch = await bcrypt.compare(
    normalizeAnswer(answer),
    security.answerHash,
  );

  if (!isMatch) {
    const attempts = (security.attempts ?? 0) + 1;
    security.attempts = attempts;
    security.lastFailedAt = new Date();

    if (attempts >= MAX_SECURITY_ATTEMPTS) {
      const lockCount = security.lockCount ?? 0;
      const minutes =
        SECURITY_LOCK_MINUTES[
          Math.min(lockCount, SECURITY_LOCK_MINUTES.length - 1)
        ];
      security.lockCount = lockCount + 1;
      security.lockedUntil = new Date(Date.now() + minutes * 60 * 1000);
      await user.save({ validateBeforeSave: false });
      return lockedResult(minutes * 60);
    }

    await user.save({ validateBeforeSave: false });
    const left = MAX_SECURITY_ATTEMPTS - attempts;
    throw new ApiError(
      400,
      `Wrong answer. ${left} ${left === 1 ? "attempt" : "attempts"} left`,
      "SECURITY_INVALID",
    );
  }

  security.attempts = 0;
  security.lockCount = 0;
  security.lockedUntil = undefined;
  security.lastFailedAt = undefined;
  await user.save({ validateBeforeSave: false });

  return {
    answerToken: jwt.sign(
      { sub: user.id, purpose: "security-answer" },
      env.jwtSecret,
      { expiresIn: ANSWER_TOKEN_TTL },
    ),
  };
};

export const assertAnswerVerified = (user, answerToken) => {
  const expired = () =>
    new ApiError(
      401,
      "Security check expired. Please start again",
      "SECURITY_EXPIRED",
    );

  let payload;
  try {
    payload = jwt.verify(answerToken, env.jwtSecret);
  } catch {
    throw expired();
  }
  if (payload.purpose !== "security-answer" || payload.sub !== user.id)
    throw expired();
};
