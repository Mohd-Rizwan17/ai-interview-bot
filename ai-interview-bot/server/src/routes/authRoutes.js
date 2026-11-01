import { Router } from "express";
import {
  confirmLogin,
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resetPassword,
  verifyResetOtp,
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import {
  confirmRules,
  forgotPasswordRules,
  loginRules,
  registerRules,
  resetPasswordRules,
  verifyOtpRules,
} from "../validators/authValidators.js";

const router = Router();

router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login", authLimiter, loginRules, validate, login);
router.post(
  "/login/confirm",
  authLimiter,
  confirmRules,
  validate,
  confirmLogin,
);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordRules,
  validate,
  forgotPassword,
);
router.post(
  "/verify-otp",
  authLimiter,
  verifyOtpRules,
  validate,
  verifyResetOtp,
);
router.post(
  "/reset-password",
  authLimiter,
  resetPasswordRules,
  validate,
  resetPassword,
);

export default router;
