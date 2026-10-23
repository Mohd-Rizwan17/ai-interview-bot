import {
  getAdminStats,
  getLeaderboard,
  getUserStats,
} from "../services/statsService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyStats = asyncHandler(async (req, res) => {
  const stats = await getUserStats(req.user._id);

  res.json({
    success: true,
    stats,
  });
});

export const getOverviewStats = asyncHandler(async (req, res) => {
  const stats = await getAdminStats();

  res.json({
    success: true,
    stats,
  });
});

export const getLeaderboardStats = asyncHandler(async (req, res) => {
  const leaderboard = await getLeaderboard();

  res.json({
    success: true,
    leaderboard,
  });
});
