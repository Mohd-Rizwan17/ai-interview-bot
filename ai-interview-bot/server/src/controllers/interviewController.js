import { Attempt } from "../models/Attempt.js";
import { Interview } from "../models/Interview.js";
import {
  buildAttempts,
  pickQuestions,
} from "../services/questionPlannerService.js";
import {
  askNextQuestion,
  revealHint,
  submitAnswer,
} from "../services/interviewFlowService.js";
import {
  buildRounds,
  buildSummary,
  buildTitle,
  closeRunningInterview,
  endInterview,
  refreshProgress,
} from "../services/interviewService.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
    throw new ApiError(409, "Interview has already ended");
  }
};

export const createInterview = asyncHandler(async (req, res) => {
  const { difficulty, rounds: keys } = req.body;

  const questionsByRound = pickQuestions(keys, difficulty);
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
    interview,
  });
});

export const listInterviews = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const filter = { user: req.user._id };

  const [interviews, total] = await Promise.all([
    Interview.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Interview.countDocuments(filter),
  ]);

  res.json({
    success: true,
    interviews,
    page,
    limit,
    total,
  });
});

export const getInterview = asyncHandler(async (req, res) => {
  const interview = await findOwnedInterview(req);

  if (interview.status === "incomplete") {
    throw new ApiError(403, "Incomplete interviews cannot be opened");
  }

  const query = Attempt.find({
    interview: interview._id,
  }).sort({ order: 1 });

  if (interview.status !== "in_progress") {
    query.select("+correctOption +idealAnswer +hint");
  }

  const attempts = await query;

  res.json({
    success: true,
    interview,
    attempts,
    summary: buildSummary(interview, attempts),
  });
});

export const reportCheating = asyncHandler(async (req, res) => {
  const interview = await findOwnedInterview(req);

  const ended = await endInterview(interview._id, "ended_cheating", {
    $inc: { cheatingFlags: 1 },
  });

  if (!ended) {
    throw new ApiError(409, "Interview has already ended");
  }

  res.json({
    success: true,
    interview: ended,
  });
});

export const finishInterview = asyncHandler(async (req, res) => {
  const interview = await findOwnedInterview(req);

  assertInProgress(interview);

  const latest = await refreshProgress(interview);

  if (latest.answeredQuestions < latest.totalQuestions) {
    throw new ApiError(400, "Answer all questions before finishing");
  }

  const completed = await endInterview(interview._id, "completed");

  if (!completed) {
    throw new ApiError(409, "Interview has already ended");
  }

  res.json({
    success: true,
    interview: completed,
  });
});

export const askQuestion = asyncHandler(async (req, res) => {
  const interview = await findOwnedInterview(req);

  assertInProgress(interview);

  const result = await askNextQuestion(interview);

  res.json({
    success: true,
    ...result,
  });
});

export const answerQuestion = asyncHandler(async (req, res) => {
  const interview = await findOwnedInterview(req);

  assertInProgress(interview);

  const result = await submitAnswer(interview, req.body);

  res.json({
    success: true,
    ...result,
  });
});

export const getHint = asyncHandler(async (req, res) => {
  const interview = await findOwnedInterview(req);

  assertInProgress(interview);

  const result = await revealHint(interview);

  res.json({
    success: true,
    ...result,
  });
});
