import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import {
  ANSWER_TOKEN_TTL,
  MAX_SECURITY_ATTEMPTS,
  SECURITY_LOCK_MINUTES,
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

export const verifyAnswer = async (user, answer) => {
  const security = user.security;
  if (!security?.answerHash) throw noSecurity();

  if (security.lockedUntil && security.lockedUntil > new Date()) {
    const minutes = Math.ceil((security.lockedUntil - Date.now()) / 60000);
    throw new ApiError(
      429,
      `Too many wrong answers. Try again in ${minutes} minutes`,
      "SECURITY_LOCKED",
    );
  }

  const isMatch = await bcrypt.compare(
    normalizeAnswer(answer),
    security.answerHash,
  );

  if (!isMatch) {
    const attempts = (security.attempts ?? 0) + 1;
    if (attempts >= MAX_SECURITY_ATTEMPTS) {
      security.attempts = 0;
      security.lockedUntil = new Date(
        Date.now() + SECURITY_LOCK_MINUTES * 60 * 1000,
      );
      await user.save({ validateBeforeSave: false });
      throw new ApiError(
        429,
        `Too many wrong answers. Try again in ${SECURITY_LOCK_MINUTES} minutes`,
        "SECURITY_LOCKED",
      );
    }
    security.attempts = attempts;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(
      400,
      `Wrong answer. ${MAX_SECURITY_ATTEMPTS - attempts} attempts left`,
      "SECURITY_INVALID",
    );
  }

  security.attempts = 0;
  security.lockedUntil = undefined;
  await user.save({ validateBeforeSave: false });

  return jwt.sign({ sub: user.id, purpose: "security-answer" }, env.jwtSecret, {
    expiresIn: ANSWER_TOKEN_TTL,
  });
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
