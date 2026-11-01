import { useEffect, useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword, updateProfile } from "../store/authSlice.js";
import Avatar from "./Avatar.jsx";

const inputClass =
  "w-full rounded-md border border-line bg-ground/40 px-3 py-2 text-ink placeholder:text-muted";

const emptyPasswords = {
  currentPassword: "",
  password: "",
  confirmPassword: "",
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const Note = ({ note }) =>
  note && (
    <p
      role={note.ok ? "status" : "alert"}
      className={`mt-3 text-sm ${note.ok ? "text-ok" : "text-danger"}`}
    >
      {note.text}
    </p>
  );

const ProfileModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const dialogRef = useRef(null);
  const titleId = useId();
  const [fullName, setFullName] = useState(user.fullName);
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [nameNote, setNameNote] = useState(null);
  const [passwordNote, setPasswordNote] = useState(null);
  const [busy, setBusy] = useState(null);
  const isNameUnchanged = fullName.trim() === user.fullName;

  const details = [
    ["Email", user.email],
    ["Username", user.username],
    ["Role", user.role === "admin" ? "Admin" : "User"],
    ["Member since", formatDate(user.createdAt)],
  ];

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog.open) dialog.showModal();
  }, []);

  const handleCancel = (event) => {
    event.preventDefault();
    onClose();
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handlePasswordChange = (event) => {
    setPasswords({ ...passwords, [event.target.name]: event.target.value });
  };

  const handleNameSubmit = async (event) => {
    event.preventDefault();
    const name = fullName.trim();

    setBusy("name");
    setNameNote(null);

    try {
      await dispatch(updateProfile(name)).unwrap();
      setFullName(name);
      setNameNote({ ok: true, text: "Name updated" });
    } catch (rejection) {
      setNameNote({ text: rejection.message });
    } finally {
      setBusy(null);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordNote(null);

    if (passwords.password !== passwords.confirmPassword) {
      setPasswordNote({ text: "Passwords do not match" });
      return;
    }

    setBusy("password");

    try {
      await dispatch(changePassword(passwords)).unwrap();
      setPasswords(emptyPasswords);
      setPasswordNote({ ok: true, text: "Password updated" });
    } catch (rejection) {
      setPasswordNote({ text: rejection.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className="modal m-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-line bg-panel p-0 text-ink"
    >
      <div className="p-5">
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} className="h-12 w-12 text-lg" />
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-lg font-semibold">
              {user.fullName}
            </h2>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {details.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted">{label}</dt>
              <dd className="truncate text-right">{value}</dd>
            </div>
          ))}
        </dl>

        <form
          onSubmit={handleNameSubmit}
          className="mt-5 border-t border-line pt-4"
        >
          <h3 className="text-sm font-semibold">Edit name</h3>
          <label
            htmlFor="profile-name"
            className="mt-3 block text-sm text-muted"
          >
            Full name
          </label>
          <input
            id="profile-name"
            required
            minLength={2}
            maxLength={60}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={`${inputClass} mt-1`}
          />
          <Note note={nameNote} />
          <button
            type="submit"
            disabled={busy !== null || isNameUnchanged}
            className="mt-3 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ground disabled:opacity-60"
          >
            {busy === "name" ? "Saving..." : "Save name"}
          </button>
        </form>

        <form
          onSubmit={handlePasswordSubmit}
          className="mt-5 border-t border-line pt-4"
        >
          <h3 className="text-sm font-semibold">Change password</h3>

          <label
            htmlFor="currentPassword"
            className="mt-3 block text-sm text-muted"
          >
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
            className={`${inputClass} mt-1`}
          />

          <label htmlFor="password" className="mt-3 block text-sm text-muted">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={passwords.password}
            onChange={handlePasswordChange}
            className={`${inputClass} mt-1`}
          />

          <label
            htmlFor="confirmPassword"
            className="mt-3 block text-sm text-muted"
          >
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            className={`${inputClass} mt-1`}
          />

          <Note note={passwordNote} />
          <button
            type="submit"
            disabled={busy !== null}
            className="mt-3 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ground disabled:opacity-60"
          >
            {busy === "password" ? "Updating..." : "Update password"}
          </button>
        </form>

        <div className="mt-5 flex justify-end border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line px-4 py-2 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ProfileModal;
