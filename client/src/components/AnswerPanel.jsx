import { useState } from "react";
import CodeAnswerBox from "./CodeAnswerBox.jsx";
import McqOptions from "./McqOptions.jsx";

const AnswerPanel = ({ question, isSubmitting, error, onSubmit }) => {
  const isMcq = question.format === "mcq";
  const [option, setOption] = useState(question.selectedOption ?? null);
  const [text, setText] = useState(question.userAnswer ?? "");
  const canSubmit = isMcq ? option !== null : text.trim().length > 0;

  const handleSubmit = () => {
    onSubmit(isMcq ? { selectedOption: option } : { answer: text });
  };

  return (
    <section className="flex flex-col gap-4 p-6">
      {isMcq ? (
        <McqOptions
          options={question.options}
          selected={option}
          onSelect={setOption}
        />
      ) : (
        <CodeAnswerBox value={text} onChange={setText} />
      )}

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="rounded-md bg-accent px-6 py-2 font-semibold text-ground disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        {question.status === "answered" && (
          <p className="text-sm text-muted">
            Saved. You can change it until you submit the round.
          </p>
        )}
      </div>
    </section>
  );
};

export default AnswerPanel;
