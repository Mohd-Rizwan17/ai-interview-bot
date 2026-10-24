import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import LeaderboardPodium from "../components/LeaderboardPodium.jsx";
import LeaderboardTable from "../components/LeaderboardTable.jsx";
import { fetchLeaderboard } from "../store/adminStatsSlice.js";
import PageLoader from "../components/PageLoader.jsx";


const PODIUM_SIZE = 3;

const Leaderboard = () => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector(
    (state) => state.adminStats.leaderboard,
  );

  useEffect(() => {
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  const isLoading = status === "loading" && items.length === 0;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Leaderboard</h1>
        <p className="mt-1 text-sm text-muted">
          Ranked by average score across completed interviews.
        </p>
      </div>

      {isLoading && (
        <PageLoader label="Loading leaderboard" className="min-h-64" />
      )}
      {error && <p className="text-sm text-danger">{error}</p>}

      {!isLoading && !error && items.length === 0 && (
        <p className="text-sm text-muted">
          No scored interviews yet. Rankings appear once users complete one.
        </p>
      )}

      {items.length > 0 && (
        <>
          <LeaderboardPodium entries={items.slice(0, PODIUM_SIZE)} />
          {items.length > PODIUM_SIZE && (
            <LeaderboardTable entries={items.slice(PODIUM_SIZE)} />
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
