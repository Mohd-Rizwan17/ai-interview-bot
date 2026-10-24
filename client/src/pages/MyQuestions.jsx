import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CustomQuestionForm from "../components/CustomQuestionForm.jsx";
import CustomQuestionRow from "../components/CustomQuestionRow.jsx";
import Notice from "../components/Notice.jsx";
import PdfImport from "../components/PdfImport.jsx";
import { useSearchParams } from "react-router";
import { DIFFICULTIES } from "../constants/rounds.js";
import PageLoader from "../components/PageLoader.jsx";
import {
  clearActionError,
  fetchCustomQuestions,
} from "../store/customQuestionSlice.js";

const MAX_QUESTIONS = 200;
const FILTERS = ["all", ...DIFFICULTIES];

const MyQuestions = () => {
  const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const [showForm, setShowForm] = useState(
      () => searchParams.get("add") === "1",
    );
  const [showImport, setShowImport] = useState(false);
  const [filter, setFilter] = useState("all");
  const { items, loaded, error, actionError } = useSelector(
    (state) => state.customQuestions,
  );
  const isFull = items.length >= MAX_QUESTIONS;
  const isPanelOpen = showForm || showImport;
  const visible =
    filter === "all"
      ? items
      : items.filter((question) => question.difficulty === filter);

  useEffect(() => {
    dispatch(fetchCustomQuestions());

    return () => {
      dispatch(clearActionError());
    };
  }, [dispatch]);

  const countOf = (level) =>
    level === "all"
      ? items.length
      : items.filter((question) => question.difficulty === level).length;

  const openForm = () => {
    dispatch(clearActionError());
    setShowForm(true);
  };

  const openImport = () => {
    dispatch(clearActionError());
    setShowImport(true);
  };

  if (error) {
    return (
      <Notice title="Cannot load your questions">
        <p className="text-sm text-danger">{error}</p>
      </Notice>
    );
  }

  if (!loaded) {
    return <PageLoader label="Loading questions" />;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* <Link to="/" className="text-sm text-muted">
        ← Dashboard
      </Link> */}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Questions</h1>
          <p className="font-mono text-sm text-muted">
            {items.length} / {MAX_QUESTIONS} saved
          </p>
        </div>
        {!isPanelOpen && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openImport}
              disabled={isFull}
              className="rounded-md border border-line px-4 py-2 text-sm disabled:opacity-60"
            >
              Import from PDF
            </button>
            <button
              type="button"
              onClick={openForm}
              disabled={isFull}
              className="rounded-md bg-accent px-4 py-2 font-semibold text-ground disabled:opacity-60"
            >
              Add question
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-muted">
        These questions go into the My Questions round, by difficulty.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setFilter(level)}
            aria-pressed={filter === level}
            className={`rounded-md border px-3 py-1 text-sm capitalize ${
              filter === level
                ? "border-accent text-accent"
                : "border-line text-muted"
            }`}
          >
            {level} <span className="font-mono">{countOf(level)}</span>
          </button>
        ))}
      </div>

      {isFull && !isPanelOpen && (
        <p className="mt-2 text-sm text-warn">
          Limit reached. Delete a question to add a new one.
        </p>
      )}

      {actionError && !showForm && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {actionError}
        </p>
      )}

      {showForm && (
        <CustomQuestionForm
          onDone={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showImport && <PdfImport onClose={() => setShowImport(false)} />}

      {visible.length === 0 ? (
        <p className="mt-8 text-muted">
          {items.length === 0
            ? "No questions yet."
            : `No ${filter} questions yet.`}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {visible.map((question) => (
            <li key={question._id}>
              <CustomQuestionRow question={question} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default MyQuestions;
