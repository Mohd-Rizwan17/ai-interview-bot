import { useEffect, useState } from "react";
import api from "../api/axios.js";
import HeroLoader from "./HeroLoader.jsx";

const ATTEMPT_TIMEOUT_MS = 15000;
const RETRY_DELAY_MS = 3000;
const SHOW_LOADER_AFTER_MS = 1500;
const GIVE_UP_AFTER_MS = 120000;

const ServerWakeGate = ({ children }) => {
  const [status, setStatus] = useState("checking");
  const [showLoader, setShowLoader] = useState(false);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let retryTimer;
    const startedAt = Date.now();
    const showTimer = setTimeout(
      () => setShowLoader(true),
      SHOW_LOADER_AFTER_MS,
    );

    const check = async () => {
      try {
        const { data } = await api.get("/health", {
          timeout: ATTEMPT_TIMEOUT_MS,
        });
        if (cancelled) return;
        if (data?.success) {
          clearTimeout(showTimer);
          setStatus("ready");
          return;
        }
      } catch {
        // server is still waking up, try again
      }
      if (cancelled) return;
      if (Date.now() - startedAt >= GIVE_UP_AFTER_MS) {
        setStatus("failed");
        return;
      }
      retryTimer = setTimeout(check, RETRY_DELAY_MS);
    };

    check();

    return () => {
      cancelled = true;
      clearTimeout(showTimer);
      clearTimeout(retryTimer);
    };
  }, [runId]);

  const handleRetry = () => {
    setStatus("checking");
    setShowLoader(true);
    setRunId((value) => value + 1);
  };

  if (status === "ready") return children;
  if (status === "failed") {
    return <HeroLoader key={runId} failed onRetry={handleRetry} />;
  }
  if (showLoader) return <HeroLoader key={runId} />;
  return null;
};

export default ServerWakeGate;
