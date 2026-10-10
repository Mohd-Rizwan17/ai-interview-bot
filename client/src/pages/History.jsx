import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import HistoryRow from "../components/HistoryRow.jsx";
import Notice from "../components/Notice.jsx";
import { fetchHistory } from "../store/historySlice.js";

const PAGE_SIZE = 10;

const History = () => {
  const dispatch = useDispatch();
  const { items, page, limit, total, loaded, status, error } = useSelector(
    (state) => state.history,
  );

  useEffect(() => {
    dispatch(fetchHistory({ page: 1, limit: PAGE_SIZE }));
  }, [dispatch]);

  if (error) {
    return (
      <Notice title="Cannot load history">
        <p className="text-sm text-danger">{error}</p>
      </Notice>
    );
  }

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading history...</p>
      </main>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const isLoading = status === "loading";

  const goTo = (nextPage) => {
    dispatch(fetchHistory({ page: nextPage, limit: PAGE_SIZE }));
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <Link to="/" className="text-sm text-muted">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">History</h1>
      <p className="text-sm text-muted">
        Incomplete interviews cannot be reopened.
      </p>

      {items.length === 0 ? (
        <p className="mt-8 text-muted">
          No interviews yet.{" "}
          <Link to="/" className="text-accent">
            Start your first one
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {items.map((interview) => (
            <li key={interview._id}>
              <HistoryRow interview={interview} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-6 flex items-center justify-between"
        >
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page <= 1 || isLoading}
            className="rounded-md border border-line px-4 py-2 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <p className="font-mono text-sm text-muted">
            Page {page} of {totalPages}
          </p>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="rounded-md border border-line px-4 py-2 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      )}
    </main>
  );
};

export default History;
