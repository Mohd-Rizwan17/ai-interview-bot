import { Router } from "express";
import {
  answerQuestion,
  clearHistory,
  createInterview,
  deleteInterview,
  finishInterview,
  getHint,
  getInterview,
  getRound,
  listInterviews,
  reportCheating,
  reportRefresh,
  setRetention,
  submitRound,
} from "../controllers/interviewController.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  answerRules,
  createInterviewRules,
  hintRules,
  interviewIdRule,
  listInterviewRules,
  retentionRules,
  roundRules,
} from "../validators/interviewValidators.js";

const router = Router();

router.use(protect);

router.post("/", createInterviewRules, validate, createInterview);
router.get("/", listInterviewRules, validate, listInterviews);
router.delete("/", clearHistory);
router.patch("/retention", retentionRules, validate, setRetention);
router.get("/:id", interviewIdRule, validate, getInterview);
router.delete("/:id", interviewIdRule, validate, deleteInterview);
router.get("/:id/round", interviewIdRule, validate, getRound);
router.post("/:id/cheat", interviewIdRule, validate, reportCheating);
router.post("/:id/refresh", interviewIdRule, validate, reportRefresh);
router.post(
  "/:id/answers",
  interviewIdRule,
  answerRules,
  validate,
  answerQuestion,
);
router.post("/:id/hint", interviewIdRule, hintRules, validate, getHint);
router.post(
  "/:id/round/submit",
  interviewIdRule,
  roundRules,
  validate,
  submitRound,
);
router.post(
  "/:id/finish",
  interviewIdRule,
  roundRules,
  validate,
  finishInterview,
);

export default router;
