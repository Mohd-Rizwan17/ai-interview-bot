import { useEffect, useState } from "react";

const SIZE = 7;
const TAIL = 8;
const FRAME_MS = 90;
const IDLE_OPACITY = 0.12;

const buildPath = () => {
  const path = [];

  for (let x = 0; x < SIZE; x += 1) path.push([x, 0]);
  for (let y = 1; y < SIZE; y += 1) path.push([SIZE - 1, y]);
  for (let x = SIZE - 2; x >= 0; x -= 1) path.push([x, SIZE - 1]);
  for (let y = SIZE - 2; y > 0; y -= 1) path.push([0, y]);

  return path;
};

const PATH = buildPath();
const POSITIONS = new Map(PATH.map(([x, y], index) => [`${x},${y}`, index]));
const CELLS = Array.from({ length: SIZE * SIZE }, (_, index) => ({
  key: index,
  position: POSITIONS.get(`${index % SIZE},${Math.floor(index / SIZE)}`),
}));

const opacityFor = (position, head) => {
  if (position === undefined) return IDLE_OPACITY;

  const age = (head - position + PATH.length) % PATH.length;

  return age < TAIL ? 1 - (age / TAIL) * 0.9 : IDLE_OPACITY;
};

const DotLoader = ({ className = "" }) => {
  const [head, setHead] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const id = setInterval(
      () => setHead((current) => (current + 1) % PATH.length),
      FRAME_MS,
    );

    return () => clearInterval(id);
  }, []);

  return (
    <div aria-hidden="true" className={`grid grid-cols-7 gap-1.5 ${className}`}>
      {CELLS.map(({ key, position }) => (
        <span
          key={key}
          className="h-2 w-2 rounded-full bg-accent"
          style={{ opacity: opacityFor(position, head) }}
        />
      ))}
    </div>
  );
};

export default DotLoader;
