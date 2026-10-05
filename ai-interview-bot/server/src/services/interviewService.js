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
    { new: true },
  );

export const refreshProgress = async (interview) => {
  const [stats] = await Attempt.aggregate([
    { $match: { interview: interview._id } },
    {
      $group: {
        _id: null,
        answered: { $sum: { $cond: [{ $eq: ["$status", "asked"] }, 0, 1] } },
        obtained: { $sum: "$score" },
        total: { $sum: "$maxScore" },
      },
    },
  ]);

  const answered = stats?.answered ?? 0;

  return Interview.findByIdAndUpdate(
    interview._id,
    {
      answeredQuestions: answered,
      progressPercent: Math.min(
        100,
        Math.round((answered / interview.totalQuestions) * 100),
      ),
      obtainedMarks: stats?.obtained ?? 0,
      totalMarks: stats?.total ?? 0,
    },
    { new: true },
  );
};

export const buildSummary = (interview, attempts) => ({
  totalMarks: interview.totalMarks,
  obtainedMarks: interview.obtainedMarks,
  right: attempts.filter((attempt) => attempt.isCorrect === true).length,
  wrong: attempts.filter((attempt) => attempt.isCorrect === false).length,
  unanswered: attempts.filter(
    (a) => a.status === "timed_out" || a.status === "skipped",
  ).length,
  cheatingFlags: interview.cheatingFlags,
});
