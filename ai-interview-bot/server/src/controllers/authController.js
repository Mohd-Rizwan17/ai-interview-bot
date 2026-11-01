import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { closeRunningInterview } from "../services/interviewService.js";
import {
  clearSessionCookie,
  hasActiveSession,
  isCurrentDevice,
  startSession,
} from "../services/sessionService.js";
import {
  OTP_TTL_SECONDS,
  getVerifiedResetUser,
  issueOtp,
  verifyOtp,
} from "../services/passwordResetService.js";

export const register = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword)
    throw new ApiError(400, "Passwords do not match");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ fullName, username, email, passwordHash });
  await startSession(user, req, res);

  res.status(201).json({ success: true, user });
});

export const login = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase().trim();
  const user = await User.findOne({ email }).select("+passwordHash");
  const isMatch =
    user && (await bcrypt.compare(req.body.password, user.passwordHash));
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  if (hasActiveSession(user) && !isCurrentDevice(user, req)) {
    const confirmToken = jwt.sign(
      { sub: user.id, purpose: "login-confirm" },
      env.jwtSecret,
      {
        expiresIn: "5m",
      },
    );
    return res.status(409).json({
      success: false,
      code: "ALREADY_LOGGED_IN",
      message: "This account is logged in on another device",
      device: {
        name: user.activeSession.device,
        lastActiveAt: user.activeSession.lastActiveAt,
      },
      confirmToken,
    });
  }

  await startSession(user, req, res);
  res.json({ success: true, user });
});

export const confirmLogin = asyncHandler(async (req, res) => {
  let payload;
  try {
    payload = jwt.verify(req.body.confirmToken, env.jwtSecret);
  } catch {
    throw new ApiError(401, "Confirmation expired. Please login again");
  }
  if (payload.purpose !== "login-confirm")
    throw new ApiError(401, "Invalid confirmation token");

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, "Please login again");

  await startSession(user, req, res);
  res.json({ success: true, user });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const payload = jwt.verify(token, env.jwtSecret);
      const result = await User.updateOne(
        { _id: payload.sub, "activeSession.sessionId": payload.sid },
        { $unset: { activeSession: "" } },
      );
      if (result.modifiedCount > 0) await closeRunningInterview(payload.sub);
    } catch {}
  }

  clearSessionCookie(res);
  res.json({ success: true, message: "Logged out" });
});

export const getMe = (req, res) => {
  res.json({ success: true, user: req.user });
};

const findUserByEmail = async (rawEmail) => {
  const user = await User.findOne({ email: rawEmail.toLowerCase().trim() });
  if (!user)
    throw new ApiError(
      404,
      "No account found with this email",
      "EMAIL_NOT_FOUND",
    );
  return user;
};

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await findUserByEmail(req.body.email);
  const { otp, expiresAt } = await issueOtp(user);

  res.json({
    success: true,
    otp,
    expiresAt,
    expiresInSeconds: OTP_TTL_SECONDS,
  });
});

export const verifyResetOtp = asyncHandler(async (req, res) => {
  const user = await findUserByEmail(req.body.email);
  const resetToken = await verifyOtp(user, req.body.otp);
  res.json({ success: true, resetToken });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, password, confirmPassword } = req.body;
  if (password !== confirmPassword)
    throw new ApiError(400, "Passwords do not match");

  const user = await getVerifiedResetUser(resetToken);
  user.passwordHash = await bcrypt.hash(password, 12);
  user.passwordReset = undefined;
  user.activeSession = undefined;
  await user.save({ validateBeforeSave: false });

  await closeRunningInterview(user._id);
  clearSessionCookie(res);
  res.json({ success: true, message: "Password updated. Please login" });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { fullName: req.body.fullName },
    { new: true, runValidators: true },
  );

  res.json({ success: true, user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, password, confirmPassword } = req.body;
  if (password !== confirmPassword)
    throw new ApiError(400, "Passwords do not match");

  const user = await User.findById(req.user._id).select("+passwordHash");
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch)
    throw new ApiError(400, "Current password is incorrect", "WRONG_PASSWORD");
  if (currentPassword === password)
    throw new ApiError(400, "New password must be different");

  user.passwordHash = await bcrypt.hash(password, 12);
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: "Password updated" });
});