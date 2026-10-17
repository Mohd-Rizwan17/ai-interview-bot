import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router";
import AdminNav from "../components/AdminNav.jsx";
import UserNav from "../components/UserNav.jsx";
import { logoutUser } from "../store/authSlice.js";

const AppShell = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user.role === "admin";

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row">
      <aside className="flex flex-col border-b border-line bg-panel lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <p className="px-4 py-4 text-sm font-semibold">AI Interview Bot</p>

        {isAdmin ? <AdminNav /> : <UserNav />}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line p-4">
          <div className="min-w-0">
            <p className="truncate text-sm">{user.fullName}</p>
            <p className="text-xs capitalize text-muted">{user.role}</p>
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
