export const INTERVIEW_TYPES = [
  "technical",
  "aptitude",
  "reasoning",
  "hr",
  "mixed",
];
export const TYPES_WITH_FIELD = ["technical", "mixed"];
export const FIELDS = ["full-stack", "frontend", "backend"];
export const DIFFICULTIES = ["easy", "medium", "hard"];
export const INTERVIEW_STATUSES = [
  "in_progress",
  "completed",
  "incomplete",
  "ended_cheating",
];

export const QUESTION_FORMATS = ["mcq", "practical", "descriptive"];
export const QUESTION_SOURCES = ["ai", "pdf"];
export const ATTEMPT_STATUSES = ["asked", "answered", "timed_out", "skipped"];

export const ANSWER_GRACE_SEC = 5;
// export const MAX_FOLLOW_UPS = 2;

export const MAX_SCORE_BY_FORMAT = { mcq: 2, descriptive: 3, practical: 5 };
export const TIME_LIMIT_BY_FORMAT = {
  mcq: 60,
  descriptive: 120,
  practical: 300,
};
export const FOLLOW_UP_TIME_LIMIT_SEC = 90;
export const MAX_FOLLOW_UPS = 2;
export const HINT_PENALTY = 1;
export const CORRECT_THRESHOLD = 0.6;
export const GRACE_SEC = 5;
