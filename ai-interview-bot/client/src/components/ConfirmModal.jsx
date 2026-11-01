import { useEffect, useId, useRef } from "react";

const ConfirmModal = ({
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog.open) dialog.showModal();
  }, []);

  const handleCancel = (event) => {
    event.preventDefault();

    if (!busy) onCancel();
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !busy) onCancel();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className="modal m-auto w-full max-w-sm rounded-xl border border-line bg-panel p-0 text-ink"
    >
      <div className="p-5">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        {message && <p className="mt-1 text-sm text-muted">{message}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border border-line px-4 py-2 text-sm disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-md border border-danger px-4 py-2 text-sm text-danger disabled:opacity-60"
          >
            {busy ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmModal;
