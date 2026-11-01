const WIDTH = 600;
const HEIGHT = 200;
const PAD = { top: 20, right: 16, bottom: 12, left: 36 };
const GRID = [0, 50, 100];

const formatDate = (value) =>
  new Date(value).toLocaleDateString([], { dateStyle: "medium" });

const TrendChart = ({ points }) => {
  if (points.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted">
        No scored interviews yet. Finish one to see your trend.
      </p>
    );
  }

  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const x = (index) =>
    PAD.left +
    (points.length === 1
      ? innerWidth / 2
      : (index / (points.length - 1)) * innerWidth);
  const y = (percent) =>
    PAD.top +
    innerHeight -
    (Math.min(100, Math.max(0, percent)) / 100) * innerHeight;
  const line = points
    .map((point, index) => `${x(index)},${y(point.percent)}`)
    .join(" ");

  return (
    <>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Score trend over the last ${points.length} interviews: ${points
          .map((point) => `${point.percent}%`)
          .join(", ")}`}
        className="mt-4 h-auto w-full"
      >
        {GRID.map((value) => (
          <g key={value}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(value)}
              y2={y(value)}
              className="stroke-line"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 8}
              y={y(value) + 4}
              textAnchor="end"
              fontSize="11"
              className="fill-muted font-mono"
            >
              {value}
            </text>
          </g>
        ))}

        {points.length > 1 && (
          <polyline
            points={line}
            fill="none"
            className="stroke-accent"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {points.map((point, index) => (
          <g key={point.id}>
            <circle
              cx={x(index)}
              cy={y(point.percent)}
              r="4"
              className="fill-accent"
            />
            <text
              x={x(index)}
              y={y(point.percent) - 9}
              textAnchor="middle"
              fontSize="11"
              className="fill-ink font-mono"
            >
              {point.percent}
            </text>
            <title>{`${point.title}: ${point.percent}% on ${formatDate(point.date)}`}</title>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-xs text-muted">
        Last {points.length} scored interview{points.length > 1 ? "s" : ""},
        oldest to newest. Score in percent.
      </p>
    </>
  );
};

export default TrendChart;
