import { pick, randInt } from "../../utils/random.js";
import { buildNumeric, generateRound, LEVELS, rupees } from "./helpers.js";

const PERCENTS = [
  [10, 20, 25, 50],
  [5, 15, 30, 40, 60],
  [12, 35, 45, 65, 75],
];

const PROFITS = [
  [10, 20, 25, 50],
  [5, 15, 30, 40],
  [12, 18, 35, 45],
];

const RATIOS = [
  [1, 2],
  [2, 3],
  [1, 3],
  [3, 5],
  [2, 5],
  [3, 4],
  [4, 5],
  [3, 7],
];

const WORK_PAIRS = [
  [10, 15, 6],
  [12, 24, 8],
  [20, 30, 12],
  [30, 45, 18],
  [12, 6, 4],
  [15, 30, 10],
  [18, 9, 6],
  [20, 5, 4],
  [24, 8, 6],
];

const percentOf = (difficulty) => {
  const level = LEVELS[difficulty];
  const percent = pick(PERCENTS[level]);
  const hundreds = randInt(2, 5 * (level + 1));
  const base = hundreds * 100;
  const answer = percent * hundreds;

  return buildNumeric({
    topic: "Percentage",
    difficulty,
    question: `What is ${percent}% of ${base}?`,
    answer,
    step: hundreds,
    traps: [base - answer, answer * 2],
    explanation: `${percent}% of ${base} = (${percent} ÷ 100) × ${base} = ${answer}.`,
    hint: "Find 1% first, then multiply.",
  });
};

const profitPercent = (difficulty) => {
  const level = LEVELS[difficulty];
  const profit = pick(PROFITS[level]);
  const hundreds = randInt(2, 6 * (level + 1));
  const cost = hundreds * 100;
  const gain = profit * hundreds;
  const selling = cost + gain;

  return buildNumeric({
    topic: "Profit and Loss",
    difficulty,
    question: `A shopkeeper buys a shirt for ₹${cost} and sells it for ₹${selling}. What is his profit percent?`,
    answer: profit,
    step: 5,
    traps: [profit * 2, Math.round((gain / selling) * 100)],
    unit: (value) => `${value}%`,
    explanation: `Profit = ${selling} − ${cost} = ${gain}. Profit % = (${gain} ÷ ${cost}) × 100 = ${profit}%.`,
    hint: "Profit percent is always calculated on the cost price.",
  });
};

const simpleInterest = (difficulty) => {
  const level = LEVELS[difficulty];
  const principal = 100 * randInt(5, 20 * (level + 1));
  const rate = pick([4, 5, 6, 8, 10]);
  const years = randInt(2, 3 + level * 2);
  const yearly = (principal * rate) / 100;
  const answer = yearly * years;

  return buildNumeric({
    topic: "Simple Interest",
    difficulty,
    question: `What is the simple interest on ₹${principal} at ${rate}% per year for ${years} years?`,
    answer,
    step: yearly,
    traps: [yearly, yearly * (years + 1)],
    unit: rupees,
    explanation: `SI = (P × R × T) ÷ 100 = (${principal} × ${rate} × ${years}) ÷ 100 = ₹${answer}.`,
    hint: "SI = P × R × T ÷ 100.",
  });
};

const speedDistanceTime = (difficulty) => {
  const level = LEVELS[difficulty];
  const speed = pick([30, 40, 45, 50, 60, 72]);
  const hours = randInt(2, 3 + level * 2);
  const distance = speed * hours;

  if (Math.random() < 0.5) {
    return buildNumeric({
      topic: "Speed, Distance and Time",
      difficulty,
      question: `A car travels at ${speed} km/h for ${hours} hours. How far does it travel?`,
      answer: distance,
      step: 10,
      traps: [speed + hours],
      unit: (value) => `${value} km`,
      explanation: `Distance = speed × time = ${speed} × ${hours} = ${distance} km.`,
      hint: "Distance = speed × time.",
    });
  }

  return buildNumeric({
    topic: "Speed, Distance and Time",
    difficulty,
    question: `A train covers ${distance} km in ${hours} hours at a constant speed. What is its speed?`,
    answer: speed,
    step: 5,
    traps: [distance - hours],
    unit: (value) => `${value} km/h`,
    explanation: `Speed = distance ÷ time = ${distance} ÷ ${hours} = ${speed} km/h.`,
    hint: "Speed = distance ÷ time.",
  });
};

