import { Link } from "react-router";

const Notice = ({ title, children }) => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-4 text-center">
    <h1 className="text-xl font-semibold">{title}</h1>
    {children}
    <Link to="/" className="text-sm text-accent">
      Back to dashboard
    </Link>
  </main>
);

export default Notice;
