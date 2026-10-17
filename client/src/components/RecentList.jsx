import { Link } from "react-router";

const STATUS = {
  completed: { label: "Completed", tone: "text-accent" },
  in_progress: { label: "In progress", tone: "text-warn" },
  incomplete: { label: "Incomplete", tone: "text-muted" },
  ended_cheating: { label: "Ended: cheating flag", tone: "text-danger" },
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString([], { dateStyle: "medium" });

const targetFor = (interview) => {
  if (interview.status === "in_progress") return `/interview/${interview._id}`;
  if (interview.status === "incomplete") return null;

  return `/interview/${interview._id}/review`;
};

const Row = ({ interview }) => {
  const status = STATUS[interview.status];

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{interview.title}</p>
        <p className="text-xs text-muted">
          <span className="capitalize">{interview.difficulty}</span> ·{" "}
          {formatDate(interview.createdAt)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-xs font-semibold ${status.tone}`}>{status.label}</p>
        {interview.percent !== null && (
          <p className="font-mono text-sm text-muted">{interview.percent}%</p>
        )}
      </div>
    </div>
  );
};

const RecentList = ({ interviews }) => {
  if (interviews.length === 0) {
    return <p className="mt-4 text-sm text-muted">No interviews yet.</p>;
  }

  return (
    <ul className="mt-4 flex flex-col divide-y divide-line">
      {interviews.map((interview) => {
        const target = targetFor(interview);

        return (
          <li key={interview._id} className="py-3 first:pt-0 last:pb-0">
            {target ? (
              <Link to={target} className="block hover:opacity-80">
                <Row interview={interview} />
              </Link>
            ) : (
              <div className="opacity-70">
                <Row interview={interview} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default RecentList;
