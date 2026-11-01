const Avatar = ({ name, className = "h-8 w-8 text-sm", online = false }) => (
  <span className="relative inline-flex shrink-0">
    <span
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full bg-line font-semibold ${className}`}
    >
      {name[0].toUpperCase()}
    </span>
    {online && (
      <span
        aria-hidden="true"
        className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-(--panel-solid) bg-ok"
      />
    )}
  </span>
);

export default Avatar;
