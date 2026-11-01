import { body } from "express-validator";

const required = (field, label) =>
  body(field).isString().withMessage(`${label} is required`).bail();

export const registerRules = [
  required("fullName", "Full name")
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage("Full name must be 2 to 60 characters"),
  required("username", "Username")
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9_]{3,20}$/)
    .withMessage(
      "Username must be 3 to 20 characters: letters, numbers or underscore",
    ),
  required("email", "Email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email"),
  required("password", "Password")
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be 8 to 72 characters")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage("Password must contain a letter and a number"),
  required("confirmPassword", "Confirm password"),
];

export const loginRules = [
  required("email", "Email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email"),
  required("password", "Password")
    .notEmpty()
    .withMessage("Password is required"),
];

export const confirmRules = [
  required("confirmToken", "Confirmation token").notEmpty(),
];

export const forgotPasswordRules = [
  required("email", "Email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email"),
];

export const verifyOtpRules = [
  required("email", "Email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email"),
  required("otp", "OTP")
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("OTP must be 6 digits"),
];

export const resetPasswordRules = [
  required("resetToken", "Reset token").notEmpty(),
  required("password", "Password")
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be 8 to 72 characters")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage("Password must contain a letter and a number"),
  required("confirmPassword", "Confirm password"),
];

export const profileRules = [
  required("fullName", "Full name")
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage("Full name must be 2 to 60 characters"),
];

export const changePasswordRules = [
  required("currentPassword", "Current password")
    .notEmpty()
    .withMessage("Current password is required"),
  required("password", "Password")
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be 8 to 72 characters")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage("Password must contain a letter and a number"),
  required("confirmPassword", "Confirm password"),
];