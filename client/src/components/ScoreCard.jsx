const ScoreCard = ({ interview, summary }) => {
  const percent = summary.totalMarks
    ? Math.round((summary.obtainedMarks / summary.totalMarks) * 100)
    : 0;
  const isCheating = interview.status === "ended_cheating";

  const stats = [
    { label: "Correct", value: summary.right, tone: "text-accent" },
    { label: "Wrong", value: summary.wrong, tone: "text-danger" },
    { label: "Not answered", value: summary.unanswered, tone: "text-warn" },
    {
      label: "Cheating flags",
      value: summary.cheatingFlags,
      tone: summary.cheatingFlags > 0 ? "text-danger" : "text-muted",
    },
  ];

  return (
    <section className="rounded-xl border border-line bg-panel p-6">
      <p className={`text-sm ${isCheating ? "text-danger" : "text-muted"}`}>
        {isCheating ? "Ended: cheating flag" : "Completed"}
      </p>
      <h1 className="mt-1 text-2xl font-semibold">{interview.title}</h1>

      <p className="mt-4 font-mono text-4xl font-medium text-accent">
        {summary.obtainedMarks}{" "}
        <span className="text-lg text-muted">/ {summary.totalMarks}</span>
      </p>
      <p className="text-sm text-muted">{percent}% score</p>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-xs uppercase tracking-wide text-muted">
              {stat.label}
            </dt>
            <dd className={`font-mono text-2xl ${stat.tone}`}>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default ScoreCard;
