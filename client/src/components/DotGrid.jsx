import { useEffect, useRef } from "react";

const SPACING = 18;
const DOT_SIZE = 2;
const LEVELS = [0.1, 0.1, 0.18, 0.18, 0.28, 0.42, 0.65, 0.95];
const REVEAL_PER_CELL = 0.02;
const FADE_SECONDS = 0.3;
const FLICKER_SECONDS = 4;
const IDLE_FRAME_MS = 120;
const STATIC_TIME = 999;

const hash = (x, y, seed) => {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;

  return value - Math.floor(value);
};

const DotGrid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const isReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const color =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-ink")
        .trim() || "#ffffff";
    const startTime = performance.now();
    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let frameId = 0;
    let lastDraw = 0;

    const draw = (elapsed) => {
      const offsetX = (width - (columns - 1) * SPACING) / 2;
      const offsetY = (height - (rows - 1) * SPACING) / 2;

      context.clearRect(0, 0, width, height);
      context.fillStyle = color;

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const distance = Math.hypot(column - columns / 2, row - rows / 2);
          const delay = distance * REVEAL_PER_CELL + hash(column, row, 1) * 0.4;
          const appear = Math.min(
            1,
            Math.max(0, (elapsed - delay) / FADE_SECONDS),
          );

          if (appear === 0) continue;

          const slot = Math.floor(
            elapsed / FLICKER_SECONDS + hash(column, row, 2),
          );
          const level =
            LEVELS[Math.floor(hash(column, row, slot + 3) * LEVELS.length)];

          context.globalAlpha = level * appear;
          context.fillRect(
            offsetX + column * SPACING - DOT_SIZE / 2,
            offsetY + row * SPACING - DOT_SIZE / 2,
            DOT_SIZE,
            DOT_SIZE,
          );
        }
      }
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      columns = Math.floor(width / SPACING) + 1;
      rows = Math.floor(height / SPACING) + 1;

      if (isReduced) draw(STATIC_TIME);
    };

    const loop = (now) => {
      frameId = requestAnimationFrame(loop);

      const elapsed = (now - startTime) / 1000;
      const isIdle = elapsed > 3;

      if (isIdle && now - lastDraw < IDLE_FRAME_MS) return;

      lastDraw = now;
      draw(elapsed);
    };

    resize();
    window.addEventListener("resize", resize);

    if (!isReduced) frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[-1] h-full w-full"
    />
  );
};

export default DotGrid;
