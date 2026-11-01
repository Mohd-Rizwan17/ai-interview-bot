import { useCallback, useEffect, useRef, useState } from "react";

const supported = typeof window !== "undefined" && "speechSynthesis" in window;

const LETTERS = ["A", "B", "C", "D"];

export const buildSpeechText = (question) => {
  const options = (question.options ?? [])
    .map((option, index) => `Option ${LETTERS[index]}. ${option}`)
    .join(". ");

  return [question.question, options].filter(Boolean).join(". ");
};

const useSpeech = () => {
  const [speaking, setSpeaking] = useState(false);
  const currentRef = useRef(null);

  const stop = useCallback(() => {
    if (!supported) return;

    currentRef.current = null;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback((text) => {
    if (!supported || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const finish = () => {
      if (currentRef.current === utterance) setSpeaking(false);
    };

    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = finish;
    utterance.onerror = finish;

    currentRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => stop, [stop]);

  return { supported, speaking, speak, stop };
};

export default useSpeech;
