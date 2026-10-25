import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router";
import { clearAuthError, registerUser } from "../store/authSlice.js";
import ProximityText from "../components/ProximityText.jsx";

const inputClass =
  "w-full rounded-md border border-line bg-ground/40 px-3 py-2 text-ink placeholder:text-muted";

const fields = [
  { name: "fullName", label: "Full name", type: "text", autoComplete: "name" },
  {
    name: "username",
    label: "Username",
    type: "text",
    autoComplete: "username",
    hint: "3 to 20 characters: letters, numbers or underscore",
  },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    hint: "At least 8 characters, with a letter and a number",
  },
  {
    name: "confirmPassword",
    label: "Confirm password",
    type: "password",
    autoComplete: "new-password",
  },
];

const Register = () => {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const isLoading = status === "loading";

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(registerUser(form));
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="glass-strong w-full max-w-md rounded-xl p-6"
      >
        <h1 className="text-2xl font-semibold">
          <ProximityText text="Create your account" />
        </h1>
        <p className="mt-1 text-sm text-muted">
          Start practising mock interviews.
        </p>

        {fields.map((field) => (
          <div key={field.name} className="mt-4">
            <label htmlFor={field.name} className="block text-sm text-muted">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              required
              value={form[field.name]}
              onChange={handleChange}
              aria-describedby={field.hint ? `${field.name}-hint` : undefined}
              className={`${inputClass} mt-1`}
            />
            {field.hint && (
              <p id={`${field.name}-hint`} className="mt-1 text-xs text-muted">
                {field.hint}
              </p>
            )}
          </div>
        ))}

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
          {isLoading ? "Creating account..." : "Register"}
        </button>

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-accent">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
};

export default Register;
