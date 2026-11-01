import ProjectReview from "../features/miniProject/ProjectReview.jsx";

const LETTERS = ["A", "B", "C", "D"];

const verdictFor = (attempt) => {
  if (attempt.status === "pending") {
    return { label: "Not attempted", tone: "text-muted" };
  }
  if (attempt.status === "skipped") {
    return { label: "Skipped", tone: "text-warn" };
  }
  if (attempt.status === "timed_out") {
    return { label: "Time up", tone: "text-warn" };
  }
  if (attempt.isCorrect === true) {
    return { label: "Correct", tone: "text-ok" };
  }
  if (attempt.isCorrect === false) {
    return { label: "Wrong", tone: "text-danger" };
  }
  return { label: "Needs manual review", tone: "text-muted" };
};

const optionTone = (isCorrect, isChosen) => {
  if (isCorrect) return "border-ok";
  if (isChosen) return "border-danger";
  return "border-line";
};

const ReviewQuestion = ({ attempt }) => {
  if (attempt.format === "project") return <ProjectReview attempt={attempt} />;

  const verdict = verdictFor(attempt);
  const isMcq = attempt.format === "mcq";

  return (
    <article className="glass-solid rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          <span className="font-mono">Q{attempt.order}</span> · {attempt.topic}
        </p>
        <p className="flex items-center gap-3 text-sm">
          {attempt.hintUsed && <span className="text-warn">Hint used</span>}
          <span className={`font-semibold ${verdict.tone}`}>
            {verdict.label}
          </span>
          <span className="font-mono text-muted">
            {attempt.score} / {attempt.maxScore}
          </span>
        </p>
      </div>

      <h3 className="mt-3 whitespace-pre-wrap leading-relaxed">
        {attempt.question}
      </h3>

      {isMcq ? (
        <ul className="mt-4 flex flex-col gap-2">
          {attempt.options.map((option, index) => {
            const isCorrect = index === attempt.correctOption;
            const isChosen = index === attempt.selectedOption;

            return (
              <li
                key={index}
                className={`flex items-start gap-3 rounded-md border p-3 ${optionTone(isCorrect, isChosen)}`}
              >
                <span className="font-mono text-sm text-muted">
                  {LETTERS[index]}
                </span>
                <span className="flex-1">{option}</span>
                <span className="flex flex-col items-end text-xs font-semibold">
                  {isChosen && (
                    <span className={isCorrect ? "text-ok" : "text-danger"}>
                      Your answer
                    </span>
                  )}
                  {isCorrect && <span className="text-ok">Correct answer</span>}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Your answer
            </p>
            <p className="mt-1 whitespace-pre-wrap rounded-md border border-line bg-ground p-3 font-mono text-sm">
              {attempt.userAnswer || "No answer"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Model answer
            </p>
            <p className="mt-1 whitespace-pre-wrap rounded-md border border-ok bg-ground p-3 font-mono text-sm">
              {attempt.idealAnswer}
            </p>
          </div>
        </div>
      )}

      {!isMcq && attempt.feedback && (
        <p className="mt-3 text-sm text-muted">{attempt.feedback}</p>
      )}

      {attempt.explanation && (
        <p className="mt-4 text-sm text-muted">
          <span className="text-ink">Explanation: </span>
          {attempt.explanation}
        </p>
      )}
    </article>
  );
};

export default ReviewQuestion;
