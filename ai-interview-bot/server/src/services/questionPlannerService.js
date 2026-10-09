import {
  MAX_SCORE_BY_FORMAT,
  QUESTIONS_PER_ROUND,
  ROUND_TITLES,
  TIME_LIMIT_BY_FORMAT,
} from "../constants/interview.js";
import { CustomQuestion } from "../models/CustomQuestion.js";
import { GENERATORS, QUESTION_BANK } from "../questionBank/index.js";
import { ApiError } from "../utils/ApiError.js";
import { shuffle } from "../utils/random.js";

const pickForRound = (key, difficulty) => {
  const generator = GENERATORS[key];

  if (generator) return generator(difficulty, QUESTIONS_PER_ROUND);

  const bank = QUESTION_BANK[key];

  if (!bank?.length) {
    throw new ApiError(
      501,
      `${ROUND_TITLES[key]} questions are not available yet`,
    );
  }

  const matching = shuffle(bank.filter((q) => q.difficulty === difficulty));
  const others = shuffle(bank.filter((q) => q.difficulty !== difficulty));

  return [...matching, ...others].slice(0, QUESTIONS_PER_ROUND);
};

const pickCustomQuestions = async (userId) => {
  const saved = await CustomQuestion.find({ user: userId }).lean();

  if (saved.length === 0) {
    throw new ApiError(
      400,
      "Add your own questions before starting the My Questions round",
    );
  }

  return shuffle(saved)
    .slice(0, QUESTIONS_PER_ROUND)
    .map((question) => ({
      ...question,
      keywords: question.keywords.map((keyword) => [keyword]),
    }));
};

export const pickQuestions = async (keys, difficulty, userId) => {
  const entries = await Promise.all(
    keys.map(async (key) => [
      key,
      key === "my-questions"
        ? await pickCustomQuestions(userId)
        : pickForRound(key, difficulty),
    ]),
  );

  return Object.fromEntries(entries);
};

export const buildAttempts = (interviewId, keys, questionsByRound) => {
  const attempts = [];
  let order = 0;

  keys.forEach((key) => {
    questionsByRound[key].forEach((question, index) => {
      order += 1;

      attempts.push({
        interview: interviewId,
        roundKey: key,
        order,
        roundOrder: index + 1,
        format: question.format,
        topic: question.topic,
        question: question.question,
        options: question.options,
        correctOption: question.correctOption,
        idealAnswer: question.idealAnswer,
        explanation: question.explanation,
        hint: question.hint,
        keywords: question.keywords,
        timeLimitSec: TIME_LIMIT_BY_FORMAT[question.format],
        maxScore: MAX_SCORE_BY_FORMAT[question.format],
      });
    });
  });

  return attempts;
};
