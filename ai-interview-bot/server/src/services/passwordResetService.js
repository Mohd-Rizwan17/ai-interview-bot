import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export const OTP_TTL_SECONDS = 60;
const MAX_ATTEMPTS = 5;
const RESET_WINDOW_MS = 10 * 60 * 1000;

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

export const issueOtp = async (user) => {
  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

  user.passwordReset = {
    otpHash: hashOtp(otp),
    expiresAt,
    attempts: 0,
    verified: false,
  };
  await user.save({ validateBeforeSave: false });

  return { otp, expiresAt };
};

export const verifyOtp = async (user, otp) => {
  const reset = user.passwordReset;

  if (!reset?.otpHash || reset.verified || reset.expiresAt <= new Date())
    throw new ApiError(400, "OTP expired. Please resend", "OTP_EXPIRED");

  if (reset.attempts >= MAX_ATTEMPTS)
    throw new ApiError(
      429,
      "Too many wrong attempts. Please resend OTP",
      "OTP_BLOCKED",
    );

  if (hashOtp(otp) !== reset.otpHash) {
    reset.attempts += 1;
    await user.save({ validateBeforeSave: false });
    const left = MAX_ATTEMPTS - reset.attempts;
    throw new ApiError(
      400,
      left > 0
        ? `Invalid OTP. ${left} attempts left`
        : "Too many wrong attempts. Please resend OTP",
      "OTP_INVALID",
    );
  }

  reset.verified = true;
  reset.expiresAt = new Date(Date.now() + RESET_WINDOW_MS);
  await user.save({ validateBeforeSave: false });

  return jwt.sign({ sub: user.id, purpose: "password-reset" }, env.jwtSecret, {
    expiresIn: "10m",
  });
};

export const getVerifiedResetUser = async (resetToken) => {
  const expired = () =>
    new ApiError(
      401,
      "Reset session expired. Please start again",
      "RESET_EXPIRED",
    );

  let payload;
  try {
    payload = jwt.verify(resetToken, env.jwtSecret);
  } catch {
    throw expired();
  }
  if (payload.purpose !== "password-reset") throw expired();

  const user = await User.findById(payload.sub);
  const reset = user?.passwordReset;
  if (!reset?.verified || reset.expiresAt <= new Date()) throw expired();

  return user;
};