const ratioShare = (difficulty) => {
  const level = LEVELS[difficulty];
  const [a, b] = pick(RATIOS);
  const part = 10 * randInt(1, 3 * (level + 1));
  const total = (a + b) * part;
  const answer = a * part;

  return buildNumeric({
    topic: "Ratio",
    difficulty,
    question: `₹${total} is divided between A and B in the ratio ${a}:${b}. How much does A get?`,
    answer,
    step: part,
    traps: [b * part, total / 2],
    unit: rupees,
    explanation: `Total parts = ${a} + ${b} = ${a + b}. One part = ${total} ÷ ${a + b} = ${part}. A gets ${a} × ${part} = ₹${answer}.`,
    hint: "Find the value of one part first.",
  });
};

const average = (difficulty) => {
  const level = LEVELS[difficulty];
  const max = 30 * (level + 1) + 20;
  const numbers = Array.from({ length: 4 }, () => randInt(10, max));
  const partial = numbers.reduce((sum, number) => sum + number, 0);
  const last = randInt(10, max);
  const fifth = last + ((5 - ((partial + last) % 5)) % 5);

  numbers.push(fifth);

  const sum = partial + fifth;
  const answer = sum / 5;

  return buildNumeric({
    topic: "Average",
    difficulty,
    question: `Find the average of ${numbers.join(", ")}.`,
    answer,
    step: 2,
    traps: [Math.round(sum / 4)],
    explanation: `Sum = ${sum}. Average = ${sum} ÷ 5 = ${answer}.`,
    hint: "Add all the numbers and divide by how many there are.",
  });
};

const timeAndWork = (difficulty) => {
  const [first, second, answer] = pick(WORK_PAIRS);
  const [a, b] = Math.random() < 0.5 ? [first, second] : [second, first];

  return buildNumeric({
    topic: "Time and Work",
    difficulty,
    question: `A can finish a work in ${a} days and B can finish it in ${b} days. In how many days will they finish it working together?`,
    answer,
    step: 1,
    traps: [Math.round((a + b) / 2), a + b, Math.abs(a - b)],
    unit: (value) => `${value} days`,
    explanation: `In one day A does 1/${a} and B does 1/${b} of the work. Together they do (${a} + ${b}) ÷ (${a} × ${b}) per day, so the work takes (${a} × ${b}) ÷ (${a} + ${b}) = ${answer} days.`,
    hint: "Add the work done by both in one day.",
  });
};

const sumAndDifference = (difficulty) => {
  const level = LEVELS[difficulty];
  const larger = randInt(20, 40 * (level + 1) + 20);
  const smaller = randInt(5, larger - 10);
  const sum = larger + smaller;
  const diff = larger - smaller;

  return buildNumeric({
    topic: "Number Problems",
    difficulty,
    question: `The sum of two numbers is ${sum} and their difference is ${diff}. What is the larger number?`,
    answer: larger,
    step: 2,
    traps: [smaller, Math.round(sum / 2)],
    explanation: `Larger number = (sum + difference) ÷ 2 = (${sum} + ${diff}) ÷ 2 = ${larger}.`,
    hint: "Adding the sum and the difference gives twice the larger number.",
  });
};

const TEMPLATES = [
  percentOf,
  profitPercent,
  simpleInterest,
  speedDistanceTime,
  ratioShare,
  average,
  timeAndWork,
  sumAndDifference,
];

export const generateAptitude = (difficulty, count) =>
  generateRound(TEMPLATES, difficulty, count);
