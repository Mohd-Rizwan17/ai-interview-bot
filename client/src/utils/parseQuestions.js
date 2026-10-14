const MIN_QUESTION = 10;
const MAX_QUESTION = 1000;
const MAX_OPTION = 200;
const MAX_TOPIC = 50;
const MAX_HINT = 300;
const MAX_EXPLANATION = 2000;
const LETTERS = "ABCD";

const QUESTION_LINE = /^(\d+)\.\s+(?:\[([^\]]+)\]\s*)?(.*)$/;
const OPTION_LINE = /^([A-D])[.)]\s*(.*)$/;
const ANSWER_KEY_HEADER = /^answer\s*key$/i;
const HINTS_HEADER = /^hints?\s*(?:&|and)\s*explanations?$/i;
const HINT_LINE = /^(\d+)\.\s*answer:\s*([A-D])\b\s*(?:[—–-]+\s*(.*))?$/i;
const EXPLANATION_LINE = /^explanation:\s*(.*)$/i;
const KEY_ENTRY = /(\d+)\.\s*([A-D])\b/gi;
const PAGE_MARK = /\bpage\s+\d+(?:\s+of\s+\d+)?$/i;
const PAGE_ONLY = /^page\s+\d+(?:\s+of\s+\d+)?$/i;

const joinText = (first, second) => `${first} ${second}`.trim();

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const stripPageNoise = (text) => {
  const lines = text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => !PAGE_ONLY.test(line));
  const prefixes = new Set(
    lines
      .filter((line) => PAGE_MARK.test(line))
      .map((line) => line.replace(PAGE_MARK, "").trim())
      .filter(Boolean),
  );
  let result = lines.join("\n");

  prefixes.forEach((prefix) => {
    const pattern = new RegExp(
      `${escapeRegex(prefix)}\\s*page\\s+\\d+(?:\\s+of\\s+\\d+)?`,
      "gi",
    );

    if ((result.match(pattern) ?? []).length >= 2) {
      result = result.replace(pattern, "\n");
    }
  });

  return result;
};

const splitSections = (lines) => {
  const sections = { questions: [], key: [], hints: [] };
  let current = "questions";

  lines.forEach((line) => {
    if (ANSWER_KEY_HEADER.test(line)) current = "key";
    else if (HINTS_HEADER.test(line)) current = "hints";
    else sections[current].push(line);
  });

  return sections;
};

const parseQuestionLines = (lines) => {
  const questions = [];
  let current = null;
  let lastNumber = 0;

  lines.forEach((line) => {
    const start = line.match(QUESTION_LINE);

    if (start && Number(start[1]) > lastNumber) {
      lastNumber = Number(start[1]);
      current = {
        number: lastNumber,
        topic: start[2]?.trim() ?? "",
        question: start[3].trim(),
        options: [],
      };
      questions.push(current);
      return;
    }

    if (!current) return;

    const option = line.match(OPTION_LINE);

    if (option && option[1] === LETTERS[current.options.length]) {
      current.options.push(option[2].trim());
      return;
    }

    if (current.options.length > 0) {
      const last = current.options.length - 1;

      current.options[last] = joinText(current.options[last], line);
    } else {
      current.question = joinText(current.question, line);
    }
  });

  return questions;
};

const parseKey = (lines) =>
  new Map(
    [...lines.join(" ").matchAll(KEY_ENTRY)].map((match) => [
      Number(match[1]),
      match[2].toUpperCase(),
    ]),
  );

const parseHints = (lines) => {
  const hints = new Map();
  let current = null;
  let field = "hint";

  lines.forEach((line) => {
    const start = line.match(HINT_LINE);

    if (start) {
      current = {
        letter: start[2].toUpperCase(),
        hint: start[3]?.trim() ?? "",
        explanation: "",
      };
      hints.set(Number(start[1]), current);
      field = "hint";
      return;
    }

    if (!current) return;

    const explanation = line.match(EXPLANATION_LINE);

    if (explanation) {
      current.explanation = explanation[1].trim();
      field = "explanation";
      return;
    }

    current[field] = joinText(current[field], line);
  });

  return hints;
};

export const draftIssues = (draft) => {
  const issues = [];
  const question = draft.question.trim();

  if (question.length < MIN_QUESTION) {
    issues.push(`Question must be at least ${MIN_QUESTION} characters`);
  }

  if (question.length > MAX_QUESTION) {
    issues.push(`Question must be at most ${MAX_QUESTION} characters`);
  }

  if (draft.options.length !== 4) {
    issues.push(`Found ${draft.options.length} options, 4 are needed`);
  }

  if (draft.options.some((option) => !option.trim())) {
    issues.push("An option is empty");
  }

  if (draft.options.some((option) => option.trim().length > MAX_OPTION)) {
    issues.push(`Each option must be at most ${MAX_OPTION} characters`);
  }

  if (
    !Number.isInteger(draft.correctOption) ||
    draft.correctOption >= draft.options.length
  ) {
    issues.push("Choose the correct option");
  }

  if (draft.topic.trim().length > MAX_TOPIC) {
    issues.push(`Topic must be at most ${MAX_TOPIC} characters`);
  }

  if (draft.hint.trim().length > MAX_HINT) {
    issues.push(`Hint must be at most ${MAX_HINT} characters`);
  }

  if (draft.explanation.trim().length > MAX_EXPLANATION) {
    issues.push(`Explanation must be at most ${MAX_EXPLANATION} characters`);
  }

  return issues;
};

const buildDraft = (question, keyLetter, hint) => {
  const hintLetter = hint?.letter;
  const hasConflict = keyLetter && hintLetter && keyLetter !== hintLetter;
  const letter = hasConflict ? null : (keyLetter ?? hintLetter);

  const draft = {
    id: `import-${question.number}`,
    number: question.number,
    format: "mcq",
    topic: question.topic,
    question: question.question,
    options: question.options,
    correctOption: letter ? LETTERS.indexOf(letter) : null,
    hint: hint?.hint ?? "",
    explanation: hint?.explanation ?? "",
  };

  const issues = draftIssues(draft);

  if (hasConflict) {
    issues.unshift(
      `Answer key says ${keyLetter}, hints section says ${hintLetter}`,
    );
  }

  return { ...draft, issues };
};

export const parseQuestions = (rawText) => {
  const lines = stripPageNoise(rawText.replace(/\r/g, ""))
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const sections = splitSections(lines);
  const answers = parseKey(sections.key);
  const hints = parseHints(sections.hints);

  return parseQuestionLines(sections.questions).map((question) =>
    buildDraft(
      question,
      answers.get(question.number),
      hints.get(question.number),
    ),
  );
};
