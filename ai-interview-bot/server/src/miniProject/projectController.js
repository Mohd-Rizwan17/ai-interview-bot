import { asyncHandler } from "../utils/asyncHandler.js";
import { STACKS } from "./projectBank.js";
import { getWork, saveWork } from "./projectService.js";

export const listStacks = (req, res) => {
  res.json({
    success: true,
    stacks: Object.entries(STACKS).map(([key, stack]) => ({
      key,
      label: stack.label,
    })),
  });
};

export const getProject = asyncHandler(async (req, res) => {
  const result = await getWork(req.user._id, req.params.attemptId);

  res.json({
    success: true,
    ...result,
  });
});

export const saveFiles = asyncHandler(async (req, res) => {
  const result = await saveWork(req.user._id, req.params.attemptId, req.body);

  res.json({
    success: true,
    ...result,
  });
});
