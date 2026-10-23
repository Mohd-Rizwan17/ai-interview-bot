import { X } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissToast } from "../store/toastSlice.js";

const HIDE_MS = 4000;

const TONES = {
  success: "border-accent text-accent",
  error: "border-danger text-danger",
};

const Toast = ({ toast }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), HIDE_MS);

    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <li
      className={`toast-in pointer-events-auto flex items-start justify-between gap-3 rounded-lg border bg-panel px-4 py-3 text-sm shadow-lg ${TONES[toast.tone]}`}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => dispatch(dismissToast(toast.id))}
        className="mt-0.5 shrink-0 text-muted hover:text-ink"
      >
        <X size={14} />
      </button>
    </li>
  );
};

const ToastHost = () => {
  const items = useSelector((state) => state.toasts.items);

  return (
    <ul
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-2"
    >
      {items.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </ul>
  );
};

export default ToastHost;
