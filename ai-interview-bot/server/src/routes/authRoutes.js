import { Router } from "express";
import {
  changePassword,
  checkSecurityAnswer,
  confirmLogin,
  forgotPassword,
  getMe,
  getSecurityQuestion,
  login,
  logout,
  register,
  resetPassword,
  updateProfile,
  verifyResetOtp,
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import {
  changePasswordRules,
  confirmRules,
  forgotPasswordRules,
  loginRules,
  profileRules,
  registerRules,
  resetPasswordRules,
  securityAnswerRules,
  securityQuestionRules,
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
router.patch("/profile", protect, profileRules, validate, updateProfile);
router.patch(
  "/password",
  protect,
  authLimiter,
  changePasswordRules,
  validate,
  changePassword,
);
router.post(
  "/forgot-password/question",
  authLimiter,
  securityQuestionRules,
  validate,
  getSecurityQuestion,
);
router.post(
  "/forgot-password/answer",
  authLimiter,
  securityAnswerRules,
  validate,
  checkSecurityAnswer,
);
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
