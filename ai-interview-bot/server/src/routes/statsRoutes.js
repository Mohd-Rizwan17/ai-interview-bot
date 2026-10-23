import { Router } from "express";
import {
  getLeaderboardStats,
  getMyStats,
  getOverviewStats,
} from "../controllers/statsController.js";
import { adminOnly, protect } from "../middlewares/auth.js";

const router = Router();

router.use(protect);

router.get("/me", getMyStats);
router.get("/admin", adminOnly, getOverviewStats);
router.get("/leaderboard", adminOnly, getLeaderboardStats);

export default router;
