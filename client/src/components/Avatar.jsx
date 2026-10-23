const Avatar = ({ name, className = "h-8 w-8 text-sm" }) => (
  <span
    aria-hidden="true"
    className={`flex shrink-0 items-center justify-center rounded-full bg-line font-semibold ${className}`}
  >
    {name[0].toUpperCase()}
  </span>
);

export default Avatar;
