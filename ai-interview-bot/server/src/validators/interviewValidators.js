import { body, param } from "express-validator";
import {
  DIFFICULTIES,
  FIELDS,
  INTERVIEW_TYPES,
  TYPES_WITH_FIELD,
} from "../constants/interview.js";

export const createInterviewRules = [
  body("company")
    .isString()
    .withMessage("Company is required")
    .bail()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Company must be 2 to 80 characters"),
  body("type")
    .isIn(INTERVIEW_TYPES)
    .withMessage("Choose a valid interview type"),
  body("field")
    .if(body("type").isIn(TYPES_WITH_FIELD))
    .isIn(FIELDS)
    .withMessage("Choose a valid field"),
  body("difficulty")
    .isIn(DIFFICULTIES)
    .withMessage("Choose a valid difficulty"),
  body("totalQuestions")
    .optional()
    .isInt({ min: 5, max: 30 })
    .withMessage("Questions must be between 5 and 30")
    .toInt(),
];

export const interviewIdRule = [
  param("id").isMongoId().withMessage("Invalid interview id"),
];
