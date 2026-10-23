const StatCard = ({ label, value, note, tone = "text-ink" }) => (
  <div className="glass glass-interactive rounded-xl p-4">
    <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
    <p className={`mt-2 truncate font-mono text-2xl font-medium ${tone}`}>
      {value}
    </p>
    {note && <p className="mt-1 truncate text-xs text-muted">{note}</p>}
  </div>
);

export default StatCard;
