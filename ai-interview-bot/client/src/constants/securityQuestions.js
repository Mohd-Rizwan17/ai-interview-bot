export const SECURITY_QUESTIONS = [
  { key: "food", label: "What is your favourite food?" },
  { key: "fruit", label: "What is your favourite fruit?" },
  { key: "car", label: "What is your favourite car?" },
  { key: "place", label: "What is your favourite place?" },
  { key: "color", label: "What is your favourite colour?" },
  { key: "movie", label: "What is your favourite movie?" },
  { key: "sport", label: "What is your favourite sport?" },
  { key: "animal", label: "What is your favourite animal?" },
];

export const getQuestionLabel = (key) =>
  SECURITY_QUESTIONS.find((question) => question.key === key)?.label ?? "";
