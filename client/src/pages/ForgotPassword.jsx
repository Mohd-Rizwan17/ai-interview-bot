import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router";
import OtpModal from "../components/OtpModal.jsx";
import {
  forgotPassword,
  resetPassword,
  verifyResetOtp,
} from "../store/authSlice.js";

const inputClass =
  "w-full rounded-md border border-line bg-ground/40 px-3 py-2 text-ink placeholder:text-muted";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otpData, setOtpData] = useState(null);
  const [resetToken, setResetToken] = useState("");
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    const data = await dispatch(forgotPassword(email.trim())).unwrap();
    setOtpData(data);
  };

  const verifyOtp = async (otp) => {
    const data = await dispatch(
      verifyResetOtp({ email: email.trim(), otp }),
    ).unwrap();

    setResetToken(data.resetToken);
    setOtpData(null);
    setStep("password");
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await sendOtp();
    } catch (rejection) {
      setError(rejection.message);
    } finally {
      setBusy(false);
    }
  };

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setBusy(true);

    try {
      await dispatch(resetPassword({ resetToken, ...form })).unwrap();
      setStep("done");
    } catch (rejection) {
      setError(rejection.message);
      if (rejection.code === "RESET_EXPIRED") setStep("email");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <section className="glass-strong page-enter w-full max-w-md rounded-xl p-6">
        {step === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <h1 className="text-2xl font-semibold">Forgot password</h1>
            <p className="mt-1 text-sm text-muted">
              Enter your registered email to get a 6 digit OTP.
            </p>

            <label htmlFor="email" className="mt-6 block text-sm text-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`${inputClass} mt-1`}
            />

            {error && (
              <p role="alert" className="mt-4 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full rounded-md bg-accent px-4 py-2 font-semibold text-ground disabled:opacity-60"
            >
              {busy ? "Sending..." : "Send OTP"}
            </button>

            <p className="mt-4 text-center text-sm text-muted">
              <Link to="/login" className="text-accent">
                Back to login
              </Link>
            </p>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleResetSubmit}>
            <h1 className="text-2xl font-semibold">Set a new password</h1>
            <p className="mt-1 text-sm text-muted">
              OTP verified for {email.trim()}.
            </p>

            <label htmlFor="password" className="mt-6 block text-sm text-muted">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={form.password}
              onChange={handleChange}
              className={`${inputClass} mt-1`}
            />

            <label
              htmlFor="confirmPassword"
              className="mt-4 block text-sm text-muted"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className={`${inputClass} mt-1`}
            />

            {error && (
              <p role="alert" className="mt-4 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full rounded-md bg-accent px-4 py-2 font-semibold text-ground disabled:opacity-60"
            >
              {busy ? "Updating..." : "Update password"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div>
            <h1 className="text-2xl font-semibold">Password updated</h1>
            <p className="mt-1 text-sm text-muted">
              Login with your new password. Any other logged in device has been
              logged out.
            </p>
            <Link
              to="/login"
              className="mt-6 block rounded-md bg-accent px-4 py-2 text-center font-semibold text-ground"
            >
              Go to login
            </Link>
          </div>
        )}
      </section>

      {otpData && (
        <OtpModal
          key={otpData.expiresAt}
          email={email.trim()}
          otp={otpData.otp}
          expiresInSeconds={otpData.expiresInSeconds}
          onVerify={verifyOtp}
          onResend={sendOtp}
          onClose={() => setOtpData(null)}
        />
      )}
    </main>
  );
};

export default ForgotPassword;
