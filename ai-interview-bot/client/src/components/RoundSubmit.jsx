import { useState } from "react";

const RoundSubmit = ({ isLast, unanswered, isSubmitting, error, onSubmit }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <div>
      {isConfirming ? (
        <div className="rounded-md border border-line bg-ground p-3">
          <p className="text-sm">
            {unanswered > 0 &&
              `${unanswered} question${unanswered > 1 ? "s" : ""} not answered. `}
            {isLast
              ? "Answers cannot be changed after the final submit."
              : "You cannot return to this round after submitting."}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-ground disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Confirm"}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirming(false)}
              disabled={isSubmitting}
              className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="w-full rounded-md border border-accent px-4 py-2 font-semibold text-accent"
        >
          {isLast ? "Final Submit" : "Submit Round"}
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

export default RoundSubmit;
