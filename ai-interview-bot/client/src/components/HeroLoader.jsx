import { useEffect, useState } from "react";
import DataRain from "./DataRain.jsx";

const HeroLoader = ({ failed = false, onRetry }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (failed) return undefined;
    const id = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [failed]);

  const message =
    seconds < 10
      ? "Waking up the server..."
      : "Still starting. Free hosting can take a minute or two.";

  return (
    <>
      <DataRain />
      <div className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 text-center text-white">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI Interview Bot
        </h1>

        {failed ? (
          <div
            className="flex flex-col items-center gap-4 rounded-2xl bg-black/50 px-8 py-6"
            role="alert"
          >
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
            className="flex max-w-sm flex-col items-center gap-2 rounded-2xl bg-black/50 px-8 py-6"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-medium">{message}</p>
            <p className="text-xs opacity-60">
              This app runs on free hosting that sleeps after 15 minutes without
              use. The first visit after that is slow, the next ones are fast.
            </p>
            <p className="text-xs opacity-60">Waiting {seconds}s</p>
          </div>
        )}
      </div>
    </>
  );
};

export default HeroLoader;
