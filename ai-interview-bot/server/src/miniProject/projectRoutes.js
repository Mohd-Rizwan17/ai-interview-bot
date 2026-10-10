import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { getProject, listStacks, saveFiles } from "./projectController.js";
import { attemptIdRule, saveFilesRules } from "./projectValidators.js";

const router = Router();

router.use(protect);

router.get("/stacks", listStacks);
router.get("/:attemptId", attemptIdRule, validate, getProject);
router.put(
  "/:attemptId/files",
  attemptIdRule,
  saveFilesRules,
  validate,
  saveFiles,
);

export default router;
