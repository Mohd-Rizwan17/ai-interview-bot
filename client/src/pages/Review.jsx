import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useParams } from "react-router";
import Notice from "../components/Notice.jsx";
import ReviewQuestion from "../components/ReviewQuestion.jsx";
import ScoreCard from "../components/ScoreCard.jsx";
import { fetchReview, resetReview } from "../store/reviewSlice.js";

const sumOf = (attempts, key) =>
  attempts.reduce((sum, attempt) => sum + attempt[key], 0);

const Review = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { interview, attempts, summary, error } = useSelector(
    (state) => state.review,
  );
  const [onlyMistakes, setOnlyMistakes] = useState(false);

  useEffect(() => {
    dispatch(resetReview());
    dispatch(fetchReview(id));
  }, [dispatch, id]);

  if (error) {
    return (
      <Notice title="Cannot open this review">
        <p className="text-sm text-danger">{error}</p>
      </Notice>
    );
  }

  if (!interview) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading review...</p>
      </main>
    );
  }

  if (interview.status === "in_progress") {
    return <Navigate to={`/interview/${id}`} replace />;
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <Link to="/" className="text-sm text-muted">
        ← Dashboard
      </Link>

      <div className="mt-4">
        <ScoreCard interview={interview} summary={summary} />
      </div>

      <label className="mt-6 flex w-fit cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={onlyMistakes}
          onChange={(event) => setOnlyMistakes(event.target.checked)}
        />
        Show only mistakes
      </label>

      {interview.rounds.map((round) => {
        const roundAttempts = attempts.filter(
          (attempt) => attempt.roundKey === round.key,
        );
        const visible = onlyMistakes
          ? roundAttempts.filter(
              (attempt) =>
                attempt.format !== "project" && attempt.isCorrect !== true,
            )
          : roundAttempts;

        return (
          <section key={round.key} className="mt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">
                Round {round.order}: {round.title}
              </h2>
              <p className="font-mono text-sm text-muted">
                {sumOf(roundAttempts, "maxScore") === 0
                  ? "Not graded"
                  : `${sumOf(roundAttempts, "score")} / ${sumOf(roundAttempts, "maxScore")}`}
              </p>
            </div>
            {round.status === "locked" && (
              <p className="mt-1 text-sm text-muted">
                This round was not attempted.
              </p>
            )}

            <div className="mt-3 flex flex-col gap-4">
              {visible.map((attempt) => (
                <ReviewQuestion key={attempt._id} attempt={attempt} />
              ))}
              {visible.length === 0 && (
                <p className="text-sm text-muted">No mistakes here.</p>
              )}
            </div>
          </section>
        );
      })}
    </main>
  );
};

export default Review;
