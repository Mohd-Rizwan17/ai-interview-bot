import { useEffect, useState } from "react";
import DotLoader from "./DotLoader.jsx";

const SHOW_AFTER_MS = 400;

const PageLoader = ({ label, className = "min-h-[60vh]" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setIsVisible(true), SHOW_AFTER_MS);

    return () => clearTimeout(id);
  }, []);

  if (!isVisible) return <div className={className} />;

  return (
    <div
      role="status"
      className={`flex animate-[fade-in_250ms_ease-out] flex-col items-center justify-center gap-4 ${className}`}
    >
      <DotLoader />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
};

export default PageLoader;
