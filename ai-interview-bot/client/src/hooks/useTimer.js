import { useEffect, useState } from "react";

const useTimer = (endsAt) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timerId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timerId);
  }, []);

  if (!endsAt) return null;

  return Math.max(0, Math.ceil((endsAt - now) / 1000));
};

export default useTimer;
