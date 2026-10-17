import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { DIFFICULTIES, ROUNDS } from "../constants/rounds.js";
import StackPicker from "../features/miniProject/components/StackPicker.jsx";
import { fetchActiveInterview } from "../store/historySlice.js";
import {
  clearInterviewError,
  startInterview,
} from "../store/interviewSlice.js";
import { setDifficulty, setProjectStack } from "../store/selectionSlice.js";

const ROUND_TITLES = Object.fromEntries(
  ROUNDS.map((round) => [round.key, round.title]),
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const active = useSelector((state) => state.history.active);
  const counts = useSelector((state) => state.customQuestions.counts);
  const { status, error } = useSelector((state) => state.interview);
  const {
    rounds: selected,
    difficulty,
    projectStack,
  } = useSelector((state) => state.selection);
  const isStarting = status === "loading";
  const firstName = user?.fullName?.split(" ")[0];
  const title = selected.map((key) => ROUND_TITLES[key]).join(" + ");
  const hasMiniProject = selected.includes("mini-project");
  const hasNoCustomQuestions =
    selected.includes("my-questions") &&
    counts !== null &&
    counts[difficulty] === 0;

  useEffect(() => {
    dispatch(clearInterviewError());
    dispatch(fetchActiveInterview());
  }, [dispatch]);

  const handleStart = async () => {
    const payload = { difficulty, rounds: selected };

    if (hasMiniProject) payload.projectStack = projectStack;

    const result = await dispatch(startInterview(payload));

    if (startInterview.fulfilled.match(result)) {
      navigate(`/interview/${result.payload._id}`);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Hi, {firstName}</h1>
        <p className="text-sm text-muted">
          Pick rounds from the sidebar and start a mock interview.
        </p>
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

      <section className="mt-8 rounded-xl border border-line bg-panel p-6">
        <h2 className="text-lg font-semibold">Difficulty</h2>
        <div className="mt-3 flex gap-2">
          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => dispatch(setDifficulty(level))}
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

        {hasMiniProject && (
          <StackPicker
            value={projectStack}
            onChange={(stack) => dispatch(setProjectStack(stack))}
          />
        )}

        <p className="mt-6 text-sm text-muted">
          {selected.length === 0
            ? "Select at least one round from the sidebar."
            : `${title} · ${selected.length} round${selected.length > 1 ? "s" : ""} · up to 10 questions each`}
        </p>

        {hasNoCustomQuestions && (
          <p role="status" className="mt-3 text-sm text-warn">
            No {difficulty} questions in My Questions yet. Choose another
            difficulty or remove that round.
          </p>
        )}

        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleStart}
          disabled={
            selected.length === 0 ||
            isStarting ||
            hasNoCustomQuestions ||
            (hasMiniProject && !projectStack)
          }
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
