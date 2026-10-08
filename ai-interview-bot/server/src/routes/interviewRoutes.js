import { Router } from "express";
import {
  // answerFollowUp,
  answerQuestion,
  askQuestion,
  createInterview,
  finishInterview,
  getHint,
  getInterview,
  listInterviews,
  reportCheating,
} from "../controllers/interviewController.js";
import { protect } from "../middlewares/auth.js";
import { interviewLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import {
  answerRules,
  createInterviewRules,
  followUpRules,
  interviewIdRule,
} from "../validators/interviewValidators.js";

const router = Router();

router.use(protect);

router.post("/", createInterviewRules, validate, createInterview);
router.get("/", listInterviews);
router.get("/:id", interviewIdRule, validate, getInterview);
router.post("/:id/cheat", interviewIdRule, validate, reportCheating);
router.post(
  "/:id/next",
  interviewLimiter,
  interviewIdRule,
  validate,
  askQuestion,
);
router.post(
  "/:id/answers",
  interviewLimiter,
  interviewIdRule,
  answerRules,
  validate,
  answerQuestion,
);
router.post(
  "/:id/followups",
  interviewLimiter,
  interviewIdRule,
  followUpRules,
  validate,
  // answerFollowUp,
);
router.post("/:id/hint", interviewIdRule, validate, getHint);
router.post("/:id/finish", interviewIdRule, validate, finishInterview);

export default router;
