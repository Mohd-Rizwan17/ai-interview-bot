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

const pulseFor = (seconds) => {
  if (seconds <= 0) return "";
  if (seconds <= 10) return "timer-pulse timer-pulse-fast";
  if (seconds <= 60) return "timer-pulse";
  return "";
};

const Timer = ({ secondsLeft, compact = false }) => {
  if (secondsLeft === null) return null;

  if (compact) {
    return (
      <p
        aria-hidden="true"
        className={`shrink-0 font-mono text-lg font-medium ${toneFor(secondsLeft)} ${pulseFor(secondsLeft)}`}
      >
        {format(secondsLeft)}
      </p>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-wide text-muted">Time left</p>
      <p
        role="timer"
        className={`w-fit font-mono text-3xl font-medium ${toneFor(secondsLeft)} ${pulseFor(secondsLeft)}`}
      >
        {format(secondsLeft)}
      </p>
    </div>
  );
};

export default Timer;
