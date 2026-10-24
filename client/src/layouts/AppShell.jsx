import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router";
import AdminNav from "../components/AdminNav.jsx";
import Avatar from "../components/Avatar.jsx";
import ProductTour from "../components/ProductTour.jsx";
import UserNav from "../components/UserNav.jsx";
import { logoutUser } from "../store/authSlice.js";
import { hasSeenTour, markTourSeen } from "../utils/tourStorage.js";

const TOUR_DELAY_MS = 800;
const REPLAY_DELAY_MS = 400;

const AppShell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const isAdmin = user.role === "admin";
  const firstName = user.fullName.split(" ")[0];
  const userId = user._id;

  useEffect(() => {
    if (isAdmin || location.pathname !== "/" || hasSeenTour(userId)) {
      return undefined;
    }

    const id = setTimeout(() => setIsTourOpen(true), TOUR_DELAY_MS);

    return () => clearTimeout(id);
  }, [isAdmin, location.pathname, userId]);

  const closeTour = useCallback(() => {
    markTourSeen(userId);
    setIsTourOpen(false);
  }, [userId]);

  const startTour = () => {
    if (location.pathname === "/") {
      setIsTourOpen(true);
      return;
    }

    navigate("/");
    setTimeout(() => setIsTourOpen(true), REPLAY_DELAY_MS);
  };

  return (
    <div className="flex min-h-screen flex-col gap-4 p-3 lg:h-screen lg:flex-row lg:p-4">
      <aside className="glass-strong flex flex-col rounded-xl lg:w-64 lg:shrink-0 lg:overflow-y-auto">
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

        <div className="mt-auto border-t border-line p-4">
          {!isAdmin && (
            <button
              type="button"
              onClick={startTour}
              className="mb-3 text-xs text-muted hover:text-ink"
            >
              Take a tour
            </button>
          )}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={firstName} online />
              <p className="truncate text-sm">{firstName}</p>
            </div>
            <button
              type="button"
              onClick={() => dispatch(logoutUser())}
              className="shrink-0 rounded-md border border-line px-3 py-1 text-sm hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:overflow-y-auto">
        <Outlet />
      </div>

      {!isAdmin && <ProductTour open={isTourOpen} onClose={closeTour} />}
    </div>
  );
};

export default AppShell;
