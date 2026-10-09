import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router";
import { cancelConflict, confirmLogin, loginUser } from "../store/authSlice.js";

const inputClass =
  "w-full rounded-md border border-line bg-ground px-3 py-2 text-ink placeholder:text-muted";

const Login = () => {
  const dispatch = useDispatch();
  const { user, status, error, conflict } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const isLoading = status === "loading";

  if (user) return <Navigate to="/" replace />;

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(loginUser(form));
  };

  if (conflict) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <section className="w-full max-w-md rounded-xl border border-line bg-panel p-6">
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
              onClick={() => dispatch(confirmLogin(conflict.confirmToken))}
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
              className="rounded-md border border-line px-4 py-2 text-ink"
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
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-line bg-panel p-6"
      >
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Login to continue practising.</p>

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
          <Link to="/register" className="text-accent">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
};

export default Login;
