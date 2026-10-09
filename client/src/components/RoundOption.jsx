const RoundOption = ({ title, note, position, onToggle }) => {
  const isSelected = position > 0;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className={`relative rounded-lg border bg-panel p-4 text-left transition-colors ${
        isSelected ? "border-accent" : "border-line hover:border-muted"
      }`}
    >
      <span className="font-semibold">{title}</span>
      <span className="mt-1 block text-sm text-muted">{note}</span>
      {isSelected && (
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-accent font-mono text-xs font-bold text-ground">
          {position}
        </span>
      )}
    </button>
  );
};

export default RoundOption;
