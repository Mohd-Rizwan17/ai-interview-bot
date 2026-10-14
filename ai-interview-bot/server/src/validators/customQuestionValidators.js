import { body, param } from "express-validator";
import { CUSTOM_QUESTION_FORMATS } from "../constants/interview.js";

const whenMcq = () => body("format").equals("mcq");
const whenTheory = () => body("format").isIn(["practical", "descriptive"]);

export const customQuestionRules = [
  body("format").isIn(CUSTOM_QUESTION_FORMATS).withMessage("Choose a valid format"),
  body("question")
    .isString()
    .withMessage("Question is required")
    .bail()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Question must be 10 to 1000 characters"),
  body("topic")
    .optional()
    .isString()
    .withMessage("Topic must be text")
    .bail()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Topic must be at most 50 characters"),
  body("explanation")
    .optional()
    .isString()
    .withMessage("Explanation must be text")
    .bail()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Explanation is too long"),
  body("hint")
    .optional()
    .isString()
    .withMessage("Hint must be text")
    .bail()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Hint must be at most 300 characters"),

  body("options")
    .if(whenMcq())
    .isArray({ min: 4, max: 4 })
    .withMessage("MCQ needs exactly 4 options"),
  body("options.*")
    .if(whenMcq())
    .isString()
    .bail()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Each option must be 1 to 200 characters"),
  body("correctOption")
    .if(whenMcq())
    .isInt({ min: 0, max: 3 })
    .withMessage("Choose the correct option")
    .toInt(),

  body("idealAnswer")
    .if(whenTheory())
    .isString()
    .withMessage("Model answer is required")
    .bail()
    .trim()
    .isLength({ min: 10, max: 3000 })
    .withMessage("Model answer must be 10 to 3000 characters"),
  body("keywords")
    .if(whenTheory())
    .isArray({ min: 1, max: 10 })
    .withMessage("Add 1 to 10 keywords"),
  body("keywords.*")
    .if(whenTheory())
    .isString()
    .bail()
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage("Each keyword must be 1 to 40 characters"),
];

export const customQuestionIdRule = [
  param("id").isMongoId().withMessage("Invalid question id"),
];
