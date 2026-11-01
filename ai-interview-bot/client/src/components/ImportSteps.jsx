const STEPS = ["Choose PDF", "Review", "Save"];

const ImportSteps = ({ current }) => (
  <ol
    aria-label="Import progress"
    className="mt-4 flex items-center gap-2 text-sm"
  >
    {STEPS.map((label, index) => {
      const number = index + 1;
      const isDone = number < current;
      const isCurrent = number === current;

      return (
        <li
          key={label}
          aria-current={isCurrent ? "step" : undefined}
          className="flex items-center gap-2"
        >
          {index > 0 && (
            <span
              aria-hidden="true"
              className={`h-px w-6 transition-colors duration-300 ${
                number <= current ? "bg-accent" : "bg-line"
              }`}
            />
          )}
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs transition-colors duration-300 ${
              isDone
                ? "bg-ok text-ground"
                : isCurrent
                  ? "bg-accent text-ground"
                  : "border border-line text-muted"
            }`}
          >
            {isDone ? "✓" : number}
          </span>
          <span
            className={isCurrent ? "text-ink" : "hidden text-muted sm:inline"}
          >
            {label}
          </span>
        </li>
      );
    })}
  </ol>
);

export default ImportSteps;
