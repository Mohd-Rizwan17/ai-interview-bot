import { Router } from "express";
import {
  createCustomQuestion,
  deleteCustomQuestion,
  getCustomQuestionCounts,
  listCustomQuestions,
} from "../controllers/customQuestionController.js";
import { adminOnly, protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  customQuestionIdRule,
  customQuestionRules,
} from "../validators/customQuestionValidators.js";

const router = Router();

router.use(protect);

router.get("/counts", getCustomQuestionCounts);
router.post(
  "/",
  adminOnly,
  customQuestionRules,
  validate,
  createCustomQuestion,
);
router.get("/", adminOnly, listCustomQuestions);
router.delete(
  "/:id",
  adminOnly,
  customQuestionIdRule,
  validate,
  deleteCustomQuestion,
);

export default router;
