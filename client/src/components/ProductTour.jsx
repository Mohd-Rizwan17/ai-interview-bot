import { useEffect, useLayoutEffect, useRef, useState } from "react";

const TIP_WIDTH = 320;
const TIP_HEIGHT = 200;
const GAP = 14;
const EDGE = 16;
const SPOT_PAD = 6;

const STEPS = [
  {
    title: "Welcome to AI Interview Bot",
    body: "A quick look at how a mock interview works. You can leave any time with Esc.",
  },
  {
    target: "rounds",
    title: "Pick your rounds",
    body: "Select the rounds you want from the sidebar. They run in the order you pick them.",
  },
  {
    target: "start",
    title: "Choose difficulty and start",
    body: "Set the difficulty here, then press Start Interview. Starting a new interview ends any interview in progress.",
  },
  {
    target: "stats",
    title: "Track your progress",
    body: "Your scores, best round and weak spots show up here once you finish an interview.",
  },
];

const findTarget = (step) =>
  step.target ? document.querySelector(`[data-tour="${step.target}"]`) : null;

const isVisible = (element) => {
  if (!element) return false;

  const box = element.getBoundingClientRect();

  return box.width > 0 && box.right > 0 && box.left < window.innerWidth;
};

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), Math.max(min, max));

const placeTip = (rect) => {
  const width = Math.min(TIP_WIDTH, window.innerWidth - EDGE * 2);
  const maxLeft = window.innerWidth - width - EDGE;
  const maxTop = window.innerHeight - TIP_HEIGHT - EDGE;

  if (!rect) {
    return {
      width,
      left: (window.innerWidth - width) / 2,
      top: (window.innerHeight - TIP_HEIGHT) / 2,
    };
  }

  const right = rect.left + rect.width + SPOT_PAD + GAP;

  if (right + width <= window.innerWidth - EDGE) {
    return { width, left: right, top: clamp(rect.top, EDGE, maxTop) };
  }

  const left = clamp(rect.left, EDGE, maxLeft);
  const below = rect.top + rect.height + SPOT_PAD + GAP;

  if (below <= maxTop) return { width, left, top: below };

  const above = rect.top - SPOT_PAD - GAP - TIP_HEIGHT;

  if (above >= EDGE) return { width, left, top: above };

  return { width, left, top: maxTop };
};

const spotlightStyle = (rect) =>
  rect
    ? {
        top: rect.top - SPOT_PAD,
        left: rect.left - SPOT_PAD,
        width: rect.width + SPOT_PAD * 2,
        height: rect.height + SPOT_PAD * 2,
        boxShadow:
          "0 0 0 2px var(--color-accent), 0 0 0 9999px rgb(0 0 0 / 0.6)",
      }
    : {
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        width: 0,
        height: 0,
        boxShadow: "0 0 0 9999px rgb(0 0 0 / 0.6)",
      };

const ProductTour = ({ open, onClose }) => {
  const [steps, setSteps] = useState([]);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const nextRef = useRef(null);
  const step = steps[index];
  const isLast = index === steps.length - 1;

  useEffect(() => {
    if (!open) return;

    setSteps(
      STEPS.filter((item) => !item.target || isVisible(findTarget(item))),
    );
    setIndex(0);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !step) return;

    const element = findTarget(step);

    element?.scrollIntoView({ block: "nearest" });

    if (!element) {
      setRect(null);
      return;
    }

    const box = element.getBoundingClientRect();

    setRect({
      top: box.top,
      left: box.left,
      width: box.width,
      height: box.height,
    });
  }, [open, step]);

  useEffect(() => {
    if (!open || !step) return undefined;

    const measure = () => {
      const element = findTarget(step);

      if (!element) return;

      const box = element.getBoundingClientRect();

      setRect({
        top: box.top,
        left: box.left,
        width: box.width,
        height: box.height,
      });
    };

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, step]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft")
        setIndex((value) => Math.max(0, value - 1));
      if (event.key === "ArrowRight") {
        if (isLast) onClose();
        else setIndex((value) => value + 1);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [open, isLast, onClose]);

  useEffect(() => {
    if (open && step) nextRef.current?.focus();
  }, [open, step]);

  if (!open || !step) return null;

  const handleNext = () => {
    if (isLast) onClose();
    else setIndex(index + 1);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        className="absolute rounded-xl transition-all duration-300 ease-out"
        style={spotlightStyle(rect)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className="glass-solid absolute rounded-xl p-5 transition-all duration-300 ease-out"
        style={placeTip(rect)}
      >
        <p className="font-mono text-xs text-muted">
          {index + 1} of {steps.length}
        </p>
        <h2 id="tour-title" className="mt-1 text-lg font-semibold">
          {step.title}
        </h2>
        <p className="mt-2 text-sm text-muted">{step.body}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted hover:text-ink"
          >
            Skip
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex(index - 1)}
                className="rounded-md border border-line px-3 py-2 text-sm hover:bg-white/5"
              >
                Back
              </button>
            )}
            <button
              ref={nextRef}
              type="button"
              onClick={handleNext}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ground"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTour;
