import { getUserStats } from "../services/statsService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyStats = asyncHandler(async (req, res) => {
  const stats = await getUserStats(req.user._id);

  res.json({
    success: true,
    stats,
  });
});
