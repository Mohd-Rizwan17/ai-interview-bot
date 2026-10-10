export const INTERVIEW_ROUNDS = [
  "aptitude",
  "reasoning",
  "dsa",
  "javascript",
  "react",
  "html-css",
  "nodejs",
  "express",
  "mongodb",
  "frontend",
  "backend",
  "hr",
  "my-questions",
];

export const ALL_ROUNDS = [
  "aptitude",
  "reasoning",
  "dsa",
  "frontend",
  "backend",
];

export const ROUND_TITLES = {
  aptitude: "Aptitude",
  reasoning: "Reasoning",
  dsa: "DSA",
  javascript: "JavaScript",
  react: "React",
  "html-css": "HTML/CSS",
  nodejs: "Node.js",
  express: "Express",
  mongodb: "MongoDB",
  frontend: "Frontend",
  backend: "Backend",
  hr: "HR",
  "my-questions": "My Questions",
};

export const DIFFICULTIES = ["easy", "medium", "hard"];

export const INTERVIEW_STATUSES = [
  "in_progress",
  "completed",
  "incomplete",
  "ended_cheating",
];

export const QUESTION_FORMATS = ["mcq", "practical", "descriptive"];

export const ATTEMPT_STATUSES = [
  "pending",
  "asked",
  "answered",
  "timed_out",
  "skipped",
];

export const MAX_SCORE_BY_FORMAT = {
  mcq: 2,
  descriptive: 3,
  practical: 5,
};

export const TIME_LIMIT_BY_FORMAT = {
  mcq: 60,
  descriptive: 120,
  practical: 300,
};

export const HINT_PENALTY = 1;

export const CORRECT_THRESHOLD = 0.6;

export const QUESTIONS_PER_ROUND = 10;

export const MAX_CUSTOM_QUESTIONS = 50;

export const GRACE_SEC = 5;

export const RETENTION_OPTIONS = [3, 5, 7, 10, 20, 30];

export const DEFAULT_RETENTION_DAYS = 5;