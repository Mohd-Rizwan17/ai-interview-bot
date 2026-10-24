import { Link, useLocation, useNavigate } from "react-router";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.key !== "default";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-4 text-center">
      <p className="font-mono text-8xl font-bold text-accent sm:text-9xl">
        404
      </p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-sm text-muted">
        The page you are looking for does not exist or was moved.
      </p>
      <div className="mt-4 flex gap-3">
        {canGoBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-line px-4 py-2 text-sm hover:bg-white/5"
          >
            Go back
          </button>
        )}
        <Link
          to="/"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ground"
        >
          Go home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
