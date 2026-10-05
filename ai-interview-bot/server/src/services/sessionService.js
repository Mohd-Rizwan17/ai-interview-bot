import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { getDeviceName } from "../utils/deviceInfo.js";

const isProduction = env.nodeEnv === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

export const hasActiveSession = (user) =>
  Boolean(user.activeSession?.sessionId) &&
  user.activeSession.expiresAt > new Date();

export const startSession = async (user, req, res) => {
  const sessionId = crypto.randomUUID();
  const token = jwt.sign({ sub: user.id, sid: sessionId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
  const expiresAt = new Date(jwt.decode(token).exp * 1000);

  user.activeSession = {
    sessionId,
    device: getDeviceName(req.headers["user-agent"]),
    lastActiveAt: new Date(),
    expiresAt,
  };
  await user.save({ validateBeforeSave: false });

  res.cookie("token", token, { ...cookieOptions, expires: expiresAt });
};

export const clearSessionCookie = (res) => {
  res.clearCookie("token", cookieOptions);
};
