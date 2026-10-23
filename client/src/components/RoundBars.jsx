const barTone = (percent) => {
  if (percent >= 70) return "bg-ok";
  if (percent >= 40) return "bg-warn";

  return "bg-danger";
};

const RoundBars = ({ rounds }) => {
  if (rounds.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted">
        No round data yet. Finish an interview with a graded round.
      </p>
    );
  }

  return (
    <ul className="mt-4 flex flex-col gap-3">
      {rounds.map((round) => (
        <li key={round.key}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{round.title}</span>
            <span className="shrink-0 font-mono text-muted">
              {round.percent}%
              <span className="ml-2 text-xs">
                ({round.attempts} time{round.attempts > 1 ? "s" : ""})
              </span>
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-line">
            <div
              className={`h-full rounded-full ${barTone(round.percent)}`}
              style={{ width: `${round.percent}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RoundBars;
