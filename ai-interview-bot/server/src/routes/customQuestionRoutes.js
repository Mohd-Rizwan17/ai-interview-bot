import { Router } from "express";
import {
  createCustomQuestion,
  deleteCustomQuestion,
  listCustomQuestions,
} from "../controllers/customQuestionController.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  customQuestionIdRule,
  customQuestionRules,
} from "../validators/customQuestionValidators.js";

const router = Router();

router.use(protect);

router.post("/", customQuestionRules, validate, createCustomQuestion);
router.get("/", listCustomQuestions);
router.delete("/:id", customQuestionIdRule, validate, deleteCustomQuestion);

export default router;
