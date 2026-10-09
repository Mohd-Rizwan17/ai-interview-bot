import { pick, randInt, shuffle } from "../../utils/random.js";
import { buildMcq, buildNumeric, generateRound, LEVELS } from "./helpers.js";

const WORDS = [
  "CAT",
  "DOG",
  "SUN",
  "BAT",
  "MAP",
  "PEN",
  "BOX",
  "FAN",
  "HEN",
  "JAR",
];

const DIRECTIONS = ["North", "East", "South", "West"];

const ODD_ONE_OUT = [
  {
    items: ["Apple", "Mango", "Banana", "Carrot"],
    answer: "Carrot",
    reason: "Carrot is a vegetable, the others are fruits.",
  },
  {
    items: ["Dog", "Cat", "Cow", "Eagle"],
    answer: "Eagle",
    reason: "Eagle is a bird, the others are mammals.",
  },
  {
    items: ["Circle", "Triangle", "Square", "Cube"],
    answer: "Cube",
    reason: "Cube is a 3D shape, the others are 2D shapes.",
  },
  {
    items: ["Python", "Java", "Linux", "C++"],
    answer: "Linux",
    reason:
      "Linux is an operating system, the others are programming languages.",
  },
  {
    items: ["Chrome", "Firefox", "Safari", "Windows"],
    answer: "Windows",
    reason: "Windows is an operating system, the others are web browsers.",
  },
  {
    items: ["2", "4", "16", "9"],
    answer: "9",
    reason: "9 is an odd number, the others are even.",
  },
];

const letterAt = (index) => String.fromCharCode(65 + index);

const ordinal = (value) => {
  const lastTwo = value % 100;
  const suffix =
    lastTwo >= 11 && lastTwo <= 13
      ? "th"
      : ({ 1: "st", 2: "nd", 3: "rd" }[value % 10] ?? "th");

  return `${value}${suffix}`;
};

const shiftWord = (word, shift) =>
  [...word]
    .map((char) =>
      String.fromCharCode(
        ((((char.charCodeAt(0) - 65 + shift) % 26) + 26) % 26) + 65,
      ),
    )
    .join("");

const SERIES = {
  arithmetic: () => {
    const start = randInt(2, 20);
    const diff = randInt(2, 9);

    return {
      terms: Array.from({ length: 5 }, (_, i) => start + i * diff),
      rule: `Each number increases by ${diff}.`,
    };
  },

  geometric: () => {
    const start = randInt(1, 4);
    const ratio = pick([2, 3]);

    return {
      terms: Array.from({ length: 5 }, (_, i) => start * ratio ** i),
      rule: `Each number is multiplied by ${ratio}.`,
    };
  },

  squares: () => {
    const first = randInt(2, 8);

    return {
      terms: Array.from({ length: 5 }, (_, i) => (first + i) ** 2),
      rule: `These are the squares of consecutive numbers, starting from ${first}.`,
    };
  },

  cubes: () => {
    const first = randInt(1, 4);

    return {
      terms: Array.from({ length: 5 }, (_, i) => (first + i) ** 3),
      rule: `These are the cubes of consecutive numbers, starting from ${first}.`,
    };
  },

  growing: () => {
    const terms = [randInt(1, 10)];
    const diff = randInt(1, 4);
    const growth = randInt(1, 3);

    for (let i = 0; i < 4; i += 1) {
      terms.push(terms[i] + diff + i * growth);
    }

    const jumps = [0, 1, 2, 3].map((i) => `+${diff + i * growth}`).join(", ");

    return {
      terms,
      rule: `The difference grows by ${growth} each time: ${jumps}.`,
    };
  },
};

const SERIES_BY_LEVEL = [
  ["arithmetic", "geometric"],
  ["geometric", "squares", "growing"],
  ["squares", "cubes", "growing"],
];

const numberSeries = (difficulty) => {
  const { terms, rule } = SERIES[pick(SERIES_BY_LEVEL[LEVELS[difficulty]])]();
  const answer = terms[4];

  return buildNumeric({
    topic: "Number Series",
    difficulty,
    question: `Find the next number in the series: ${terms.slice(0, 4).join(", ")}, ?`,
    answer,
    step: Math.max(2, Math.round(answer / 10)),
    traps: [terms[3] + (terms[3] - terms[2])],
    explanation: `${rule} So the next number is ${answer}.`,
    hint: "Look at how each number changes from the one before it.",
  });
};

