import { CORRECT_THRESHOLD, HINT_PENALTY } from "../constants/interview.js";
import { Attempt } from "../models/Attempt.js";

const UNANSWERED_FEEDBACK = {
  skipped: "You skipped this question.",
  timed_out: "Time is up for this question.",
};

const PROJECT_FEEDBACK =
  "Mini projects are not graded. Compare your code with the requirements.";

const roundToHalf = (value) => Math.round(value * 2) / 2;

const countMatchedGroups = (answer, groups) => {
  const text = answer.toLowerCase();

  return groups.filter((group) =>
    group.some((keyword) => text.includes(keyword.toLowerCase())),
  ).length;
};

const gradeMcq = (attempt) => {
  const isCorrect = attempt.selectedOption === attempt.correctOption;

  return { isCorrect, score: isCorrect ? attempt.maxScore : 0 };
};

const gradeTheory = (attempt) => {
  const groups = attempt.keywords ?? [];

  if (groups.length === 0) {
    return {
      isCorrect: null,
      score: 0,
      feedback: "This answer needs manual review.",
    };
  }

  const matched = countMatchedGroups(attempt.userAnswer, groups);
  const ratio = matched / groups.length;

  return {
    isCorrect: ratio >= CORRECT_THRESHOLD,
    score: roundToHalf(ratio * attempt.maxScore),
    feedback: `You covered ${matched} of ${groups.length} key points.`,
  };
};

const gradeAttempt = (attempt, status) => {
  if (status !== "answered") {
    return {
      isCorrect: false,
      score: 0,
      feedback: UNANSWERED_FEEDBACK[status],
    };
  }

  if (attempt.format === "project") {
    return { isCorrect: null, score: 0, feedback: PROJECT_FEEDBACK };
  }

  const result =
    attempt.format === "mcq" ? gradeMcq(attempt) : gradeTheory(attempt);

  if (attempt.hintUsed) {
    result.score = Math.max(0, result.score - HINT_PENALTY);
  }

  return result;
};

export const gradeRound = async (interviewId, roundKey, closingStatus) => {
  const attempts = await Attempt.find({
    interview: interviewId,
    roundKey,
  }).select("+correctOption +keywords");

  const now = new Date();
  const operations = [];

  attempts.forEach((attempt) => {
    const isOpen = ["pending", "asked"].includes(attempt.status);

    if (isOpen && !closingStatus) return;

    const status = isOpen ? closingStatus : attempt.status;
    const { score, isCorrect, feedback } = gradeAttempt(attempt, status);
    const $set = { score, isCorrect };

    if (feedback) $set.feedback = feedback;

    if (isOpen) {
      $set.status = status;
      $set.answeredAt = now;
    }

    operations.push({
      updateOne: { filter: { _id: attempt._id }, update: { $set } },
    });
  });

  if (operations.length > 0) await Attempt.bulkWrite(operations);
};
