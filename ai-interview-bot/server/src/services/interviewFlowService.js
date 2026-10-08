import {
  GRACE_SEC,
  HINT_PENALTY,
  MAX_SCORE_BY_FORMAT,
  TIME_LIMIT_BY_FORMAT,
} from "../constants/interview.js";

import { Attempt } from "../models/Attempt.js";
import { ApiError } from "../utils/ApiError.js";
import { refreshProgress } from "./interviewService.js";

const secondsSince = (date) => (Date.now() - date.getTime()) / 1000;

const hasExpired = (startedAt, limitSec) =>
  secondsSince(startedAt) > limitSec + GRACE_SEC;

const secondsLeft = (startedAt, limitSec) =>
  Math.max(0, Math.ceil(limitSec - secondsSince(startedAt)));

const toClientQuestion = (attempt) => ({
  id: attempt._id,
  order: attempt.order,
  format: attempt.format,
  topic: attempt.topic,
  question: attempt.question,
  options: attempt.options,
  maxScore: attempt.maxScore,
  hintUsed: attempt.hintUsed,
  timeLimitSec: attempt.timeLimitSec,
  secondsLeft: secondsLeft(attempt.askedAt, attempt.timeLimitSec),
});

const applyScore = (attempt, score) => {
  attempt.score = attempt.hintUsed ? Math.max(0, score - HINT_PENALTY) : score;

  attempt.isCorrect = score === attempt.maxScore;
};

const buildClaim = (attempt, { answer, selectedOption, skipped }) => {
  const isMcq = attempt.format === "mcq";
  const text = answer?.trim();

  const hasAnswer = isMcq ? Number.isInteger(selectedOption) : Boolean(text);

  let status = "answered";

  if (hasExpired(attempt.askedAt, attempt.timeLimitSec)) {
    status = "timed_out";
  } else if (skipped || !hasAnswer) {
    status = "skipped";
  }

  const fields = {
    status,
    answeredAt: new Date(),
    timeTakenSec: Math.round(secondsSince(attempt.askedAt)),
  };

  if (status === "answered") {
    if (isMcq) {
      fields.selectedOption = selectedOption;
    } else {
      fields.userAnswer = text;
    }
  }

  return fields;
};

export const askNextQuestion = async (interview) => {
  const open = await Attempt.findOne({
    interview: interview._id,
    status: "asked",
  }).sort({ order: 1 });

  if (open) {
    if (!hasExpired(open.askedAt, open.timeLimitSec)) {
      return {
        question: toClientQuestion(open),
        totalQuestions: interview.totalQuestions,
      };
    }

    await Attempt.updateOne(
      {
        _id: open._id,
        status: "asked",
      },
      {
        $set: {
          status: "timed_out",
          answeredAt: new Date(),
          timeTakenSec: Math.round(secondsSince(open.askedAt)),
          score: 0,
          isCorrect: false,
        },
      },
    );
  }

  const answeredCount = await Attempt.countDocuments({
    interview: interview._id,
    status: { $in: ["answered", "timed_out", "skipped"] },
  });

  if (answeredCount >= interview.totalQuestions) {
    throw new ApiError(400, "All questions are done. Finish the interview");
  }

  throw new ApiError(501, "Question planner is not connected yet");
};

export const submitAnswer = async (interview, input) => {
  const open = await Attempt.findOne({
    interview: interview._id,
    status: "asked",
  }).select("+correctOption +idealAnswer");

  if (!open) {
    throw new ApiError(409, "There is no open question");
  }

  const claim = await Attempt.updateOne(
    {
      _id: open._id,
      status: "asked",
    },
    {
      $set: buildClaim(open, input),
    },
  );

  if (claim.modifiedCount === 0) {
    throw new ApiError(409, "This question was already answered");
  }

  const answered = await Attempt.findById(open._id).select(
    "+correctOption +idealAnswer",
  );

  if (answered.status !== "answered") {
    answered.score = 0;
    answered.isCorrect = false;
    answered.feedback =
      answered.status === "timed_out"
        ? "Time is up for this question."
        : "You skipped this question.";
  } else if (answered.format === "mcq") {
    const correct = answered.selectedOption === answered.correctOption;

    answered.isCorrect = correct;
    answered.score = correct ? answered.maxScore : 0;
  } else {
    answered.isCorrect = null;
    answered.score = 0;
    answered.feedback = "Answer submitted for review.";
  }

  if (answered.hintUsed) {
    answered.score = Math.max(0, answered.score - HINT_PENALTY);
  }

  await answered.save();

  const updatedInterview = await refreshProgress(interview);

  return {
    attempt: {
      id: answered._id,
      status: answered.status,
      isCorrect: undefined,
      score: undefined,
      maxScore: answered.maxScore,
      feedback: undefined,
    },
    progress: {
      answeredQuestions: updatedInterview.answeredQuestions,
      totalQuestions: updatedInterview.totalQuestions,
      progressPercent: updatedInterview.progressPercent,
      obtainedMarks: updatedInterview.obtainedMarks,
      totalMarks: updatedInterview.totalMarks,
    },
    canFinish:
      updatedInterview.answeredQuestions >= updatedInterview.totalQuestions,
  };
};

export const revealHint = async (interview) => {
  const open = await Attempt.findOne({
    interview: interview._id,
    status: "asked",
  }).select("+hint");

  if (!open) {
    throw new ApiError(409, "There is no open question");
  }

  if (hasExpired(open.askedAt, open.timeLimitSec)) {
    throw new ApiError(409, "Time is up for this question");
  }

  if (!open.hint) {
    throw new ApiError(404, "No hint is available for this question");
  }

  if (!open.hintUsed) {
    await Attempt.updateOne({ _id: open._id }, { $set: { hintUsed: true } });
  }

  return {
    hint: open.hint,
    penalty: HINT_PENALTY,
  };
};
