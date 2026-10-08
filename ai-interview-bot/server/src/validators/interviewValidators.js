import { body, param } from "express-validator";
import {
  ALL_ROUNDS,
  DIFFICULTIES,
  INTERVIEW_ROUNDS,
} from "../constants/interview.js";

export const createInterviewRules = [
  body("difficulty")
    .isIn(DIFFICULTIES)
    .withMessage("Choose a valid difficulty"),
  body("rounds")
    .isArray({ min: 1, max: 20 })
    .withMessage("Select at least one round")
    .bail()
    .customSanitizer((rounds) => {
      const expanded = rounds.flatMap((key) =>
        key === "all" ? ALL_ROUNDS : [key],
      );
      return [...new Set(expanded)];
    })
    .custom((rounds) => rounds.every((key) => INTERVIEW_ROUNDS.includes(key)))
    .withMessage("Choose valid rounds"),
];

export const interviewIdRule = [
  param("id").isMongoId().withMessage("Invalid interview id"),
];

const answerFields = [
  body("answer")
    .optional()
    .isString()
    .withMessage("Answer must be text")
    .bail()
    .isLength({ max: 5000 })
    .withMessage("Answer is too long"),
  body("skipped")
    .optional()
    .isBoolean()
    .withMessage("skipped must be true or false")
    .toBoolean(),
];

export const answerRules = [
  body("attemptId").isMongoId().withMessage("Invalid question id"),
  ...answerFields,
  body("selectedOption")
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage("Invalid option")
    .toInt(),
];

export const hintRules = [
  body("attemptId").isMongoId().withMessage("Invalid question id"),
];

export const roundRules = [
  body("roundKey").isIn(INTERVIEW_ROUNDS).withMessage("Invalid round"),
];