const letterSeries = (difficulty) => {
  const level = LEVELS[difficulty];
  const step = pick([[2], [2, 3], [3, 4]][level]);
  const start = randInt(0, 6);
  const shown = Array.from({ length: 4 }, (_, i) => letterAt(start + i * step));
  const answerIndex = start + 4 * step;

  return buildMcq({
    topic: "Letter Series",
    difficulty,
    question: `Which letter comes next in the series: ${shown.join(", ")}, ?`,
    answer: letterAt(answerIndex),
    wrong: [answerIndex + 1, answerIndex - 1, answerIndex + 2].map(letterAt),
    explanation: `Every letter moves ${step} places forward in the alphabet, so the next letter is ${letterAt(answerIndex)}.`,
    hint: "Count the positions between two letters.",
  });
};

const codingDecoding = (difficulty) => {
  const level = LEVELS[difficulty];
  const shift = pick([[1], [2, 3], [3, 4, 5]][level]);
  const [word, target] = shuffle(WORDS);
  const code = shiftWord(word, shift);
  const answer = shiftWord(target, shift);

  return buildMcq({
    topic: "Coding-Decoding",
    difficulty,
    question: `In a certain code, ${word} is written as ${code}. How will ${target} be written in that code?`,
    answer,
    wrong: [shift + 1, shift + 2, -shift].map((wrongShift) =>
      shiftWord(target, wrongShift),
    ),
    explanation: `Every letter moves ${shift} place${shift > 1 ? "s" : ""} forward in the alphabet (${word[0]} becomes ${code[0]}). So ${target} becomes ${answer}.`,
    hint: "Compare the first letter of the word with the first letter of its code.",
  });
};

const directionSense = (difficulty) => {
  const level = LEVELS[difficulty];
  const turns = Array.from({ length: level + 3 }, () =>
    pick(["right", "left"]),
  );
  const path = [randInt(0, 3)];

  turns.forEach((turn) => {
    const current = path[path.length - 1];
    path.push((current + (turn === "right" ? 1 : 3)) % 4);
  });

  const answer = DIRECTIONS[path[path.length - 1]];

  return buildMcq({
    topic: "Direction Sense",
    difficulty,
    question: `Ravi is facing ${DIRECTIONS[path[0]]}. He turns ${turns.join(", then ")} (each turn is 90°). Which direction is he facing now?`,
    answer,
    wrong: DIRECTIONS.filter((direction) => direction !== answer),
    explanation: `Step by step: ${path.map((index) => DIRECTIONS[index]).join(" → ")}. He faces ${answer}.`,
    hint: "Turning right from North gives East. Turning left from North gives West.",
  });
};

const rowPosition = (difficulty) => {
  const level = LEVELS[difficulty];
  const total = randInt(15, 25 + level * 10);
  const fromLeft = randInt(3, total - 3);
  const answer = total - fromLeft + 1;

  return buildNumeric({
    topic: "Ranking",
    difficulty,
    question: `In a row of ${total} students, Priya is ${ordinal(fromLeft)} from the left. What is her position from the right?`,
    answer,
    step: 1,
    traps: [total - fromLeft, fromLeft],
    unit: ordinal,
    explanation: `Position from right = total − position from left + 1 = ${total} − ${fromLeft} + 1 = ${answer}.`,
    hint: "Do not forget to count Priya herself.",
  });
};

const oddOneOut = (difficulty) => {
  const { items, answer, reason } = pick(ODD_ONE_OUT);

  return buildMcq({
    topic: "Odd One Out",
    difficulty,
    question: "Which one is the odd one out?",
    answer,
    wrong: items.filter((item) => item !== answer),
    explanation: reason,
    hint: "Find what three of the four have in common.",
  });
};

const TEMPLATES = [
  numberSeries,
  letterSeries,
  codingDecoding,
  directionSense,
  rowPosition,
  oddOneOut,
];

export const generateReasoning = (difficulty, count) =>
  generateRound(TEMPLATES, difficulty, count);
