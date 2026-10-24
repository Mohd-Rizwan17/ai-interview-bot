import { useEffect, useRef } from "react";

const SPACING = 18;
const DOT_SIZE = 2;
const REVEAL_PER_CELL = 0.02;
const FADE_SECONDS = 0.3;
const FRAME_MS = 33;
const STATIC_TIME = 999;

const hash = (x, y, seed) => {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;

  return value - Math.floor(value);
};

const buildDots = (width, height) => {
  const columns = Math.floor(width / SPACING) + 1;
  const rows = Math.floor(height / SPACING) + 1;
  const offsetX = (width - (columns - 1) * SPACING) / 2;
  const offsetY = (height - (rows - 1) * SPACING) / 2;
  const dots = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const distance = Math.hypot(column - columns / 2, row - rows / 2);

      dots.push({
        x: offsetX + column * SPACING - DOT_SIZE / 2,
        y: offsetY + row * SPACING - DOT_SIZE / 2,
        delay: distance * REVEAL_PER_CELL + hash(column, row, 1) * 0.4,
        base: 0.08 + hash(column, row, 2) * 0.12,
        amp: hash(column, row, 3) > 0.5 ? 0.8 : 0.2,
        speed: 1.2 + hash(column, row, 4) * 3.8,
        phase: hash(column, row, 5) * Math.PI * 2,
      });
    }
  }

  return dots;
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
    let dots = [];
    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastDraw = 0;

    const draw = (elapsed) => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = color;

      dots.forEach((dot) => {
        const appear = Math.min(
          1,
          Math.max(0, (elapsed - dot.delay) / FADE_SECONDS),
        );

        if (appear === 0) return;

        const wave = 0.5 + 0.5 * Math.sin(elapsed * dot.speed + dot.phase);

        context.globalAlpha = (dot.base + dot.amp * wave ** 3) * appear;
        context.fillRect(dot.x, dot.y, DOT_SIZE, DOT_SIZE);
      });
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      dots = buildDots(width, height);

      if (isReduced) draw(STATIC_TIME);
    };

    const loop = (now) => {
      frameId = requestAnimationFrame(loop);

      if (now - lastDraw < FRAME_MS) return;

      lastDraw = now;
      draw((now - startTime) / 1000);
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
