import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DIFFICULTIES } from "../constants/rounds.js";
import { importCustomQuestions } from "../store/customQuestionSlice.js";
import { draftIssues, draftToPayload } from "../utils/parseQuestions.js";

const MAX_QUESTIONS = 200;
const LETTERS = ["A", "B", "C", "D"];

const inputClass =
  "w-full rounded-md border border-line bg-ground/40 px-3 py-2 text-sm text-ink placeholder:text-muted";

const normalize = (text) => text.trim().toLowerCase().replace(/\s+/g, " ");

const DifficultyButtons = ({ isActive, onSelect }) => (
  <div className="mt-2 flex gap-2">
    {DIFFICULTIES.map((level) => (
      <button
        key={level}
        type="button"
        onClick={() => onSelect(level)}
        aria-pressed={isActive(level)}
        className={`rounded-md border px-4 py-2 text-sm capitalize ${
          isActive(level)
            ? "border-accent text-accent"
            : "border-line text-muted"
        }`}
      >
        {level}
      </button>
    ))}
  </div>
);

const DraftEditor = ({ draft, onChange, onClose }) => {
  const fieldId = (name) => `${draft.id}-${name}`;

  const setOption = (index, value) => {
    onChange({
      options: LETTERS.map((_, i) =>
        i === index ? value : (draft.options[i] ?? ""),
      ),
    });
  };

  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="text-xs text-muted">Difficulty</p>
      <DifficultyButtons
        isActive={(level) => draft.difficulty === level}
        onSelect={(level) => onChange({ difficulty: level })}
      />

      <label
        htmlFor={fieldId("topic")}
        className="mt-3 block text-xs text-muted"
      >
        Topic
      </label>
      <input
        id={fieldId("topic")}
        value={draft.topic}
        onChange={(event) => onChange({ topic: event.target.value })}
        maxLength={50}
        className={`${inputClass} mt-1`}
      />

      <label
        htmlFor={fieldId("question")}
        className="mt-3 block text-xs text-muted"
      >
        Question
      </label>
      <textarea
        id={fieldId("question")}
        value={draft.question}
        onChange={(event) => onChange({ question: event.target.value })}
        maxLength={1000}
        rows={3}
        className={`${inputClass} mt-1 resize-y`}
      />

      <fieldset className="mt-3">
        <legend className="text-xs text-muted">
          Options (select the correct one)
        </legend>
        <div className="mt-1 flex flex-col gap-2">
          {LETTERS.map((letter, index) => (
            <div key={letter} className="flex items-center gap-3">
              <input
                type="radio"
                name={fieldId("correct")}
                aria-label={`Option ${letter} is correct`}
                checked={draft.correctOption === index}
                onChange={() => onChange({ correctOption: index })}
              />
              <span className="font-mono text-xs text-muted">{letter}</span>
              <input
                value={draft.options[index] ?? ""}
                onChange={(event) => setOption(index, event.target.value)}
                maxLength={200}
                aria-label={`Option ${letter}`}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <label
        htmlFor={fieldId("hint")}
        className="mt-3 block text-xs text-muted"
      >
        Hint
      </label>
      <input
        id={fieldId("hint")}
        value={draft.hint}
        onChange={(event) => onChange({ hint: event.target.value })}
        maxLength={300}
        className={`${inputClass} mt-1`}
      />

      <label
        htmlFor={fieldId("explanation")}
        className="mt-3 block text-xs text-muted"
      >
        Explanation
      </label>
      <textarea
        id={fieldId("explanation")}
        value={draft.explanation}
        onChange={(event) => onChange({ explanation: event.target.value })}
        maxLength={2000}
        rows={3}
        className={`${inputClass} mt-1 resize-y`}
      />

      <button
        type="button"
        onClick={onClose}
        className="mt-3 rounded-md border border-line px-3 py-1 text-sm"
      >
        Done editing
      </button>
    </div>
  );
};

const ImportReview = ({
  initialDrafts,
  defaultDifficulty,
  isDetected,
  source,
  onDone,
}) => {
  const dispatch = useDispatch();
  const { items, busy } = useSelector((state) => state.customQuestions);
  const savedQuestions = new Set(items.map((item) => normalize(item.question)));
  const slots = Math.max(0, MAX_QUESTIONS - items.length);
  const isDuplicate = (draft) => savedQuestions.has(normalize(draft.question));
  const isReady = (draft) => draft.issues.length === 0 && !isDuplicate(draft);

  const [drafts, setDrafts] = useState(() =>
    initialDrafts.map((draft) => ({ ...draft, difficulty: defaultDifficulty })),
  );
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(
    () =>
      new Set(
        initialDrafts
          .filter(isReady)
          .slice(0, slots)
          .map((draft) => draft.id),
      ),
  );

  const chosen = drafts.filter(
    (draft) => selected.has(draft.id) && isReady(draft),
  );
  const readyCount = drafts.filter(isReady).length;

  const toggle = (id) => {
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  };

  const selectAllReady = () => {
    setSelected(
      new Set(
        drafts
          .filter(isReady)
          .slice(0, slots)
          .map((draft) => draft.id),
      ),
    );
  };

  const updateDraft = (id, patch) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === id
          ? { ...draft, ...patch, issues: draftIssues({ ...draft, ...patch }) }
          : draft,
      ),
    );
  };

  const setAllDifficulty = (level) => {
    setDrafts((current) =>
      current.map((draft) => ({ ...draft, difficulty: level })),
    );
  };

  const handleSave = async () => {
    setError(null);

    const result = await dispatch(
      importCustomQuestions(
        chosen.map((draft) => ({
          id: draft.id,
          payload: draftToPayload(draft, source),
        })),
      ),
    );
    const { saved, failed } = result.payload;
    const savedIds = new Set(saved.map((item) => item.id));

    if (!failed) {
      onDone();
      return;
    }

    const failedDraft = drafts.find((draft) => draft.id === failed.id);

    setDrafts((current) => current.filter((draft) => !savedIds.has(draft.id)));
    setSelected(
      (current) => new Set([...current].filter((id) => !savedIds.has(id))),
    );
    setError(
      `Question ${failedDraft?.number} could not be saved: ${failed.message}. ${saved.length} saved before it.`,
    );
  };

  return (
    <div className="mt-4">
      <p className="text-sm">
        Found <span className="font-mono">{initialDrafts.length}</span>{" "}
        questions · <span className="font-mono text-ok">{readyCount}</span>{" "}
        ready ·{" "}
        <span className="font-mono text-danger">
          {drafts.length - readyCount}
        </span>{" "}
        need fixing or already saved
      </p>

      {slots === 0 ? (
        <p className="mt-2 text-sm text-warn">
          Your list is full. Delete a question to import new ones.
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted">
          {chosen.length} selected · {slots} slot{slots > 1 ? "s" : ""} left
        </p>
      )}

      <p className="mt-4 text-sm text-muted">
        Difficulty for all questions
        {isDetected && ` (detected in the PDF: ${defaultDifficulty})`}
      </p>
      <DifficultyButtons
        isActive={(level) =>
          drafts.every((draft) => draft.difficulty === level)
        }
        onSelect={setAllDifficulty}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={selectAllReady}
          disabled={busy}
          className="rounded-md border border-line px-3 py-1 text-sm disabled:opacity-60"
        >
          Select all ready
        </button>
        <button
          type="button"
          onClick={() => setSelected(new Set())}
          disabled={busy || selected.size === 0}
          className="rounded-md border border-line px-3 py-1 text-sm disabled:opacity-60"
        >
          Clear
        </button>
      </div>

      <ul className="mt-3 flex max-h-[32rem] flex-col gap-3 overflow-y-auto">
        {drafts.map((draft) => {
          const ready = isReady(draft);
          const isChecked = selected.has(draft.id) && ready;
          const isFull = !isChecked && chosen.length >= slots;

          return (
            <li
              key={draft.id}
              className="rounded-md border border-line bg-ground p-3 text-sm"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={!ready || busy || isFull}
                  onChange={() => toggle(draft.id)}
                  aria-label={`Include question ${draft.number}`}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-muted">
                    Q{draft.number}
                    {draft.topic && ` · ${draft.topic}`} ·{" "}
                    <span className="capitalize">{draft.difficulty}</span>
                  </p>
                  <p className="mt-1">{draft.question}</p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {draft.options.map((option, index) => (
                      <li
                        key={index}
                        className={
                          index === draft.correctOption
                            ? "text-ok"
                            : "text-muted"
                        }
                      >
                        {LETTERS[index]}. {option}
                        {index === draft.correctOption && " ✓"}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-muted">
                    Hint: {draft.hint ? "yes" : "no"} · Explanation:{" "}
                    {draft.explanation ? "yes" : "no"}
                  </p>
                  {isDuplicate(draft) && (
                    <p className="mt-1 text-xs text-warn">
                      Already in My Questions
                    </p>
                  )}
                  {draft.issues.map((issue) => (
                    <p key={issue} className="mt-1 text-xs text-danger">
                      {issue}
                    </p>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingId(editingId === draft.id ? null : draft.id)
                  }
                  disabled={busy}
                  className="shrink-0 rounded-md border border-line px-3 py-1 text-xs disabled:opacity-60"
                >
                  {editingId === draft.id ? "Close" : "Edit"}
                </button>
              </div>

              {editingId === draft.id && (
                <DraftEditor
                  draft={draft}
                  onChange={(patch) => updateDraft(draft.id, patch)}
                  onClose={() => setEditingId(null)}
                />
              )}
            </li>
          );
        })}
      </ul>

      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={chosen.length === 0 || busy}
        className="mt-4 rounded-md bg-accent px-5 py-2 font-semibold text-ground disabled:opacity-60"
      >
        {busy ? "Saving..." : `Save selected (${chosen.length})`}
      </button>
    </div>
  );
};

export default ImportReview;
