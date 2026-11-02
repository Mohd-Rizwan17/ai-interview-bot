import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router";
import OtpModal from "../components/OtpModal.jsx";
import { getQuestionLabel } from "../constants/securityQuestions.js";
import {
  checkSecurityAnswer,
  fetchSecurityQuestion,
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
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerToken, setAnswerToken] = useState("");
  const [otpData, setOtpData] = useState(null);
  const [resetToken, setResetToken] = useState("");
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const sendOtp = async (token) => {
    const data = await dispatch(
      forgotPassword({ email: email.trim(), answerToken: token }),
    ).unwrap();
    setOtpData(data);
  };

  const backToEmail = () => {
    setStep("email");
    setQuestion("");
    setAnswer("");
    setAnswerToken("");
    setError(null);
  };

  const verifyOtp = async (otp) => {
    const data = await dispatch(
      verifyResetOtp({ email: email.trim(), otp }),
    ).unwrap();

    setResetToken(data.resetToken);
    setOtpData(null);
    setStep("password");
  };

  const handleResend = async () => {
    try {
      await sendOtp(answerToken);
    } catch (rejection) {
      if (rejection.code !== "SECURITY_EXPIRED") throw rejection;

      setOtpData(null);
      setAnswer("");
      setAnswerToken("");
      setError(rejection.message);
      setStep("question");
    }
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const data = await dispatch(fetchSecurityQuestion(email.trim())).unwrap();
      setQuestion(data.question);
      setStep("question");
    } catch (rejection) {
      setError(rejection.message);
    } finally {
      setBusy(false);
    }
  };

  const handleAnswerSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const data = await dispatch(
        checkSecurityAnswer({ email: email.trim(), answer }),
      ).unwrap();
      setAnswerToken(data.answerToken);
      await sendOtp(data.answerToken);
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
              Enter your registered email to continue.
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
              {busy ? "Checking..." : "Continue"}
            </button>

            <p className="mt-4 text-center text-sm text-muted">
              <Link to="/login" className="text-accent">
                Back to login
              </Link>
            </p>
          </form>
        )}

        {step === "question" && (
          <form onSubmit={handleAnswerSubmit}>
            <h1 className="text-2xl font-semibold">Security check</h1>
            <p className="mt-1 text-sm text-muted">
              Answer your security question for {email.trim()}.
            </p>

            <p className="mt-6 text-sm text-muted">Your question</p>
            <p className="mt-1 font-medium">{getQuestionLabel(question)}</p>

            <label htmlFor="answer" className="mt-4 block text-sm text-muted">
              Your answer
            </label>
            <input
              id="answer"
              name="answer"
              type="text"
              autoComplete="off"
              required
              minLength={2}
              maxLength={60}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
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
              {busy ? "Checking..." : "Verify answer"}
            </button>

            <p className="mt-4 text-center text-sm text-muted">
              <button
                type="button"
                onClick={backToEmail}
                className="text-accent"
              >
                Use a different email
              </button>
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
          onResend={handleResend}
          onClose={() => setOtpData(null)}
        />
      )}
    </main>
  );
};

export default ForgotPassword;
