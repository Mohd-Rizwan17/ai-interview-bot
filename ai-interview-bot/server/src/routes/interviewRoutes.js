import { Router } from "express";
import {
  createInterview,
  finishInterview,
  getInterview,
  listInterviews,
  reportCheating,
} from "../controllers/interviewController.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createInterviewRules,
  interviewIdRule,
} from "../validators/interviewValidators.js";

const router = Router();

router.use(protect);

router.post("/", createInterviewRules, validate, createInterview);
router.get("/", listInterviews);
router.get("/:id", interviewIdRule, validate, getInterview);
router.post("/:id/cheat", interviewIdRule, validate, reportCheating);
router.post("/:id/finish", interviewIdRule, validate, finishInterview);

export default router;
