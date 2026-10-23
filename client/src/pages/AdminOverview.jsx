import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import ImportList from "../components/ImportList.jsx";
import NeedsMoreList from "../components/NeedsMoreList.jsx";
import QuestionBars from "../components/QuestionBars.jsx";
import RoundBars from "../components/RoundBars.jsx";
import StatCard from "../components/StatCard.jsx";
import { DIFFICULTIES } from "../constants/rounds.js";
import { fetchAdminStats } from "../store/adminStatsSlice.js";

const sectionClass = "glass rounded-xl p-6";

const AdminOverview = () => {
  const dispatch = useDispatch();
  const { data, error } = useSelector((state) => state.adminStats);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  const renderBody = () => {
    if (!data) {
      return (
        <p
          role={error ? "alert" : "status"}
          className={`mt-6 text-sm ${error ? "text-danger" : "text-muted"}`}
        >
          {error ? `Cannot load stats: ${error}` : "Loading stats..."}
        </p>
      );
    }

    const { questions } = data;

    return (
      <>
        <section
          aria-label="Question bank"
          className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard label="Questions in bank" value={questions.total} />
          <StatCard label="Easy" value={questions.easy} />
          <StatCard label="Medium" value={questions.medium} />
          <StatCard label="Hard" value={questions.hard} />
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className={sectionClass}>
            <h2 className="text-lg font-semibold">How questions reach users</h2>
            <p className="mt-1 text-sm text-muted">
              The My Questions round picks random questions from the bank. It
              uses only the difficulty the user chose, so an Easy question never
              shows up in Medium or Hard.
            </p>
            <QuestionBars
              items={DIFFICULTIES.map((level) => ({
                label: level,
                count: questions[level],
              }))}
            />
          </section>

          <section className={sectionClass}>
            <h2 className="text-lg font-semibold">Recent imports</h2>
            <ImportList imports={data.recentImports} />
          </section>

          <section className={sectionClass}>
            <h2 className="text-lg font-semibold">
              All users: performance by round
            </h2>
            <p className="text-sm text-muted">
              {data.totals.interviews} interview
              {data.totals.interviews === 1 ? "" : "s"} taken
            </p>
            <RoundBars rounds={data.usersByRound} />
          </section>

          <section className={sectionClass}>
            <h2 className="text-lg font-semibold">Needs more questions</h2>
            <NeedsMoreList items={data.needsMore} />
          </section>
        </div>
      </>
    );
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-sm text-muted">
            Question bank and platform performance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/pdf-import"
            className="rounded-md border border-line px-4 py-2 text-sm"
          >
            Import from PDF
          </Link>
          <Link
            to="/my-questions?add=1"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ground"
          >
            Add question
          </Link>
        </div>
      </header>

      {renderBody()}
    </main>
  );
};

export default AdminOverview;
