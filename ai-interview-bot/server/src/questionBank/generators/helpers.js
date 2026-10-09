import { shuffle } from "../../utils/random.js";

export const LEVELS = { easy: 0, medium: 1, hard: 2 };

export const rupees = (value) => `₹${value}`;

export const buildMcq = ({
  topic,
  difficulty,
  question,
  answer,
  wrong,
  explanation,
  hint,
}) => {
  const options = shuffle([answer, ...wrong.slice(0, 3)]);

  return {
    format: "mcq",
    difficulty,
    topic,
    question,
    options,
    correctOption: options.indexOf(answer),
    explanation,
    hint,
  };
};

export const buildNumeric = ({
  answer,
  step,
  traps = [],
  unit = (value) => String(value),
  ...rest
}) => {
  const wrong = [];

  const add = (value) => {
    if (value > 0 && value !== answer && !wrong.includes(value)) {
      wrong.push(value);
    }
  };

  traps.forEach(add);

  for (let i = 1; wrong.length < 3; i += 1) {
    add(answer + i * step);
    add(answer - i * step);
  }

  return buildMcq({
    ...rest,
    answer: unit(answer),
    wrong: wrong.slice(0, 3).map((value) => unit(value)),
  });
};

const questionKey = (question) =>
  `${question.question}|${[...question.options].sort().join(",")}`;

export const generateRound = (templates, difficulty, count) => {
  const order = shuffle(templates);
  const seen = new Set();
  const questions = [];

  for (let i = 0; i < count; i += 1) {
    const template = order[i % order.length];

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const question = template(difficulty);
      const key = questionKey(question);

      if (!seen.has(key)) {
        seen.add(key);
        questions.push(question);
        break;
      }
    }
  }

  return questions;
};
