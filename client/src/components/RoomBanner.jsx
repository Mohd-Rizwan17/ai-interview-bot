const RoomBanner = ({ children, onDismiss }) => (
  <div
    role="status"
    className="slide-in mx-6 mt-6 flex items-start justify-between gap-3 rounded-md border border-warn px-3 py-2 text-sm text-warn"
  >
    <p>{children}</p>
    <button type="button" onClick={onDismiss} className="shrink-0 underline">
      Dismiss
    </button>
  </div>
);

export default RoomBanner;
