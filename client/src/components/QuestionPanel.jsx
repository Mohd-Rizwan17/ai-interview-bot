const FORMAT_LABELS = {
  mcq: "MCQ",
  practical: "Practical",
  descriptive: "Descriptive",
};

const QuestionPanel = ({
  question,
  number,
  total,
  canSpeak,
  isSpeaking,
  onRead,
  onStop,
}) => (
  <section className="p-6">
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="rounded-full border border-line px-2 py-1 text-muted">
        {FORMAT_LABELS[question.format]}
      </span>
      <span className="rounded-full border border-line px-2 py-1 text-muted">
        {question.topic}
      </span>
      <span className="font-mono text-muted">{question.maxScore} marks</span>
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted">
        Question {number} of {total}
      </p>
      {canSpeak && (
        <button
          type="button"
          onClick={isSpeaking ? onStop : onRead}
          className="rounded-md border border-line px-3 py-1 text-xs hover:border-muted"
        >
          {isSpeaking ? "Stop" : "Read again"}
        </button>
      )}
    </div>
    <h1 className="mt-2 whitespace-pre-wrap text-lg leading-relaxed">
      {question.question}
    </h1>
  </section>
);

export default QuestionPanel;
