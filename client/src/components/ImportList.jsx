const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const relativeDay = (value) => {
  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(new Date(value))) / DAY_MS,
  );

  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "last week";

  return new Date(value).toLocaleDateString([], { dateStyle: "medium" });
};

const ImportList = ({ imports }) => {
  if (imports.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted">
        No PDF imports yet. Imported questions appear here.
      </p>
    );
  }

  return (
    <ul className="mt-4 flex flex-col divide-y divide-line">
      {imports.map((item) => (
        <li
          key={item.source}
          className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{item.source}</p>
            <p className="text-xs text-muted">
              {item.count} question{item.count > 1 ? "s" : ""} ·{" "}
              <span className="capitalize">{item.difficulty}</span> ·{" "}
              {relativeDay(item.importedAt)}
            </p>
          </div>
          <span className="shrink-0 text-xs font-semibold text-ok">
            Saved
          </span>
        </li>
      ))}
    </ul>
  );
};

export default ImportList;
