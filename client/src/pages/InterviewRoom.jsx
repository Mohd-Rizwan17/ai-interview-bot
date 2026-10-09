import { Link, useParams } from "react-router";

const InterviewRoom = () => {
  const { id } = useParams();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3">
      <h1 className="text-2xl font-semibold text-accent">Interview started</h1>
      <p className="font-mono text-sm text-muted">{id}</p>
      <Link to="/" className="text-sm text-muted underline">
        Back to dashboard
      </Link>
    </main>
  );
};

export default InterviewRoom;
