import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import RoundOption from "../components/RoundOption.jsx";
import { ALL_ROUNDS, DIFFICULTIES, ROUNDS } from "../constants/rounds.js";
import { logoutUser } from "../store/authSlice.js";
import { fetchActiveInterview } from "../store/historySlice.js";
import {
  clearInterviewError,
  startInterview,
} from "../store/interviewSlice.js";

const ROUND_TITLES = Object.fromEntries(
  ROUNDS.map((round) => [round.key, round.title]),
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const active = useSelector((state) => state.history.active);
  const { status, error } = useSelector((state) => state.interview);
  const [selected, setSelected] = useState([]);
  const [difficulty, setDifficulty] = useState("medium");
  const isStarting = status === "loading";
  const firstName = user?.fullName?.split(" ")[0];
  const title = selected.map((key) => ROUND_TITLES[key]).join(" + ");

  useEffect(() => {
    dispatch(clearInterviewError());
    dispatch(fetchActiveInterview());
  }, [dispatch]);

  const toggleRound = (key) => {
    setSelected((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  const handleStart = async () => {
    const result = await dispatch(
      startInterview({ difficulty, rounds: selected }),
    );

    if (startInterview.fulfilled.match(result)) {
      navigate(`/interview/${result.payload._id}`);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Hi, {firstName}</h1>
          <p className="text-sm text-muted">
            Pick your rounds and start a mock interview.
          </p>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            to="/history"
            className="rounded-md border border-line px-4 py-2 text-sm"
          >
            History
          </Link>
          <button
            type="button"
            onClick={() => dispatch(logoutUser())}
            className="rounded-md border border-line px-4 py-2 text-sm"
          >
            Logout
          </button>
        </nav>
      </header>

      {active && (
        <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent bg-panel p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-accent">
              Interview in progress
            </p>
            <p className="mt-1 font-semibold">{active.title}</p>
            <p className="text-sm text-muted">{active.progressPercent}% done</p>
          </div>
          <Link
            to={`/interview/${active._id}`}
            className="rounded-md bg-accent px-4 py-2 font-semibold text-ground"
          >
            Continue
          </Link>
        </section>
      )}

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Rounds</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelected(ALL_ROUNDS)}
              className="rounded-md border border-line px-3 py-1 text-sm"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => setSelected([])}
              disabled={selected.length === 0}
              className="rounded-md border border-line px-3 py-1 text-sm disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted">
          Rounds run in the order you pick them. All selects Aptitude,
          Reasoning, DSA, Frontend and Backend.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROUNDS.map((round) => (
            <RoundOption
              key={round.key}
              title={round.title}
              note={round.note}
              position={selected.indexOf(round.key) + 1}
              onToggle={() => toggleRound(round.key)}
            />
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-line bg-panel p-6">
        <h2 className="text-lg font-semibold">Difficulty</h2>
        <div className="mt-3 flex gap-2">
          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              aria-pressed={difficulty === level}
              className={`rounded-md border px-4 py-2 text-sm capitalize ${
                difficulty === level
                  ? "border-accent text-accent"
                  : "border-line text-muted"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted">
          {selected.length === 0
            ? "Select at least one round."
            : `${title} · ${selected.length} round${selected.length > 1 ? "s" : ""} · up to 10 questions each`}
        </p>

        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleStart}
          disabled={selected.length === 0 || isStarting}
          className="mt-4 w-full rounded-md bg-accent px-4 py-2 font-semibold text-ground disabled:opacity-60 sm:w-auto"
        >
          {isStarting ? "Preparing questions..." : "Start Interview"}
        </button>
        <p className={`mt-3 text-xs ${active ? "text-warn" : "text-muted"}`}>
          {active
            ? `Starting a new interview will end "${active.title}" and mark it incomplete.`
            : "Starting a new interview ends any interview already in progress."}
        </p>
      </section>
    </main>
  );
};

export default Dashboard;
