const TONES = {
  ok: "border-ok/40 bg-ok/10",
  warn: "border-warn/40 bg-warn/10",
  danger: "border-danger/40 bg-danger/10",
};

const toneFor = (percent) => {
  if (percent >= 70) return TONES.ok;
  if (percent >= 40) return TONES.warn;

  return TONES.danger;
};

const RoundTreemap = ({ rounds }) => {
  if (rounds.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted">
        No round data yet. Finish an interview with a graded round.
      </p>
    );
  }

  return (
    <>
      <ul className="mt-4 flex flex-wrap gap-2">
        {rounds.map((round) => (
          <li
            key={round.key}
            style={{ flexGrow: round.attempts }}
            className={`flex min-h-24 basis-36 flex-col justify-between rounded-lg border p-3 ${toneFor(round.percent)}`}
          >
            <span className="truncate text-xs uppercase tracking-wide text-muted">
              {round.title}
            </span>
            <span className="font-mono text-2xl">{round.percent}%</span>
            <span className="text-xs text-muted">
              {round.attempts} time{round.attempts > 1 ? "s" : ""}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        Bigger tile means attempted more often. Green 70% and above, amber 40%
        and above.
      </p>
    </>
  );
};

export default RoundTreemap;
