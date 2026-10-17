import { Link } from "react-router";

const AdminOverview = () => (
  <main className="mx-auto max-w-3xl px-4 py-8">
    <h1 className="text-2xl font-semibold">Overview</h1>
    <p className="mt-1 text-sm text-muted">
      Question bank stats and user performance will appear here.
    </p>

    <div className="mt-6 flex flex-wrap gap-2">
      <Link
        to="/pdf-import"
        className="rounded-md border border-line px-4 py-2 text-sm"
      >
        Import from PDF
      </Link>
      <Link
        to="/my-questions"
        className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ground"
      >
        My Questions
      </Link>
    </div>
  </main>
);

export default AdminOverview;
