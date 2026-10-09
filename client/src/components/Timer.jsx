const format = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const rest = String(seconds % 60).padStart(2, "0");

  return `${minutes}:${rest}`;
};

const toneFor = (seconds) => {
  if (seconds <= 10) return "text-danger";
  if (seconds <= 60) return "text-warn";
  return "text-ink";
};

const Timer = ({ secondsLeft }) => {
  if (secondsLeft === null) return null;

  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-wide text-muted">Time left</p>
      <p
        role="timer"
        className={`font-mono text-3xl font-medium ${toneFor(secondsLeft)}`}
      >
        {format(secondsLeft)}
      </p>
    </div>
  );
};

export default Timer;
