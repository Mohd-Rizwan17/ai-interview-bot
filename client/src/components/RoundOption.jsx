const RoundOption = ({ title, note, meta, position, onToggle }) => {
  const isSelected = position > 0;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      title={note}
      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
        isSelected
          ? "border-accent/30 bg-accent/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
          : "border-transparent hover:bg-white/5"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate">{title}</span>
        {meta && (
          <span className="block truncate text-xs text-muted">{meta}</span>
        )}
      </span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
          isSelected ? "bg-accent text-ground" : "border border-line"
        }`}
      >
        {isSelected ? position : ""}
      </span>
    </button>
  );
};

export default RoundOption;
