import {
  APTITUDE_TOPICS,
  HR_TOPICS,
  MIXED_PATTERN,
  REASONING_TOPICS,
  TECHNICAL_TOPICS,
} from "../constants/topics.js";

const TECHNICAL_FORMATS = ["mcq", "practical", "descriptive"];

const pickTopic = (topics, usedTopics) => {
  const recent = usedTopics.slice(-2);
  const fresh = topics.filter((topic) => !recent.includes(topic));
  const pool = fresh.length > 0 ? fresh : topics;
  return pool[Math.floor(Math.random() * pool.length)];
};

export const planQuestion = (interview, order, usedTopics) => {
  const category =
    interview.type === "mixed"
      ? MIXED_PATTERN[(order - 1) % MIXED_PATTERN.length]
      : interview.type;

  if (category === "technical") {
    return {
      category,
      topic: pickTopic(TECHNICAL_TOPICS[interview.field], usedTopics),
      format: TECHNICAL_FORMATS[(order - 1) % TECHNICAL_FORMATS.length],
    };
  }

  if (category === "aptitude") {
    return {
      category,
      topic: pickTopic(APTITUDE_TOPICS, usedTopics),
      format: "mcq",
    };
  }

  if (category === "reasoning") {
    return {
      category,
      topic: pickTopic(REASONING_TOPICS, usedTopics),
      format: "mcq",
    };
  }

  return {
    category,
    topic: pickTopic(HR_TOPICS, usedTopics),
    format: "descriptive",
  };
};
