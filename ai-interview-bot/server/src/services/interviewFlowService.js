import { GRACE_SEC, HINT_PENALTY } from "../constants/interview.js";
import { Attempt } from "../models/Attempt.js";
import { ApiError } from "../utils/ApiError.js";
import { refreshProgress } from "./interviewService.js";

const elapsedSec = (round) => (Date.now() - round.startedAt.getTime()) / 1000;

const secondsLeft = (round) =>
  Math.max(0, Math.ceil(round.timeLimitSec - elapsedSec(round)));

const getActiveRound = (interview) => {
  const round = interview.rounds[interview.currentRoundIndex];

  if (!round || round.status !== "in_progress") {
    throw new ApiError(409, "No round is in progress");
  }

  return round;
};

const assertRoundOpen = (round) => {
  if (elapsedSec(round) > round.timeLimitSec + GRACE_SEC) {
    throw new ApiError(409, "Time is up for this round");
  }
};

const findRoundAttempt = async (interview, round, attemptId, select) => {
  const query = Attempt.findOne({
    _id: attemptId,
    interview: interview._id,
    roundKey: round.key,
  });

  if (select) query.select(select);

  const attempt = await query;

  if (!attempt) {
    throw new ApiError(404, "Question not found in the current round");
  }

  return attempt;
};

const toClientQuestion = (attempt) => ({
  id: attempt._id,
  order: attempt.order,
  roundOrder: attempt.roundOrder,
  format: attempt.format,
  topic: attempt.topic,
  question: attempt.question,
  options: attempt.options,
  maxScore: attempt.maxScore,
  status: attempt.status,
  selectedOption: attempt.selectedOption,
  userAnswer: attempt.userAnswer,
  hintUsed: attempt.hintUsed,
  hint: attempt.hintUsed ? attempt.hint : undefined,
});

export const getCurrentRound = async (interview) => {
  const round = getActiveRound(interview);

  const attempts = await Attempt.find({
    interview: interview._id,
    roundKey: round.key,
  })
    .select("+hint")
    .sort({ roundOrder: 1 });

  return {
    round: {
      key: round.key,
      title: round.title,
      order: round.order,
      totalRounds: interview.rounds.length,
      isLastRound: round.order === interview.rounds.length,
      timeLimitSec: round.timeLimitSec,
      secondsLeft: secondsLeft(round),
      totalQuestions: round.totalQuestions,
    },
    questions: attempts.map(toClientQuestion),
  };
};

export const submitAnswer = async (
  interview,
  { attemptId, answer, selectedOption, skipped },
) => {
  const round = getActiveRound(interview);
  assertRoundOpen(round);

  const attempt = await findRoundAttempt(interview, round, attemptId);
  const isMcq = attempt.format === "mcq";
  const text = answer?.trim();

  if (isMcq && selectedOption >= attempt.options.length) {
    throw new ApiError(400, "Invalid option");
  }

  const answered =
    !skipped && (isMcq ? Number.isInteger(selectedOption) : Boolean(text));

  const $set = {
    status: answered ? "answered" : "skipped",
    answeredAt: new Date(),
  };
  const $unset = {};

  if (answered && isMcq) $set.selectedOption = selectedOption;
  else $unset.selectedOption = "";

  if (answered && !isMcq) $set.userAnswer = text;
  else $unset.userAnswer = "";

  await Attempt.updateOne({ _id: attempt._id }, { $set, $unset });

  const [updated, done] = await Promise.all([
    refreshProgress(interview),
    Attempt.countDocuments({
      interview: interview._id,
      roundKey: round.key,
      status: { $in: ["answered", "skipped"] },
    }),
  ]);

  return {
    attempt: { id: attempt._id, status: $set.status },
    roundProgress: { done, total: round.totalQuestions },
    progressPercent: updated.progressPercent,
  };
};

export const revealHint = async (interview, { attemptId }) => {
  const round = getActiveRound(interview);
  assertRoundOpen(round);

  const attempt = await findRoundAttempt(interview, round, attemptId, "+hint");

  if (!attempt.hint) {
    throw new ApiError(404, "No hint is available for this question");
  }

  if (!attempt.hintUsed) {
    await Attempt.updateOne({ _id: attempt._id }, { $set: { hintUsed: true } });
  }

  return {
    hint: attempt.hint,
    penalty: HINT_PENALTY,
  };
};
