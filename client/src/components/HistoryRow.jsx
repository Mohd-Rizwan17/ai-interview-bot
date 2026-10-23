import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { deleteInterview } from "../store/historySlice.js";
import ConfirmModal from "./ConfirmModal.jsx";

const STATUS = {
  completed: { label: "Completed", tone: "text-accent" },
  in_progress: { label: "In progress", tone: "text-warn" },
  incomplete: { label: "Incomplete", tone: "text-muted" },
  ended_cheating: { label: "Ended: cheating flag", tone: "text-danger" },
};

const formatDate = (value) =>
  new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });

const targetFor = (interview) => {
  if (interview.status === "in_progress") return `/interview/${interview._id}`;
  if (interview.status === "incomplete") return null;

  return `/interview/${interview._id}/review`;
};

const HistoryRow = ({ interview }) => {
  const dispatch = useDispatch();
  const busy = useSelector((state) => state.history.busy);
  const [isConfirming, setIsConfirming] = useState(false);
  const status = STATUS[interview.status];
  const target = targetFor(interview);
  const canDelete = interview.status !== "in_progress";
  const hasScore =
    interview.status === "completed" || interview.status === "ended_cheating";
  const showProgress =
    interview.status === "in_progress" || interview.status === "incomplete";
  const roundCount = interview.rounds.length;

  const handleDelete = async () => {
    await dispatch(deleteInterview(interview._id));
    setIsConfirming(false);
  };

  const content = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{interview.title}</h2>
          <p className="mt-1 text-sm text-muted">
            <span className="capitalize">{interview.difficulty}</span> ·{" "}
            {roundCount} round{roundCount > 1 ? "s" : ""} ·{" "}
            {formatDate(interview.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-semibold ${status.tone}`}>
            {status.label}
          </p>
          {hasScore && (
            <p className="font-mono text-sm text-muted">
              {interview.obtainedMarks} / {interview.totalMarks}
            </p>
          )}
          {target && (
            <p className="text-xs text-muted">
              {interview.status === "in_progress"
                ? "Continue →"
                : "View review →"}
            </p>
          )}
        </div>
      </div>

      {showProgress && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${interview.progressPercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted">
            {interview.progressPercent}% done
            {interview.status === "incomplete" && " · cannot be opened"}
          </p>
        </div>
      )}
    </>
  );

  return (
    <div
      className={`rounded-xl border border-line bg-panel ${target ? "hover:border-muted" : ""}`}
    >
      {target ? (
        <Link to={target} className="block p-4">
          {content}
        </Link>
      ) : (
        <div className="p-4 opacity-70">{content}</div>
      )}

      {canDelete && (
        <div className="flex justify-end border-t border-line px-4 py-2">
          <button
            type="button"
            onClick={() => setIsConfirming(true)}
            disabled={busy}
            className="text-sm text-danger disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}

      {isConfirming && (
        <ConfirmModal
          title={`Delete "${interview.title}"?`}
          message="This cannot be undone."
          busy={busy}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </div>
  );
};

export default HistoryRow;
