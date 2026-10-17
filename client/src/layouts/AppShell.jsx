import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router";
import AdminNav from "../components/AdminNav.jsx";
import UserNav from "../components/UserNav.jsx";
import { logoutUser } from "../store/authSlice.js";

const AppShell = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user.role === "admin";
  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row">
      <aside className="flex flex-col border-b border-line bg-panel lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 px-4 py-4">
          <span
            aria-hidden="true"
            className="h-6 w-6 shrink-0 rounded-md bg-accent"
          />
          <p className="truncate text-sm font-semibold">AI Interview Bot</p>
          {isAdmin && (
            <span className="rounded-full border border-warn px-2 py-0.5 text-xs text-warn">
              Admin
            </span>
          )}
        </div>

        {isAdmin ? <AdminNav /> : <UserNav />}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-line text-sm font-semibold"
            >
              {firstName[0].toUpperCase()}
            </span>
            <p className="truncate text-sm">{firstName}</p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(logoutUser())}
            className="shrink-0 rounded-md border border-line px-3 py-1 text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AppShell;
