import { Link } from "react-router";
import Avatar from "./Avatar.jsx";

const PREVIEW_SIZE = 3;

const LeaderboardPreview = ({ items }) => {
  if (items.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted">
        No scored interviews yet. Rankings appear once users complete one.
      </p>
    );
  }

  return (
    <>
      <ol className="mt-4 flex flex-col divide-y divide-line">
        {items.slice(0, PREVIEW_SIZE).map((entry) => (
          <li
            key={entry.userId}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span className="w-4 font-mono text-sm text-muted">
              {entry.rank}
            </span>
            <Avatar name={entry.name} />
            <span className="min-w-0 flex-1 truncate text-sm">
              {entry.name}
            </span>
            <span className="font-mono text-sm">{entry.averageScore}%</span>
          </li>
        ))}
      </ol>
      <Link to="/leaderboard" className="mt-4 block text-sm text-accent">
        View full leaderboard →
      </Link>
    </>
  );
};

export default LeaderboardPreview;
