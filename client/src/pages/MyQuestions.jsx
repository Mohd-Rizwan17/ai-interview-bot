import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import CustomQuestionRow from "../components/CustomQuestionRow.jsx";
import Notice from "../components/Notice.jsx";
import {
  clearActionError,
  fetchCustomQuestions,
} from "../store/customQuestionSlice.js";

const MAX_QUESTIONS = 50;

const MyQuestions = () => {
  const dispatch = useDispatch();
  const { items, loaded, error, actionError } = useSelector(
    (state) => state.customQuestions,
  );

  useEffect(() => {
    dispatch(fetchCustomQuestions());

    return () => {
      dispatch(clearActionError());
    };
  }, [dispatch]);

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

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold">My Questions</h1>
        <p className="font-mono text-sm text-muted">
          {items.length} / {MAX_QUESTIONS} saved
        </p>
      </div>
      <p className="text-sm text-muted">
        These questions are used in the My Questions round.
      </p>

      {actionError && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {actionError}
        </p>
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
