import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import RecentList from "../components/RecentList.jsx";
import RoundBars from "../components/RoundBars.jsx";
import StatCard from "../components/StatCard.jsx";
import TrendChart from "../components/TrendChart.jsx";
import { DIFFICULTIES, ROUNDS } from "../constants/rounds.js";
import StackPicker from "../features/miniProject/components/StackPicker.jsx";
import { fetchActiveInterview } from "../store/historySlice.js";
import {
  clearInterviewError,
  startInterview,
} from "../store/interviewSlice.js";
import { setDifficulty, setProjectStack } from "../store/selectionSlice.js";
import { fetchStats } from "../store/statsSlice.js";
import RoundRadar from "../components/RoundRadar.jsx";
import RoundTreemap from "../components/RoundTreemap.jsx";

const ROUND_TITLES = Object.fromEntries(
  ROUNDS.map((round) => [round.key, round.title]),
);

const sectionClass = "glass rounded-xl p-6";

const roundValue = (round) => (round ? round.title : "—");

const roundNote = (round, fallback) =>
  round ? `${round.percent}% average` : fallback;

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const active = useSelector((state) => state.history.active);
  const counts = useSelector((state) => state.customQuestions.counts);
  const stats = useSelector((state) => state.stats);
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
  const data = stats.data;

  useEffect(() => {
    dispatch(clearInterviewError());
    dispatch(fetchActiveInterview());
    dispatch(fetchStats());
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
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Hi, {firstName}</h1>
        <p className="text-sm text-muted">Your progress and performance.</p>
      </header>

      {active && (
        <section className="glass mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border-accent p-4">
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

      {!data && stats.error && (
        <p role="alert" className="mt-6 text-sm text-danger">
          Cannot load stats: {stats.error}
        </p>
      )}

      {!data && !stats.error && (
        <PageLoader label="Preparing your dashboard" className="min-h-64" />
      )}

      {data && (
        <section
          aria-label="Your stats"
          className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            label="Interviews"
            value={data.interviews}
            note="Finished or ended"
          />
          <StatCard
            label="Average score"
            value={data.averageScore === null ? "—" : `${data.averageScore}%`}
            note="Completed interviews"
            tone="text-accent"
          />
          <StatCard
            label="Best round"
            value={roundValue(data.bestRound)}
            note={roundNote(data.bestRound, "No data yet")}
          />
          <StatCard
            label="Needs work"
            value={roundValue(data.weakestRound)}
            note={roundNote(data.weakestRound, "Needs 2 graded rounds")}
            tone={data.weakestRound ? "text-warn" : "text-ink"}
          />
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {data && (
          <section className={`${sectionClass} lg:col-span-7`}>
            <h2 className="text-lg font-semibold">Score trend</h2>
            <TrendChart points={data.trend} />
          </section>
        )}

        <section
          className={`glass rounded-xl border-accent p-6 ${data ? "lg:col-span-5" : "lg:col-span-12"}`}
        >
          <h2 className="text-lg font-semibold">Start interview</h2>
          <p className="mt-1 text-sm text-muted">
            {selected.length === 0
              ? "Select at least one round from the sidebar."
              : `${title} · ${selected.length} round${selected.length > 1 ? "s" : ""} · up to 10 questions each`}
          </p>

          <p className="mt-4 text-sm text-muted">Difficulty</p>
          <div className="mt-2 flex gap-2">
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

          {hasNoCustomQuestions && (
            <p role="status" className="mt-4 text-sm text-warn">
              No {difficulty} questions in My Questions yet. Choose another
              difficulty or remove that round.
            </p>
          )}

          {error && (
            <p role="alert" className="mt-4 text-sm text-danger">
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
            className="mt-6 w-full rounded-md bg-accent px-4 py-2 font-semibold text-ground disabled:opacity-60"
          >
            {isStarting ? "Preparing questions..." : "Start Interview"}
          </button>
          <p className={`mt-3 text-xs ${active ? "text-warn" : "text-muted"}`}>
            {active
              ? `Starting a new interview will end "${active.title}" and mark it incomplete.`
              : "Starting a new interview ends any interview already in progress."}
          </p>
        </section>

        {data && (
          <>
            <section className={`${sectionClass} lg:col-span-7`}>
              <h2 className="text-lg font-semibold">Performance by round</h2>
              <RoundTreemap rounds={data.byRound} />
            </section>

            <section className={`${sectionClass} lg:col-span-5`}>
              <h2 className="text-lg font-semibold">Strength by round</h2>
              <RoundRadar rounds={data.byRound} />
            </section>

            <section className={`${sectionClass} lg:col-span-12`}>
              <h2 className="text-lg font-semibold">Recent interviews</h2>
              <RecentList interviews={data.recent} />
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
