import { REFRESH_FREE_COUNT } from "../constants/interview.js";
import { Attempt } from "../models/Attempt.js";
import { Interview } from "../models/Interview.js";
import {
  completeRound,
  expireRoundIfNeeded,
  getCurrentRound,
  revealHint,
  submitAnswer,
} from "../services/interviewFlowService.js";
import {
  buildRounds,
  buildSummary,
  buildTitle,
  closeRunningInterview,
  endInterview,
  recordRefresh,
  refreshProgress,
  toClientInterview,
} from "../services/interviewService.js";
import {
  buildAttempts,
  pickQuestions,
} from "../services/questionPlannerService.js";
import { gradeRound } from "../services/scoreService.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import {
  clearFinishedInterviews,
  deleteInterviewById,
  purgeExpiredInterviews,
} from "../services/historyService.js";
import { escapeRegex } from "../utils/escapeRegex.js";

const findOwnedInterview = async (req) => {
  const interview = await Interview.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!interview) throw new ApiError(404, "Interview not found");

  return interview;
};

const assertInProgress = (interview) => {
  if (interview.status !== "in_progress") {
    throw new ApiError(409, "Interview has already ended", "INTERVIEW_ENDED");
  }
};

const findActiveInterview = async (req) => {
  const interview = await expireRoundIfNeeded(await findOwnedInterview(req));

  assertInProgress(interview);

  return interview;
};

export const createInterview = asyncHandler(async (req, res) => {
  const { difficulty, rounds: keys, projectStack } = req.body;

  const questionsByRound = await pickQuestions(keys, difficulty, projectStack);
  const rounds = buildRounds(keys, questionsByRound);

  await closeRunningInterview(req.user._id);

  let interview;

  try {
    interview = await Interview.create({
      user: req.user._id,
      title: buildTitle(keys),
      difficulty,
      rounds,
      totalQuestions: rounds.reduce(
        (sum, round) => sum + round.totalQuestions,
        0,
      ),
      totalMarks: rounds.reduce((sum, round) => sum + round.totalMarks, 0),
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "An interview is already in progress");
    }

    throw error;
  }

  try {
    await Attempt.insertMany(
      buildAttempts(interview._id, keys, questionsByRound),
    );
  } catch (error) {
    await Interview.deleteOne({ _id: interview._id });
    throw error;
  }

  res.status(201).json({
    success: true,
    interview: toClientInterview(interview),
  });
});

export const listInterviews = asyncHandler(async (req, res) => {
  await purgeExpiredInterviews(req.user);

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";

  const filter = { user: req.user._id };

  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: "i" };
  }

  const [interviews, total] = await Promise.all([
    Interview.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Interview.countDocuments(filter),
  ]);

  res.json({
    success: true,
    interviews: interviews.map(toClientInterview),
    page,
    limit,
    total,
    retentionDays: req.user.historyRetentionDays,
  });
});

export const getInterview = asyncHandler(async (req, res) => {
  const interview = await expireRoundIfNeeded(await findOwnedInterview(req));

  if (interview.status === "incomplete") {
    throw new ApiError(403, "Incomplete interviews cannot be opened");
  }

  const isRunning = interview.status === "in_progress";
  const filter = { interview: interview._id };
  let select = "+correctOption +idealAnswer +explanation +hint";

  if (isRunning) {
    filter.roundKey = {
      $in: interview.rounds
        .filter((round) => round.status !== "locked")
        .map((round) => round.key),
    };
    select = "-score -isCorrect -feedback";
  }

  const attempts = await Attempt.find(filter).select(select).sort({ order: 1 });

  res.json({
    success: true,
    interview: toClientInterview(interview),
    attempts,
    summary: isRunning ? undefined : buildSummary(interview, attempts),
  });
});

export const reportCheating = asyncHandler(async (req, res) => {
  const interview = await findOwnedInterview(req);
  const round = interview.rounds[interview.currentRoundIndex];

  if (interview.status === "in_progress" && round?.status === "in_progress") {
    await gradeRound(interview._id, round.key);
  }

  const ended = await endInterview(interview._id, "ended_cheating", {
    $inc: { cheatingFlags: 1 },
  });

  if (!ended) {
    throw new ApiError(409, "Interview has already ended", "INTERVIEW_ENDED");
  }

  const updated = await refreshProgress(ended);

  res.json({
    success: true,
    interview: toClientInterview(updated),
  });
});

export const reportRefresh = asyncHandler(async (req, res) => {
  const interview = await findOwnedInterview(req);
  const updated = await recordRefresh(interview._id);

  if (!updated) {
    throw new ApiError(409, "Interview has already ended", "INTERVIEW_ENDED");
  }

  res.json({
    success: true,
    refreshCount: updated.refreshCount,
    penaltyMarks: updated.penaltyMarks,
    freeRefreshes: REFRESH_FREE_COUNT,
  });
});

export const getRound = asyncHandler(async (req, res) => {
  const interview = await findActiveInterview(req);

  const result = await getCurrentRound(interview);

  res.json({
    success: true,
    ...result,
  });
});

export const answerQuestion = asyncHandler(async (req, res) => {
  const interview = await findActiveInterview(req);

  const result = await submitAnswer(interview, req.body);

  res.json({
    success: true,
    ...result,
  });
});

export const getHint = asyncHandler(async (req, res) => {
  const interview = await findActiveInterview(req);

  const result = await revealHint(interview, req.body);

  res.json({
    success: true,
    ...result,
  });
});

export const submitRound = asyncHandler(async (req, res) => {
  const interview = await findActiveInterview(req);

  const result = await completeRound(interview, {
    roundKey: req.body.roundKey,
    final: false,
  });

  res.json({
    success: true,
    ...result,
  });
});

export const finishInterview = asyncHandler(async (req, res) => {
  const interview = await findActiveInterview(req);

  const result = await completeRound(interview, {
    roundKey: req.body.roundKey,
    final: true,
  });

  res.json({
    success: true,
    ...result,
  });
});

export const deleteInterview = asyncHandler(async (req, res) => {
  const interview = await findOwnedInterview(req);

  if (interview.status === "in_progress") {
    throw new ApiError(409, "An interview in progress cannot be deleted");
  }

  await deleteInterviewById(req.user._id, interview._id);

  res.json({
    success: true,
    message: "Interview deleted",
  });
});

export const clearHistory = asyncHandler(async (req, res) => {
  const deleted = await clearFinishedInterviews(req.user._id);

  res.json({
    success: true,
    deleted,
  });
});

export const setRetention = asyncHandler(async (req, res) => {
  const { days } = req.body;

  await User.updateOne(
    { _id: req.user._id },
    { $set: { historyRetentionDays: days } },
  );

  const deleted = await purgeExpiredInterviews({
    _id: req.user._id,
    historyRetentionDays: days,
  });

  res.json({
    success: true,
    retentionDays: days,
    deleted,
  });
});
