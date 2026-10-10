import { useEffect, useRef } from "react";
import api from "../api/axios.js";

const useAntiCheat = ({ enabled, interviewId, onCheat }) => {
  const onCheatRef = useRef(onCheat);
  const reportedRef = useRef(false);

  useEffect(() => {
    onCheatRef.current = onCheat;
  }, [onCheat]);

  useEffect(() => {
    if (!enabled) return undefined;

    reportedRef.current = false;

    const report = () => {
      if (reportedRef.current) return;

      reportedRef.current = true;
      onCheatRef.current();
    };

    const handleVisibility = () => {
      if (document.hidden) report();
    };

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handlePageHide = () => {
      if (reportedRef.current) return;

      reportedRef.current = true;
      fetch(`${api.defaults.baseURL}/interviews/${interviewId}/cheat`, {
        method: "POST",
        credentials: "include",
        keepalive: true,
      });
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", report);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", report);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [enabled, interviewId]);
};

export default useAntiCheat;
