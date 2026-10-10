import { useEffect, useRef } from "react";

const WARN_AWAY_MS = 30 * 1000;
export const CHEAT_AWAY_MS = 2 * 60 * 1000;

const useAntiCheat = ({ enabled, onWarn, onCheat }) => {
  const onWarnRef = useRef(onWarn);
  const onCheatRef = useRef(onCheat);

  useEffect(() => {
    onWarnRef.current = onWarn;
    onCheatRef.current = onCheat;
  }, [onWarn, onCheat]);

  useEffect(() => {
    if (!enabled) return undefined;

    let awaySince = null;
    let cheatTimer = null;
    let reported = false;

    const reportCheat = () => {
      if (reported) return;

      reported = true;
      clearTimeout(cheatTimer);
      onCheatRef.current();
    };

    const startAway = () => {
      if (awaySince !== null) return;

      awaySince = Date.now();
      cheatTimer = setTimeout(reportCheat, CHEAT_AWAY_MS);
    };

    const endAway = () => {
      if (awaySince === null) return;

      const awayMs = Date.now() - awaySince;

      awaySince = null;
      clearTimeout(cheatTimer);

      if (awayMs >= CHEAT_AWAY_MS) {
        reportCheat();
      } else if (awayMs >= WARN_AWAY_MS) {
        onWarnRef.current(Math.round(awayMs / 1000));
      }
    };

    const handleVisibility = () => {
      if (document.hidden) startAway();
      else if (document.hasFocus()) endAway();
    };

    const handleFocus = () => {
      if (!document.hidden) endAway();
    };

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", startAway);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearTimeout(cheatTimer);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", startAway);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled]);
};

export default useAntiCheat;
