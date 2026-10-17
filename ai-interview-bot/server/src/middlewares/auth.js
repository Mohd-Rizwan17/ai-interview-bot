import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    throw new ApiError(401, "Please login to continue", "UNAUTHORIZED");

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(
      401,
      "Session expired. Please login again",
      "UNAUTHORIZED",
    );
  }

  const user = await User.findById(payload.sub);
  if (!user)
    throw new ApiError(401, "Please login to continue", "UNAUTHORIZED");

  if (!payload.sid || user.activeSession?.sessionId !== payload.sid) {
    throw new ApiError(
      401,
      "You were logged out because your account was used on another device",
      "SESSION_ENDED",
    );
  }

  const lastActiveAt = user.activeSession.lastActiveAt;
  if (!lastActiveAt || Date.now() - lastActiveAt.getTime() > 60000) {
    await User.updateOne(
      { _id: user._id },
      { "activeSession.lastActiveAt": new Date() },
    );
  }

  req.user = user;
  next();
});

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ApiError(403, "Admin access required", "FORBIDDEN"));
  }

  next();
};