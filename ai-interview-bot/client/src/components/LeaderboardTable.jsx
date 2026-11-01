import Avatar from "./Avatar.jsx";

const LeaderboardTable = ({ entries }) => (
  <div className="glass overflow-hidden rounded-xl">
    <div className="grid grid-cols-[3rem_1fr_4rem_5rem] gap-3 border-b border-line px-4 py-2 text-xs uppercase tracking-wide text-muted">
      <span>Rank</span>
      <span>User</span>
      <span className="text-right">Score</span>
      <span className="text-right">Interviews</span>
    </div>

    <ul>
      {entries.map((entry) => (
        <li
          key={entry.userId}
          className="grid grid-cols-[3rem_1fr_4rem_5rem] items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
        >
          <span className="font-mono text-sm text-muted">{entry.rank}</span>
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={entry.name} />
            <div className="min-w-0">
              <p className="truncate text-sm">{entry.name}</p>
              <p className="truncate text-xs text-muted">{entry.email}</p>
            </div>
          </div>
          <span className="text-right font-mono text-sm">
            {entry.averageScore}%
          </span>
          <span className="text-right font-mono text-sm text-muted">
            {entry.interviews}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export default LeaderboardTable;
