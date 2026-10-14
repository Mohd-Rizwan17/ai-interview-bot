import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCustomQuestion } from "../store/customQuestionSlice.js";

const LETTERS = ["A", "B", "C", "D"];

const FORMATS = [
  { key: "mcq", label: "MCQ" },
  { key: "practical", label: "Practical" },
  { key: "descriptive", label: "Descriptive" },
];

const MAX_KEYWORDS = 10;
const MAX_KEYWORD_LENGTH = 40;

const inputClass =
  "w-full rounded-md border border-line bg-ground px-3 py-2 text-sm text-ink placeholder:text-muted";

const initialForm = {
  format: "mcq",
  topic: "",
  question: "",
  options: ["", "", "", ""],
  correctOption: null,
  idealAnswer: "",
  keywords: "",
  hint: "",
  explanation: "",
};

const parseKeywords = (text) => [
  ...new Set(
    text
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
  ),
];

const keywordProblem = (keywords) => {
  if (keywords.length > MAX_KEYWORDS) {
    return `Use at most ${MAX_KEYWORDS} keywords`;
  }

  if (keywords.some((keyword) => keyword.length > MAX_KEYWORD_LENGTH)) {
    return `Each keyword must be at most ${MAX_KEYWORD_LENGTH} characters`;
  }

  return null;
};

const CustomQuestionForm = ({ onDone, onCancel }) => {
  const dispatch = useDispatch();
  const { busy, actionError } = useSelector((state) => state.customQuestions);
  const [form, setForm] = useState(initialForm);
  const isMcq = form.format === "mcq";
  const keywords = parseKeywords(form.keywords);
  const keywordError = keywordProblem(keywords);

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const setOption = (index, value) => {
    setField(
      "options",
      form.options.map((option, i) => (i === index ? value : option)),
    );
  };

  const hasValidBody = isMcq
    ? form.options.every((option) => option.trim()) &&
      form.correctOption !== null
    : form.idealAnswer.trim().length >= 10 &&
      keywords.length >= 1 &&
      !keywordError;
  const canSubmit = form.question.trim().length >= 10 && hasValidBody;

  const buildPayload = () => {
    const common = {
      format: form.format,
      topic: form.topic.trim(),
      question: form.question.trim(),
      hint: form.hint.trim(),
      explanation: form.explanation.trim(),
    };

    if (isMcq) {
      return {
        ...common,
        options: form.options.map((option) => option.trim()),
        correctOption: form.correctOption,
      };
    }

    return { ...common, idealAnswer: form.idealAnswer.trim(), keywords };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await dispatch(createCustomQuestion(buildPayload()));

    if (createCustomQuestion.fulfilled.match(result)) onDone();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-line bg-panel p-5"
    >
      <h2 className="text-lg font-semibold">Add a question</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {FORMATS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setField("format", key)}
            aria-pressed={form.format === key}
            className={`rounded-md border px-4 py-2 text-sm ${
              form.format === key
                ? "border-accent text-accent"
                : "border-line text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label htmlFor="cq-topic" className="mt-4 block text-sm text-muted">
        Topic (optional)
      </label>
      <input
        id="cq-topic"
        value={form.topic}
        onChange={(event) => setField("topic", event.target.value)}
        maxLength={50}
        placeholder="Custom"
        className={`${inputClass} mt-1`}
      />

      <label htmlFor="cq-question" className="mt-4 block text-sm text-muted">
        Question
      </label>
      <textarea
        id="cq-question"
        value={form.question}
        onChange={(event) => setField("question", event.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="At least 10 characters"
        className={`${inputClass} mt-1 resize-y`}
      />

      {isMcq ? (
        <fieldset className="mt-4">
          <legend className="text-sm text-muted">
            Options (select the correct one)
          </legend>
          <div className="mt-2 flex flex-col gap-2">
            {form.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correctOption"
                  aria-label={`Option ${LETTERS[index]} is correct`}
                  checked={form.correctOption === index}
                  onChange={() => setField("correctOption", index)}
                />
                <span className="font-mono text-sm text-muted">
                  {LETTERS[index]}
                </span>
                <input
                  value={option}
                  onChange={(event) => setOption(index, event.target.value)}
                  maxLength={200}
                  aria-label={`Option ${LETTERS[index]}`}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </fieldset>
      ) : (
        <>
          <label htmlFor="cq-ideal" className="mt-4 block text-sm text-muted">
            Model answer
          </label>
          <textarea
            id="cq-ideal"
            value={form.idealAnswer}
            onChange={(event) => setField("idealAnswer", event.target.value)}
            maxLength={3000}
            rows={6}
            spellCheck={false}
            placeholder="At least 10 characters"
            className={`${inputClass} mt-1 resize-y font-mono`}
          />

          <label
            htmlFor="cq-keywords"
            className="mt-4 block text-sm text-muted"
          >
            Keywords (comma separated)
          </label>
          <input
            id="cq-keywords"
            value={form.keywords}
            onChange={(event) => setField("keywords", event.target.value)}
            placeholder="parent, read-only, re-render"
            aria-describedby="cq-keywords-hint"
            className={`${inputClass} mt-1`}
          />
          <p id="cq-keywords-hint" className="mt-1 text-xs text-muted">
            Score = keywords found in the answer ÷ total keywords. Keep 3 to 5
            important ones. {keywords.length} / {MAX_KEYWORDS} added.
          </p>
          {keywordError && (
            <p role="alert" className="mt-1 text-xs text-danger">
              {keywordError}
            </p>
          )}
        </>
      )}

      <label htmlFor="cq-hint" className="mt-4 block text-sm text-muted">
        Hint (optional)
      </label>
      <input
        id="cq-hint"
        value={form.hint}
        onChange={(event) => setField("hint", event.target.value)}
        maxLength={300}
        className={`${inputClass} mt-1`}
      />

      <label htmlFor="cq-explanation" className="mt-4 block text-sm text-muted">
        Explanation (optional, shown in the review)
      </label>
      <textarea
        id="cq-explanation"
        value={form.explanation}
        onChange={(event) => setField("explanation", event.target.value)}
        maxLength={2000}
        rows={3}
        className={`${inputClass} mt-1 resize-y`}
      />

      {actionError && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {actionError}
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={!canSubmit || busy}
          className="rounded-md bg-accent px-5 py-2 font-semibold text-ground disabled:opacity-60"
        >
          {busy ? "Saving..." : "Save question"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-md border border-line px-5 py-2 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CustomQuestionForm;
