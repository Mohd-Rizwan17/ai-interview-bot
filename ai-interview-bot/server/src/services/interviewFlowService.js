import {
  CORRECT_THRESHOLD,
  FOLLOW_UP_TIME_LIMIT_SEC,
  GRACE_SEC,
  HINT_PENALTY,
  MAX_FOLLOW_UPS,
  MAX_SCORE_BY_FORMAT,
  TIME_LIMIT_BY_FORMAT,
} from "../constants/interview.js";
import { Attempt } from "../models/Attempt.js";
import { ApiError } from "../utils/ApiError.js";
import {
  evaluateAnswer,
  generateQuestion,
  reviewFollowUp,
} from "./aiService.js";
import { refreshProgress } from "./interviewService.js";
import { planQuestion } from "./questionPlanner.js";

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

const toClientFollowUp = (followUp) => ({
  question: followUp.question,
  timeLimitSec: FOLLOW_UP_TIME_LIMIT_SEC,
  secondsLeft: secondsLeft(followUp.askedAt, FOLLOW_UP_TIME_LIMIT_SEC),
});

const getPendingFollowUp = (attempt) => {
  const last = attempt?.followUps[attempt.followUps.length - 1];
  return last && last.answer === undefined ? last : null;
};

const applyScore = (attempt, rawScore) => {
  attempt.isCorrect = rawScore / attempt.maxScore >= CORRECT_THRESHOLD;
  attempt.score = attempt.hintUsed
    ? Math.max(0, rawScore - HINT_PENALTY)
    : rawScore;
};

export const askNextQuestion = async (interview) => {
  const attempts = await Attempt.find({ interview: interview._id }).sort({
    order: 1,
  });
  const last = attempts[attempts.length - 1];

  if (last?.status === "asked") {
    if (!hasExpired(last.askedAt, last.timeLimitSec)) {
      return {
        question: toClientQuestion(last),
        totalQuestions: interview.totalQuestions,
      };
    }
    await Attempt.updateOne(
      { _id: last._id, status: "asked" },
      { $set: { status: "timed_out", answeredAt: new Date() } },
    );
  }

  const pending = getPendingFollowUp(last);
  if (pending) {
    if (!hasExpired(pending.askedAt, FOLLOW_UP_TIME_LIMIT_SEC)) {
      throw new ApiError(409, "Answer the follow-up question first");
    }
    pending.answer = "";
    pending.feedback = "Time is up for this follow-up.";
    await last.save();
  }

  if (attempts.length >= interview.totalQuestions) {
    throw new ApiError(400, "All questions are done. Finish the interview");
  }

  const order = attempts.length + 1;
  const plan = planQuestion(
    interview,
    order,
    attempts.map((attempt) => attempt.topic),
  );
  const generated = await generateQuestion({
    company: interview.company,
    difficulty: interview.difficulty,
    ...plan,
    previousQuestions: attempts.map((attempt) => attempt.question),
  });

  try {
    const attempt = await Attempt.create({
      interview: interview._id,
      order,
      source: "ai",
      format: plan.format,
      topic: plan.topic,
      ...generated,
      timeLimitSec: TIME_LIMIT_BY_FORMAT[plan.format],
      maxScore: MAX_SCORE_BY_FORMAT[plan.format],
    });
    return {
      question: toClientQuestion(attempt),
      totalQuestions: interview.totalQuestions,
    };
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        409,
        "The next question is already being prepared. Please try again",
      );
    }
    throw error;
  }
};

const buildClaim = (attempt, { answer, selectedOption, skipped }) => {
  const isMcq = attempt.format === "mcq";
  const text = answer?.trim();
  const hasAnswer = isMcq ? Number.isInteger(selectedOption) : Boolean(text);

  let status = "answered";
  if (hasExpired(attempt.askedAt, attempt.timeLimitSec)) status = "timed_out";
  else if (skipped || !hasAnswer) status = "skipped";

  const fields = {
    status,
    answeredAt: new Date(),
    timeTakenSec: Math.round(secondsSince(attempt.askedAt)),
  };
  if (status === "answered") {
    if (isMcq) fields.selectedOption = selectedOption;
    else fields.userAnswer = text;
  }
  return fields;
};

const gradeWithAi = async (attempt, interview) => {
  let review;
  try {
    review = await evaluateAnswer({
      company: interview.company,
      difficulty: interview.difficulty,
      question: attempt.question,
      format: attempt.format,
      topic: attempt.topic,
      idealAnswer: attempt.idealAnswer,
      answer: attempt.userAnswer,
      maxScore: attempt.maxScore,
    });
  } catch (error) {
    await Attempt.updateOne(
      { _id: attempt._id },
      {
        $set: { status: "asked" },
        $unset: { answeredAt: "", timeTakenSec: "", userAnswer: "" },
      },
    );
    throw error;
  }

  applyScore(attempt, review.score);
  attempt.feedback = review.feedback;
  if (attempt.isCorrect && review.followUpQuestion) {
    attempt.followUps.push({
      question: review.followUpQuestion,
      askedAt: new Date(),
    });
  }
};

