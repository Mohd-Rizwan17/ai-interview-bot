import { useState } from "react";

const HintBox = ({ question, disabled, onReveal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReveal = async () => {
    setIsLoading(true);
    setError(null);

    const message = await onReveal();

    setError(message);
    setIsLoading(false);
  };

  return (
    <div className="px-6 pb-6">
      {question.hintUsed ? (
        <div className="glass-solid rounded-md p-4">
          <p className="text-xs uppercase tracking-wide text-warn">
            Hint (1 mark deducted)
          </p>
          <p className="mt-2 text-sm">{question.hint}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleReveal}
          disabled={disabled || isLoading}
          className="rounded-md border border-line px-4 py-2 text-sm disabled:opacity-60"
        >
          {isLoading ? "Loading hint..." : "Show hint (costs 1 mark)"}
        </button>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default HintBox;
