import { Router } from "express";
import {
  confirmLogin,
  getMe,
  login,
  logout,
  register,
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import {
  confirmRules,
  loginRules,
  registerRules,
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

export default router;
