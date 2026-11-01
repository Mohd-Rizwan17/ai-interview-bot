import { useEffect, useRef } from "react";

const MOBILE_WIDTH = 768;
const DESKTOP = { max: 70, link: 150 };
const MOBILE = { max: 28, link: 110 };
const AREA_PER_NODE = 20000;
const MIN_SPEED = 6;
const MAX_SPEED = 16;
const MAX_FRAME_SEC = 0.05;
const RESIZE_DELAY_MS = 150;

const rand = (min, max) => Math.random() * (max - min) + min;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const createNodes = (width, height, count) =>
  Array.from({ length: count }, () => {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(MIN_SPEED, MAX_SPEED);

    return {
      x: rand(0, width),
      y: rand(0, height),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: rand(1.2, 2.2),
    };
  });

const ConstellationGrid = ({ isDark = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim() || "#a78bfa";
    const dotColor = isDark ? "#ece9ff" : "#312e81";
    let width = 0;
    let height = 0;
    let linkDistance = DESKTOP.link;
    let nodes = [];
    let frameId = null;
    let lastTime = 0;
    let resizeTimer = null;

    const fit = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const setup = () => {
      fit();

      const config = width < MOBILE_WIDTH ? MOBILE : DESKTOP;
      const count = Math.min(
        config.max,
        Math.round((width * height) / AREA_PER_NODE),
      );

      linkDistance = config.link;
      nodes = createNodes(width, height, count);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const squared = dx * dx + dy * dy;

          if (squared < linkDistance * linkDistance) {
            ctx.globalAlpha = (1 - Math.sqrt(squared) / linkDistance) * 0.35;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 0.6;
      ctx.fillStyle = dotColor;

      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
    };

    const step = (time) => {
      const delta = Math.min((time - lastTime) / 1000, MAX_FRAME_SEC);

      lastTime = time;

      nodes.forEach((node) => {
        node.x += node.vx * delta;
        node.y += node.vy * delta;

        if (node.x < 0 || node.x > width) {
          node.vx *= -1;
          node.x = clamp(node.x, 0, width);
        }

        if (node.y < 0 || node.y > height) {
          node.vy *= -1;
          node.y = clamp(node.y, 0, height);
        }
      });

      draw();
      frameId = requestAnimationFrame(step);
    };

    const start = () => {
      if (frameId !== null || media.matches || document.hidden) return;

      lastTime = performance.now();
      frameId = requestAnimationFrame(step);
    };

    const stop = () => {
      if (frameId === null) return;

      cancelAnimationFrame(frameId);
      frameId = null;
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const handleMotion = () => {
      stop();

      if (media.matches) draw();
      else start();
    };

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth === width) fit();
        else setup();

        if (media.matches) draw();
      }, RESIZE_DELAY_MS);
    };

    setup();

    if (media.matches) draw();
    else start();

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);
    media.addEventListener("change", handleMotion);

    return () => {
      stop();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      media.removeEventListener("change", handleMotion);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ zIndex: -1 }}
      className="pointer-events-none fixed inset-0 h-full w-full"
    />
  );
};

export default ConstellationGrid;
