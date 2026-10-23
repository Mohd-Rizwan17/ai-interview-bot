import Avatar from "./Avatar.jsx";

const HEIGHTS = { 1: "h-52", 2: "h-44", 3: "h-40" };

const PodiumSpot = ({ entry }) => {
  const isFirst = entry.rank === 1;

  return (
    <li
      className={`flex min-w-0 flex-col items-center justify-end gap-2 rounded-xl border border-line bg-panel p-3 text-center ${HEIGHTS[entry.rank]} ${
        isFirst ? "border-accent" : ""
      }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs ${
          isFirst ? "bg-accent text-white" : "bg-line"
        }`}
      >
        {entry.rank}
      </span>
      <Avatar
        name={entry.name}
        className={isFirst ? "h-14 w-14 text-xl" : "h-10 w-10 text-base"}
      />
      <p className="w-full truncate text-sm font-medium">{entry.name}</p>
      <p className="font-mono text-lg">{entry.averageScore}%</p>
    </li>
  );
};

const LeaderboardPodium = ({ entries }) => {
  const [first, second, third] = entries;
  const ordered = [second, first, third].filter(Boolean);

  return (
    <ol className="grid grid-cols-3 items-end gap-3">
      {ordered.map((entry) => (
        <PodiumSpot key={entry.userId} entry={entry} />
      ))}
    </ol>
  );
};

export default LeaderboardPodium;
