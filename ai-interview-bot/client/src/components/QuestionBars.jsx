const QuestionBars = ({ items }) => {
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <ul className="mt-4 flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="capitalize">{item.label}</span>
            <span className="font-mono text-muted">{item.count}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default QuestionBars;
