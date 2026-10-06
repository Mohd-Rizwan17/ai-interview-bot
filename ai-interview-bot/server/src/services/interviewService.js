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

export const refreshProgress = async (interview) => {
  const attempts = await Attempt.find({ interview: interview._id }).select(
    "status score maxScore",
  );

  const answered = attempts.filter(
    (attempt) => attempt.status !== "asked",
  ).length;
  const obtained = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
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
  wrong: attempts.filter((attempt) => attempt.isCorrect === false).length,
  unanswered: attempts.filter(
    (a) => a.status === "timed_out" || a.status === "skipped",
  ).length,
  cheatingFlags: interview.cheatingFlags,
});
