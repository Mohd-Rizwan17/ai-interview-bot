import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import CustomQuestionForm from "../components/CustomQuestionForm.jsx";
import CustomQuestionRow from "../components/CustomQuestionRow.jsx";
import Notice from "../components/Notice.jsx";
import {
  clearActionError,
  fetchCustomQuestions,
} from "../store/customQuestionSlice.js";

const MAX_QUESTIONS = 50;

const MyQuestions = () => {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const { items, loaded, error, actionError } = useSelector(
    (state) => state.customQuestions,
  );
  const isFull = items.length >= MAX_QUESTIONS;

  useEffect(() => {
    dispatch(fetchCustomQuestions());

    return () => {
      dispatch(clearActionError());
    };
  }, [dispatch]);

  const openForm = () => {
    dispatch(clearActionError());
    setShowForm(true);
  };

  if (error) {
    return (
      <Notice title="Cannot load your questions">
        <p className="text-sm text-danger">{error}</p>
      </Notice>
    );
  }

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading questions...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <Link to="/" className="text-sm text-muted">
        ← Dashboard
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Questions</h1>
          <p className="font-mono text-sm text-muted">
            {items.length} / {MAX_QUESTIONS} saved
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openForm}
            disabled={isFull}
            className="rounded-md bg-accent px-4 py-2 font-semibold text-ground disabled:opacity-60"
          >
            Add question
          </button>
        )}
      </div>
      <p className="text-sm text-muted">
        These questions are used in the My Questions round.
      </p>

      {isFull && !showForm && (
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

      {items.length === 0 ? (
        <p className="mt-8 text-muted">No questions yet.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {items.map((question) => (
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
