import { Menu, X } from "lucide-react";
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
  const [menuPath, setMenuPath] = useState(null);
  const isAdmin = user.role === "admin";
  const firstName = user.fullName.split(" ")[0];
  const userId = user._id;
  const isMenuOpen = menuPath === location.pathname;

  const openMenu = () => setMenuPath(location.pathname);
  const closeMenu = useCallback(() => setMenuPath(null), []);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKey = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [isMenuOpen, closeMenu]);

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
    closeMenu();

    if (location.pathname === "/") {
      setIsTourOpen(true);
      return;
    }

    navigate("/");
    setTimeout(() => setIsTourOpen(true), REPLAY_DELAY_MS);
  };

  return (
    <div className="flex min-h-screen flex-col gap-4 p-3 lg:h-screen lg:flex-row lg:p-4">
      <header className="glass-strong sticky top-3 z-20 flex items-center gap-3 rounded-xl px-3 py-2 lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          aria-controls="app-sidebar"
          onClick={openMenu}
          className="rounded-md p-1.5 hover:bg-white/5"
        >
          <Menu size={20} />
        </button>
        <span
          aria-hidden="true"
          className="h-6 w-6 shrink-0 rounded-md bg-accent"
        />
        <p className="truncate text-sm font-semibold">AI Interview Bot</p>
        <span className="ml-auto">
          <Avatar name={firstName} online />
        </span>
      </header>

      {isMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMenu}
          className="fixed inset-0 z-30 animate-[fade-in_200ms_ease-out] bg-black/60 lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`glass-strong flex flex-col rounded-xl transition-[transform,visibility] duration-300 ease-out max-lg:fixed max-lg:inset-y-3 max-lg:left-3 max-lg:z-40 max-lg:w-72 max-lg:overflow-y-auto lg:w-64 lg:shrink-0 lg:overflow-y-auto ${
          isMenuOpen ? "" : "max-lg:invisible max-lg:-translate-x-[110%]"
        }`}
      >
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
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
            className="ml-auto rounded-md p-1 hover:bg-white/5 lg:hidden"
          >
            <X size={18} />
          </button>
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

      <div
        key={location.pathname}
        className={`${location.pathname === "/" && !isAdmin ? "" : "page-enter"} min-w-0 flex-1 lg:overflow-y-auto`}
      >
        <Outlet />
      </div>

      {!isAdmin && isTourOpen && <ProductTour onClose={closeTour} />}
    </div>
  );
};

export default AppShell;
