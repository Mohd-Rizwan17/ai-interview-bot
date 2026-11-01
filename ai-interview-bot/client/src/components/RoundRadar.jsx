import { ROUNDS } from "../constants/rounds.js";

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 84;
const LABEL_RATIO = 1.2;
const RINGS = [0.33, 0.66, 1];
const MIN_ROUNDS = 3;

const orderOf = (key) => {
  const index = ROUNDS.findIndex((round) => round.key === key);

  return index === -1 ? ROUNDS.length : index;
};

const pointAt = (index, total, ratio) => {
  const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;

  return [
    CENTER + Math.cos(angle) * RADIUS * ratio,
    CENTER + Math.sin(angle) * RADIUS * ratio,
  ];
};

const toPoints = (points) =>
  points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

const anchorFor = (x) => {
  if (Math.abs(x - CENTER) < 8) return "middle";

  return x > CENTER ? "start" : "end";
};

const RoundRadar = ({ rounds }) => {
  if (rounds.length < MIN_ROUNDS) {
    return (
      <p className="mt-4 text-sm text-muted">
        Needs {MIN_ROUNDS} graded rounds to draw this chart.
      </p>
    );
  }

  const sorted = [...rounds].sort(
    (first, second) => orderOf(first.key) - orderOf(second.key),
  );
  const total = sorted.length;
  const shape = sorted.map((round, index) =>
    pointAt(index, total, round.percent / 100),
  );

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`Strength by round: ${sorted
        .map((round) => `${round.title} ${round.percent}%`)
        .join(", ")}`}
      className="mx-auto mt-2 h-auto w-full max-w-xs"
    >
      {RINGS.map((ratio) => (
        <polygon
          key={ratio}
          points={toPoints(
            sorted.map((_, index) => pointAt(index, total, ratio)),
          )}
          fill="none"
          className="stroke-line"
          strokeWidth="1"
        />
      ))}

      {sorted.map((round, index) => {
        const [edgeX, edgeY] = pointAt(index, total, 1);
        const [labelX, labelY] = pointAt(index, total, LABEL_RATIO);

        return (
          <g key={round.key}>
            <line
              x1={CENTER}
              y1={CENTER}
              x2={edgeX}
              y2={edgeY}
              className="stroke-line"
              strokeWidth="1"
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor={anchorFor(labelX)}
              dominantBaseline="central"
              fontSize="11"
              className="fill-muted font-mono"
            >
              {round.title}
            </text>
          </g>
        );
      })}

      <polygon
        points={toPoints(shape)}
        className="fill-accent/20 stroke-accent"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {shape.map(([x, y], index) => (
        <circle
          key={sorted[index].key}
          cx={x}
          cy={y}
          r="3.5"
          className="fill-accent"
        >
          <title>{`${sorted[index].title}: ${sorted[index].percent}%`}</title>
        </circle>
      ))}
    </svg>
  );
};

export default RoundRadar;
