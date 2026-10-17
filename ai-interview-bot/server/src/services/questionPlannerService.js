import {
  MAX_SCORE_BY_FORMAT,
  QUESTIONS_PER_ROUND,
  ROUND_TITLES,
  TIME_LIMIT_BY_FORMAT,
} from "../constants/interview.js";
import { pickProjectQuestion } from "../miniProject/projectBank.js";
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

const pickCustomQuestions = async (difficulty) => {
  const saved = await CustomQuestion.find({ difficulty }).lean();

  if (saved.length === 0) {
    throw new ApiError(
      400,
      `No ${difficulty} questions are available in My Questions yet`,
    );
  }

  return shuffle(saved)
    .slice(0, QUESTIONS_PER_ROUND)
    .map((question) => ({
      ...question,
      keywords: question.keywords.map((keyword) => [keyword]),
    }));
};

const pickForKey = async (key, difficulty, projectStack) => {
  if (key === "my-questions") return pickCustomQuestions(difficulty);

  if (key === "mini-project") {
    return [pickProjectQuestion(projectStack, difficulty)];
  }

  return pickForRound(key, difficulty);
};

export const pickQuestions = async (keys, difficulty, projectStack = "web") => {
  const entries = await Promise.all(
    keys.map(async (key) => [
      key,
      await pickForKey(key, difficulty, projectStack),
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
        project: question.project,
        timeLimitSec:
          question.projectTimeSec ?? TIME_LIMIT_BY_FORMAT[question.format],
        maxScore: MAX_SCORE_BY_FORMAT[question.format],
      });
    });
  });

  return attempts;
};
