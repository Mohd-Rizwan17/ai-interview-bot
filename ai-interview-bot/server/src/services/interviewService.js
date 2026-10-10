import {
  MAX_SCORE_BY_FORMAT,
  REFRESH_FREE_COUNT,
  REFRESH_PENALTY,
  ROUND_TITLES,
  TIME_LIMIT_BY_FORMAT,
} from "../constants/interview.js";
import { Attempt } from "../models/Attempt.js";
import { Interview } from "../models/Interview.js";

export const closeRunningInterview = (userId) =>
  Interview.updateMany(
    { user: userId, status: "in_progress" },
    { $set: { status: "incomplete", endedAt: new Date() } },
  );

export const endInterview = (interviewId, status, extraUpdate = {}) =>
  Interview.findOneAndUpdate(
    { _id: interviewId, status: "in_progress" },
    { $set: { status, endedAt: new Date() }, ...extraUpdate },
    { returnDocument: "after" },
  );

export const recordRefresh = async (interviewId) => {
  const interview = await Interview.findOneAndUpdate(
    { _id: interviewId, status: "in_progress" },
    { $inc: { refreshCount: 1 } },
    { returnDocument: "after" },
  );

  if (!interview) return null;

  if (
    interview.refreshCount > REFRESH_FREE_COUNT &&
    interview.penaltyMarks === 0
  ) {
    interview.penaltyMarks = REFRESH_PENALTY;
    await interview.save();
  }

  return interview;
};

export const refreshProgress = async (interview) => {
  const attempts = await Attempt.find({ interview: interview._id }).select(
    "status score maxScore",
  );

  const answered = attempts.filter(
    (attempt) => !["pending", "asked"].includes(attempt.status),
  ).length;
  const earned = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const obtained = Math.max(0, earned - (interview.penaltyMarks ?? 0));
  const total = attempts.reduce((sum, attempt) => sum + attempt.maxScore, 0);

  return Interview.findByIdAndUpdate(
    interview._id,
    {
      answeredQuestions: answered,
      progressPercent: Math.min(
        100,
        Math.round((answered / interview.totalQuestions) * 100),
      ),
      obtainedMarks: obtained,
      totalMarks: total,
    },
    { returnDocument: "after" },
  );
};

export const buildSummary = (interview, attempts) => ({
  totalMarks: interview.totalMarks,
  obtainedMarks: interview.obtainedMarks,
  right: attempts.filter((attempt) => attempt.isCorrect === true).length,
  wrong: attempts.filter(
    (attempt) => attempt.status === "answered" && attempt.isCorrect === false,
  ).length,
  unanswered: attempts.filter((attempt) => attempt.status !== "answered")
    .length,
  cheatingFlags: interview.cheatingFlags,
  refreshCount: interview.refreshCount,
  penaltyMarks: interview.penaltyMarks,
});

export const toClientInterview = (interview) => {
  const data = interview.toObject();

  if (data.status === "in_progress") {
    delete data.obtainedMarks;
    data.rounds.forEach((round) => {
      delete round.obtainedMarks;
    });
  }

  return data;
};

export const buildTitle = (keys) =>
  keys.map((key) => ROUND_TITLES[key]).join(" + ");

export const buildRounds = (keys, questionsByRound) =>
  keys.map((key, index) => {
    const questions = questionsByRound[key];

    return {
      key,
      title: ROUND_TITLES[key],
      order: index + 1,
      status: index === 0 ? "in_progress" : "locked",
      startedAt: index === 0 ? new Date() : undefined,
      timeLimitSec: questions.reduce(
        (sum, question) =>
          sum +
          (question.projectTimeSec ?? TIME_LIMIT_BY_FORMAT[question.format]),
        0,
      ),
      totalQuestions: questions.length,
      totalMarks: questions.reduce(
        (sum, question) => sum + MAX_SCORE_BY_FORMAT[question.format],
        0,
      ),
    };
  });
