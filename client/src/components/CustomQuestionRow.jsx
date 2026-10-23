import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteCustomQuestion } from "../store/customQuestionSlice.js";
import ConfirmModal from "./ConfirmModal.jsx";

const LETTERS = ["A", "B", "C", "D"];

const FORMAT_LABELS = {
  mcq: "MCQ",
  practical: "Practical",
  descriptive: "Descriptive",
};

const CustomQuestionRow = ({ question }) => {
  const dispatch = useDispatch();
  const busy = useSelector((state) => state.customQuestions.busy);
  const [isConfirming, setIsConfirming] = useState(false);
  const isMcq = question.format === "mcq";

  const handleDelete = async () => {
    await dispatch(deleteCustomQuestion(question._id));
    setIsConfirming(false);
  };

  return (
    <article className="rounded-xl border border-line bg-panel p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-line px-2 py-1 text-muted">
          {FORMAT_LABELS[question.format]}
        </span>
        <span className="rounded-full border border-line px-2 py-1 capitalize text-muted">
          {question.difficulty}
        </span>
        <span className="rounded-full border border-line px-2 py-1 text-muted">
          {question.topic}
        </span>
      </div>

      <h2 className="mt-3 whitespace-pre-wrap leading-relaxed">
        {question.question}
      </h2>

      {isMcq ? (
        <ul className="mt-3 flex flex-col gap-2">
          {question.options.map((option, index) => {
            const isCorrect = index === question.correctOption;

            return (
              <li
                key={index}
                className={`flex items-start gap-3 rounded-md border p-2 text-sm ${
                  isCorrect ? "border-ok" : "border-line"
                }`}
              >
                <span className="font-mono text-muted">{LETTERS[index]}</span>
                <span className="flex-1">{option}</span>
                {isCorrect && (
                  <span className="text-xs font-semibold text-ok">Correct</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-3">
          <p className="text-xs uppercase tracking-wide text-muted">
            Model answer
          </p>
          <p className="mt-1 whitespace-pre-wrap rounded-md border border-line bg-ground p-3 font-mono text-sm">
            {question.idealAnswer}
          </p>
          <p className="mt-2 text-xs text-muted">
            Keywords: {question.keywords.join(", ")}
          </p>
        </div>
      )}

      <div className="mt-3 flex justify-end border-t border-line pt-2">
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          disabled={busy}
          className="text-sm text-danger disabled:opacity-50"
        >
          Delete
        </button>
      </div>

      {isConfirming && (
        <ConfirmModal
          title="Delete this question?"
          message="This cannot be undone."
          busy={busy}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </article>
  );
};

export default CustomQuestionRow;
