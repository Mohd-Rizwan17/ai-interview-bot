import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { logoutUser } from "../store/authSlice.js";

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold text-accent">Interview Bot</h1>
      {user ? (
        <>
          <p className="text-muted">Logged in as {user.fullName}</p>
          <button
            type="button"
            onClick={() => dispatch(logoutUser())}
            className="rounded-md border border-line px-4 py-2"
          >
            Logout
          </button>
        </>
      ) : (
        <Link
          to="/login"
          className="rounded-md bg-accent px-4 py-2 font-semibold text-ground"
        >
          Login
        </Link>
      )}
    </main>
  );
};

export default Dashboard;
