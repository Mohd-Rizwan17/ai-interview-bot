const SidePanel = ({ round, questions, activeId, onSelect }) => {
  const answered = questions.filter(
    (question) => question.status === "answered",
  ).length;
  const percent = questions.length
    ? Math.round((answered / questions.length) * 100)
    : 0;

  return (
    <aside className="border-b border-line bg-panel p-4 lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <p className="text-xs uppercase tracking-wide text-muted">
        Round {round.order} of {round.totalRounds}
      </p>
      <h2 className="mt-1 text-xl font-semibold">{round.title}</h2>

      <ol className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
        {questions.map((question, index) => {
          const isActive = question.id === activeId;
          const isAnswered = question.status === "answered";

          return (
            <li key={question.id}>
              <button
                type="button"
                onClick={() => onSelect(question.id)}
                aria-current={isActive ? "true" : undefined}
                className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left ${
                  isActive
                    ? "border-accent bg-ground"
                    : "border-transparent hover:bg-ground"
                }`}
              >
                <span className="font-mono text-xs text-muted">
                  {index + 1}
                </span>
                <span className="hidden flex-1 truncate text-sm lg:block">
                  {question.topic}
                </span>
                <span
                  aria-label={isAnswered ? "Answered" : "Not answered"}
                  className={isAnswered ? "text-accent" : "text-muted"}
                >
                  {isAnswered ? "✓" : "·"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6">
        <p className="text-sm text-muted">
          {answered} / {questions.length} answered
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </aside>
  );
};

export default SidePanel;
