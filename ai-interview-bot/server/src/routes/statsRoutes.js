import { Router } from "express";
import {
  getMyStats,
  getOverviewStats,
} from "../controllers/statsController.js";
import { adminOnly, protect } from "../middlewares/auth.js";

const router = Router();

router.use(protect);

router.get("/me", getMyStats);
router.get("/admin", adminOnly, getOverviewStats);

export default router;
