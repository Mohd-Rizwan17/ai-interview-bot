import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router";

const SLIDE_OFFSET = 40;
const RISE_OFFSET = 12;
const SLIDE_SECONDS = 0.4;
const FADE_SECONDS = 0.3;

const useCardSlide = () => {
  const cardRef = useRef(null);
  const { state } = useLocation();
  const direction = state?.slide ?? 0;

  useLayoutEffect(() => {
    const card = cardRef.current;

    if (!card) return undefined;

    const isReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const offset = isReduced
      ? {}
      : { x: direction * SLIDE_OFFSET, y: direction ? 0 : RISE_OFFSET };

    const context = gsap.context(() => {
      gsap.from(card, {
        ...offset,
        opacity: 0,
        duration: direction ? SLIDE_SECONDS : FADE_SECONDS,
        ease: "power2.out",
        clearProps: "transform,opacity",
      });
    });

    return () => context.revert();
  }, [direction]);

  return cardRef;
};

export default useCardSlide;
