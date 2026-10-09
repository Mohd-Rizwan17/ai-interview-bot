import { Link } from "react-router";

const NotFound = () => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-4">
    <p className="font-mono text-6xl font-bold text-accent">404</p>
    <p className="text-muted">This page does not exist.</p>
    <Link
      to="/"
      className="rounded-md bg-accent px-4 py-2 font-semibold text-ground"
    >
      Go home
    </Link>
  </main>
);

export default NotFound;