const buildAnswerResult = (attempt, interview) => {
  const isMcq = attempt.format === "mcq";
  const followUp = getPendingFollowUp(attempt);

  return {
    attempt: {
      id: attempt._id,
      status: attempt.status,
      isCorrect: attempt.isCorrect,
      score: attempt.score,
      maxScore: attempt.maxScore,
      feedback: attempt.feedback,
      correctOption: isMcq ? attempt.correctOption : undefined,
      idealAnswer:
        isMcq || attempt.isCorrect !== true ? attempt.idealAnswer : undefined,
      followUp: followUp ? toClientFollowUp(followUp) : null,
    },
    progress: {
      answeredQuestions: interview.answeredQuestions,
      totalQuestions: interview.totalQuestions,
      progressPercent: interview.progressPercent,
      obtainedMarks: interview.obtainedMarks,
      totalMarks: interview.totalMarks,
    },
    canFinish: interview.answeredQuestions >= interview.totalQuestions,
  };
};

export const submitAnswer = async (interview, input) => {
  const open = await Attempt.findOne({
    interview: interview._id,
    status: "asked",
  });
  if (!open) throw new ApiError(409, "There is no open question");

  const claim = await Attempt.updateOne(
    { _id: open._id, status: "asked" },
    { $set: buildClaim(open, input) },
  );
  if (claim.modifiedCount === 0)
    throw new ApiError(409, "This question was already answered");

  const claimed = await Attempt.findById(open._id).select(
    "+correctOption +idealAnswer",
  );

  if (claimed.status !== "answered") {
    claimed.score = 0;
    claimed.feedback =
      claimed.status === "timed_out"
        ? "Time is up for this question."
        : "You skipped this question.";
  } else if (claimed.format === "mcq") {
    applyScore(
      claimed,
      claimed.selectedOption === claimed.correctOption ? claimed.maxScore : 0,
    );
  } else {
    await gradeWithAi(claimed, interview);
  }
  await claimed.save();

  const updatedInterview = await refreshProgress(interview);
  return buildAnswerResult(claimed, updatedInterview);
};

export const submitFollowUp = async (interview, { answer, skipped }) => {
  const attempt = await Attempt.findOne({
    interview: interview._id,
    status: "answered",
  })
    .sort({ order: -1 })
    .select("+idealAnswer");
  const pending = getPendingFollowUp(attempt);
  if (!pending) throw new ApiError(409, "No follow-up question is waiting");

  const text = answer?.trim();
  const isSkipped = skipped || !text;
  let nextFollowUp = null;

  if (isSkipped || hasExpired(pending.askedAt, FOLLOW_UP_TIME_LIMIT_SEC)) {
    pending.answer = "";
    pending.feedback = isSkipped
      ? "You skipped this follow-up."
      : "Time is up for this follow-up.";
  } else {
    const review = await reviewFollowUp({
      company: interview.company,
      question: attempt.question,
      idealAnswer: attempt.idealAnswer,
      followUp: pending.question,
      answer: text,
      canAskAnother: attempt.followUps.length < MAX_FOLLOW_UPS,
    });
    pending.answer = text;
    pending.feedback = review.feedback;
    if (review.nextFollowUp) {
      attempt.followUps.push({
        question: review.nextFollowUp,
        askedAt: new Date(),
      });
      nextFollowUp = toClientFollowUp(
        attempt.followUps[attempt.followUps.length - 1],
      );
    }
  }

  try {
    await attempt.save();
  } catch (error) {
    if (error.name === "VersionError") {
      throw new ApiError(409, "This follow-up was already answered");
    }
    throw error;
  }

  return { feedback: pending.feedback, followUp: nextFollowUp };
};

export const revealHint = async (interview) => {
  const open = await Attempt.findOne({
    interview: interview._id,
    status: "asked",
  }).select("+hint");
  if (!open) throw new ApiError(409, "There is no open question");
  if (hasExpired(open.askedAt, open.timeLimitSec)) {
    throw new ApiError(409, "Time is up for this question");
  }
  if (!open.hint)
    throw new ApiError(404, "No hint is available for this question");

  if (!open.hintUsed) {
    await Attempt.updateOne({ _id: open._id }, { $set: { hintUsed: true } });
  }
  return { hint: open.hint, penalty: HINT_PENALTY };
};
