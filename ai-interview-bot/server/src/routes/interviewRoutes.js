import { Router } from "express";
import {
  answerQuestion,
  createInterview,
  finishInterview,
  getHint,
  getInterview,
  getRound,
  listInterviews,
  reportCheating,
} from "../controllers/interviewController.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  answerRules,
  createInterviewRules,
  hintRules,
  interviewIdRule,
} from "../validators/interviewValidators.js";

const router = Router();

router.use(protect);

router.post("/", createInterviewRules, validate, createInterview);
router.get("/", listInterviews);
router.get("/:id", interviewIdRule, validate, getInterview);
router.get("/:id/round", interviewIdRule, validate, getRound);
router.post("/:id/cheat", interviewIdRule, validate, reportCheating);
router.post(
  "/:id/answers",
  interviewIdRule,
  answerRules,
  validate,
  answerQuestion,
);
router.post("/:id/hint", interviewIdRule, hintRules, validate, getHint);
router.post("/:id/finish", interviewIdRule, validate, finishInterview);

export default router;
