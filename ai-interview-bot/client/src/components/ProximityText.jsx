import { Fragment, useLayoutEffect, useRef } from "react";

const MIN_WEIGHT = 400;
const MAX_WEIGHT = 700;
const RADIUS = 140;

const canTrack = () =>
  window.matchMedia("(any-hover: hover)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ProximityText = ({ text }) => {
  const letterRefs = useRef([]);
  const words = text.split(" ");
  let letterIndex = 0;

  useLayoutEffect(() => {
    if (!canTrack()) return undefined;

    const letters = letterRefs.current.filter(Boolean);
    let frameId = 0;
    let point = null;

    const setAll = (weight) => {
      letters.forEach((letter) => {
        letter.style.fontWeight = weight;
      });
    };

    const paint = () => {
      frameId = 0;

      letters.forEach((letter) => {
        const box = letter.getBoundingClientRect();
        const distance = Math.hypot(
          point.x - (box.left + box.width / 2),
          point.y - (box.top + box.height / 2),
        );
        const closeness = Math.max(0, 1 - distance / RADIUS);

        letter.style.fontWeight = Math.round(
          MIN_WEIGHT + (MAX_WEIGHT - MIN_WEIGHT) * closeness,
        );
      });
    };

    const handleMove = (event) => {
      point = { x: event.clientX, y: event.clientY };

      if (!frameId) frameId = requestAnimationFrame(paint);
    };

    const handleLeave = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
      setAll(MIN_WEIGHT);
    };

    setAll(MIN_WEIGHT);
    window.addEventListener("pointermove", handleMove);
    document.documentElement.addEventListener("mouseleave", handleLeave);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
      setAll("");
    };
  }, [text]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <Fragment key={wordIndex}>
            <span className="inline-block whitespace-nowrap">
              {[...word].map((character, position) => {
                const index = letterIndex;

                letterIndex += 1;

                return (
                  <span
                    key={position}
                    ref={(node) => {
                      letterRefs.current[index] = node;
                    }}
                    className="inline-block transition-[font-weight] duration-150"
                  >
                    {character}
                  </span>
                );
              })}
            </span>
            {wordIndex < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </>
  );
};

export default ProximityText;
