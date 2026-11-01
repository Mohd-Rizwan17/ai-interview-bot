import { useEffect, useId, useRef, useState } from "react";

const LOCK_CODES = ["OTP_EXPIRED", "OTP_BLOCKED"];

const OtpModal = ({
  email,
  otp,
  expiresInSeconds,
  onVerify,
  onResend,
  onClose,
}) => {
  const dialogRef = useRef(null);
  const titleId = useId();
  const [secondsLeft, setSecondsLeft] = useState(expiresInSeconds);
  const [code, setCode] = useState("");
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const isDead = secondsLeft === 0 || locked;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setSecondsLeft((seconds) => Math.max(seconds - 1, 0)),
      1000,
    );

    return () => clearInterval(id);
  }, []);

  const handleCancel = (event) => {
    event.preventDefault();
    onClose();
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleChange = (event) => {
    setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await onVerify(code);
    } catch (rejection) {
      setError(rejection.message);
      if (LOCK_CODES.includes(rejection.code)) setLocked(true);
      setCode("");
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setBusy(true);
    setError(null);

    try {
      await onResend();
    } catch (rejection) {
      setError(rejection.message);
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className="modal m-auto w-full max-w-sm rounded-xl border border-line bg-panel p-0 text-ink"
    >
      <form onSubmit={handleSubmit} className="p-5">
        <h2 id={titleId} className="text-lg font-semibold">
          Verify OTP
        </h2>
        <p className="mt-1 text-sm text-muted">
          OTP for {email}. There is no email service yet, so it is shown here.
        </p>

        <p
          className={`mt-4 text-center font-mono text-4xl font-semibold tracking-[0.4em] text-accent ${isDead ? "line-through opacity-40" : ""}`}
        >
          <span className="pl-[0.4em]">{otp}</span>
        </p>

        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full origin-left bg-accent transition-transform duration-1000 ease-linear"
            style={{ transform: `scaleX(${secondsLeft / expiresInSeconds})` }}
          />
        </div>
        <p
          role={isDead ? "status" : undefined}
          className={`mt-2 text-sm ${isDead ? "text-warn" : "text-muted"}`}
        >
          {isDead ? "OTP expired. Please resend." : `${secondsLeft}s left`}
        </p>

        <label htmlFor="otp" className="mt-4 block text-sm text-muted">
          Enter OTP
        </label>
        <input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          disabled={isDead}
          value={code}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border border-line bg-ground/40 px-3 py-2 text-center font-mono text-lg tracking-[0.4em] text-ink placeholder:text-muted disabled:opacity-50"
        />

        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={busy}
            className={`rounded-md border px-4 py-2 text-sm disabled:opacity-60 ${isDead ? "glow-pulse border-accent text-accent" : "border-line"}`}
          >
            Resend OTP
          </button>
          <button
            type="submit"
            disabled={busy || isDead || code.length !== 6}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ground disabled:opacity-60"
          >
            {busy ? "Please wait..." : "Verify"}
          </button>
        </div>
      </form>
    </dialog>
  );
};

export default OtpModal;
