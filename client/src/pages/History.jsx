import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import HistoryRow from "../components/HistoryRow.jsx";
import Notice from "../components/Notice.jsx";
import {
  clearActionError,
  clearHistory,
  fetchHistory,
  updateRetention,
} from "../store/historySlice.js";

const PAGE_SIZE = 3;
const SEARCH_DELAY_MS = 400;
const RETENTION_OPTIONS = [3, 5, 7, 10, 20, 30];

const History = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const {
    items,
    page,
    limit,
    total,
    search,
    retentionDays,
    loaded,
    status,
    error,
    busy,
    actionError,
  } = useSelector((state) => state.history);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        dispatch(
          fetchHistory({ page: 1, limit: PAGE_SIZE, search: query.trim() }),
        );
      },
      query ? SEARCH_DELAY_MS : 0,
    );

    return () => clearTimeout(timer);
  }, [dispatch, query]);

  useEffect(() => () => dispatch(clearActionError()), [dispatch]);

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
  const isSearching = Boolean(query.trim() || search);

  const goTo = (nextPage) => {
    dispatch(fetchHistory({ page: nextPage, limit: PAGE_SIZE, search }));
  };

  const handleClear = () => {
    const message = "Delete all finished interviews? This cannot be undone.";

    if (window.confirm(message)) dispatch(clearHistory());
  };

  const handleRetention = (event) => {
    const days = Number(event.target.value);
    const message = `Interviews older than ${days} days will be deleted right now. Continue?`;

    if (days < retentionDays && !window.confirm(message)) return;

    dispatch(updateRetention(days));
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      {/* <Link to="/" className="text-sm text-muted">
        ← Dashboard
      </Link> */}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">History</h1>
        {!isSearching && total > 0 && (
          <button
            type="button"
            onClick={handleClear}
            disabled={busy}
            className="rounded-md border border-danger px-3 py-1.5 text-sm text-danger disabled:opacity-50"
          >
            Delete all
          </button>
        )}
      </div>
      <p className="text-sm text-muted">
        Incomplete interviews cannot be reopened.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label htmlFor="history-search" className="sr-only">
          Search interviews
        </label>
        <input
          id="history-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title"
          maxLength={50}
          className="min-w-0 flex-1 rounded-md border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="retention" className="text-sm text-muted">
            Auto-delete after
          </label>
          <select
            id="retention"
            value={retentionDays ?? ""}
            onChange={handleRetention}
            disabled={busy || retentionDays === null}
            className="rounded-md border border-line bg-panel px-2 py-2 text-sm disabled:opacity-50"
          >
            {RETENTION_OPTIONS.map((days) => (
              <option key={days} value={days}>
                {days} days
              </option>
            ))}
          </select>
        </div>
      </div>

      {actionError && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {actionError}
        </p>
      )}

      {items.length === 0 ? (
        isSearching ? (
          <p className="mt-8 text-muted">No interviews match your search.</p>
        ) : (
          <p className="mt-8 text-muted">
            No interviews yet.{" "}
            <Link to="/" className="text-accent">
              Start your first one
            </Link>
            .
          </p>
        )
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
