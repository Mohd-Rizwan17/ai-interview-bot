import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const GRID = 9;
const DOTS = Array.from({ length: GRID * GRID }, (_, index) => index);

const HeroLoader = ({ failed = false, onRetry }) => {
  const gridRef = useRef(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (failed) return undefined;
    const id = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [failed]);

  useEffect(() => {
    if (failed) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-dot]",
        { scale: 0.5, opacity: 0.25 },
        {
          scale: 1.3,
          opacity: 1,
          duration: 0.7,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.05, from: "center", grid: [GRID, GRID] },
        },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [failed]);

  const message =
    seconds < 10
      ? "Waking up the server..."
      : "Still starting. Free hosting can take a minute or two.";

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 px-6 text-center">
      <h1 className="text-xl font-semibold tracking-tight">AI Interview Bot</h1>

      <div
        ref={gridRef}
        className="grid grid-cols-9 gap-2 text-accent"
        aria-hidden="true"
      >
        {DOTS.map((dot) => (
          <span
            key={dot}
            data-dot
            className="size-2 rounded-full bg-current opacity-40"
          />
        ))}
      </div>

      {failed ? (
        <div className="flex flex-col items-center gap-4" role="alert">
          <p className="text-sm opacity-80">The server did not respond.</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center gap-2"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium">{message}</p>
          <p className="max-w-sm text-xs opacity-60">
            This app runs on free hosting that sleeps after 15 minutes without
            use. The first visit after that is slow, the next ones are fast.
          </p>
          <p className="text-xs opacity-60">Waiting {seconds}s</p>
        </div>
      )}
    </div>
  );
};

export default HeroLoader;
