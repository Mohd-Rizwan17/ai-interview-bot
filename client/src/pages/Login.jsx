import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router";
import ProximityText from "../components/ProximityText.jsx";
import useCardSlide from "../hooks/useCardSlide.js";
import {
  cancelConflict,
  clearAuthError,
  confirmLogin,
  loginUser,
} from "../store/authSlice.js";
import {
  playWipe,
  pointOf,
  prefersReducedMotion,
} from "../utils/circleWipe.js";

const inputClass =
  "w-full rounded-md border border-line bg-ground/40 px-3 py-2 text-ink placeholder:text-muted";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status, error, conflict, sessionEnded } = useSelector(
    (state) => state.auth,
  );
  const [form, setForm] = useState({ email: "", password: "" });
  const isWipingRef = useRef(false);
  const cardRef = useCardSlide();
  const isLoading = status === "loading";

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  if (user && !isWipingRef.current) return <Navigate to="/" replace />;

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const runLogin = async (action, trigger) => {
    const shouldWipe = !prefersReducedMotion();
    const origin = pointOf(trigger);

    isWipingRef.current = shouldWipe;

    const result = await dispatch(action);
    const isSuccess = result.meta.requestStatus === "fulfilled";

    if (!shouldWipe || !isSuccess) {
      isWipingRef.current = false;
      return;
    }

    const release = await playWipe(origin);

    isWipingRef.current = false;
    navigate("/", { replace: true });
    release();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    runLogin(loginUser(form), event.nativeEvent.submitter);
  };

  if (conflict) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <section className="glass-strong w-full max-w-md rounded-xl p-6">
          <h1 className="text-xl font-semibold">
            Already logged in on another device
          </h1>
          <p className="mt-2 text-sm text-muted">
            {conflict.device?.name} was last active on{" "}
            {new Date(conflict.device?.lastActiveAt).toLocaleString()}. If you
            continue here, that device will be logged out and its running
            interview will be marked incomplete.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={(event) =>
                runLogin(
                  confirmLogin(conflict.confirmToken),
                  event.currentTarget,
                )
              }
              className="rounded-md bg-accent px-4 py-2 font-semibold text-ground disabled:opacity-60"
            >
              {isLoading
                ? "Please wait..."
                : "Logout other device and continue here"}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => dispatch(cancelConflict())}
              className="rounded-md border border-line px-4 py-2 text-ink hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form
        ref={cardRef}
        onSubmit={handleSubmit}
        className="glass-strong w-full max-w-md rounded-xl p-6"
      >
        <h1 className="text-2xl font-semibold">
          <ProximityText text="Welcome back" />
        </h1>
        <p className="mt-1 text-sm text-muted">Login to continue practising.</p>

        {sessionEnded && (
          <p
            role="status"
            className="mt-4 rounded-md border border-warn px-3 py-2 text-sm text-warn"
          >
            You were logged out because your account was used on another device.
          </p>
        )}

        <label htmlFor="email" className="mt-6 block text-sm text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={handleChange}
          className={`${inputClass} mt-1`}
        />

        <label htmlFor="password" className="mt-4 block text-sm text-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
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
          disabled={isLoading}
          className="mt-6 w-full rounded-md bg-accent px-4 py-2 font-semibold text-ground disabled:opacity-60"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-center text-sm text-muted">
          New here?{" "}
          <Link to="/register" state={{ slide: 1 }} className="text-accent">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
};

export default Login;
