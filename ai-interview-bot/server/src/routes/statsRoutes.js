import { Router } from "express";
import { getMyStats } from "../controllers/statsController.js";
import { protect } from "../middlewares/auth.js";

const router = Router();

router.use(protect);

router.get("/me", getMyStats);

export default router;
