import gsap from "gsap";

const WIPE_SECONDS = 0.6;
const FADE_SECONDS = 0.3;
const FADE_DELAY_SECONDS = 0.1;
const EDGE_PADDING = 2;

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const pointOf = (element) => {
  const box = element?.getBoundingClientRect();

  return box
    ? { x: box.left + box.width / 2, y: box.top + box.height / 2 }
    : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
};

const circleAt = ({ x, y }, radius) => `circle(${radius}px at ${x}px ${y}px)`;

export const playWipe = (origin) =>
  new Promise((resolve) => {
    const overlay = document.createElement("div");
    const radius =
      Math.hypot(
        Math.max(origin.x, window.innerWidth - origin.x),
        Math.max(origin.y, window.innerHeight - origin.y),
      ) + EDGE_PADDING;

    overlay.setAttribute("aria-hidden", "true");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:100;background:linear-gradient(135deg,var(--color-accent),var(--accent-2))";
    document.body.append(overlay);

    const release = () => {
      gsap.to(overlay, {
        opacity: 0,
        duration: FADE_SECONDS,
        delay: FADE_DELAY_SECONDS,
        onComplete: () => overlay.remove(),
      });
    };

    gsap.fromTo(
      overlay,
      { clipPath: circleAt(origin, 0) },
      {
        clipPath: circleAt(origin, radius),
        duration: WIPE_SECONDS,
        ease: "power2.in",
        onComplete: () => resolve(release),
      },
    );
  });
