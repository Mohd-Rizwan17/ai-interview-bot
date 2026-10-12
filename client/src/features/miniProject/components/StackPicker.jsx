import { useEffect, useState } from "react";
import { fetchStacks } from "../api.js";

const StackPicker = ({ value, onChange }) => {
  const [stacks, setStacks] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    fetchStacks()
      .then((list) => {
        if (isCurrent) setStacks(list);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(
            requestError.response?.data?.message || "Cannot reach the server",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <div className="mt-6 border-t border-line pt-6">
      <h2 className="text-lg font-semibold">Mini Project stack</h2>
      <p className="mt-1 text-sm text-muted">
        You get one project with its own time limit and write the code in the
        browser.
      </p>

      {isLoading && (
        <p className="mt-3 text-sm text-muted">Loading stacks...</p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {stacks.map((stack) => (
          <button
            key={stack.key}
            type="button"
            onClick={() => onChange(stack.key)}
            aria-pressed={value === stack.key}
            className={`rounded-md border px-4 py-2 text-sm ${
              value === stack.key
                ? "border-accent text-accent"
                : "border-line text-muted"
            }`}
          >
            {stack.label}
          </button>
        ))}
      </div>

      {!isLoading && !error && !value && (
        <p className="mt-3 text-xs text-warn">Choose a stack to continue.</p>
      )}
    </div>
  );
};

export default StackPicker;
