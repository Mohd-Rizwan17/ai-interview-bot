import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

const tooManyRequests = (req, res, next) =>
  next(new ApiError(429, "Too many attempts. Please try again later"));

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests,
});

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  keyGenerator: (req) => req.user.id,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests,
});
