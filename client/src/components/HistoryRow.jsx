import { Link } from "react-router";

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
  const status = STATUS[interview.status];
  const target = targetFor(interview);
  const hasScore =
    interview.status === "completed" || interview.status === "ended_cheating";
  const showProgress =
    interview.status === "in_progress" || interview.status === "incomplete";
  const roundCount = interview.rounds.length;

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

  const baseClass = "block rounded-xl border border-line bg-panel p-4";

  if (!target) {
    return <div className={`${baseClass} opacity-70`}>{content}</div>;
  }

  return (
    <Link to={target} className={`${baseClass} hover:border-muted`}>
      {content}
    </Link>
  );
};

export default HistoryRow;
