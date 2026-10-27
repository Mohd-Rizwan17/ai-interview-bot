import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CodeEditor from "./components/CodeEditor.jsx";
import FileTree from "./components/FileTree.jsx";
import ProjectAside from "./components/ProjectAside.jsx";
import { loadProject, resetProject } from "./miniProjectSlice.js";
import { useEffect, useState } from "react";

const STATUS_LABELS = {
  answered: { label: "Code submitted", tone: "text-ok" },
  skipped: { label: "Skipped", tone: "text-warn" },
  timed_out: { label: "Time up", tone: "text-warn" },
};
const [isOpen, setIsOpen] = useState(false);

const NOT_ATTEMPTED = { label: "Not attempted", tone: "text-muted" };

const ProjectReview = ({ attempt }) => {
  const dispatch = useDispatch();
  const { status, error, project, files } = useSelector(
    (state) => state.miniProject,
  );
  const verdict = STATUS_LABELS[attempt.status] ?? NOT_ATTEMPTED;

  useEffect(() => {
    dispatch(loadProject(attempt._id));

    return () => {
      dispatch(resetProject());
    };
  }, [dispatch, attempt._id]);

  const renderWorkbench = () => {
    if (status === "error") {
      return (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      );
    }

    if (status !== "ready") {
      return <p className="mt-4 text-sm text-muted">Loading code...</p>;
    }

    if (files.length === 0) {
      return (
        <p className="mt-4 text-sm text-muted">
          No code was written for this project.
        </p>
      );
    }

    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          className="mt-4 w-full rounded-md border border-line px-4 py-2 text-sm hover:bg-white/5 lg:hidden"
        >
          {isOpen ? "Hide code" : "Show code (best on desktop)"}
        </button>
        <div
          className={`mt-4 flex flex-col overflow-hidden rounded-lg border border-line lg:h-[32rem] lg:flex-row ${
            isOpen ? "" : "max-lg:hidden"
          }`}
        >
          <FileTree disabled />
          <CodeEditor readOnly />
          <ProjectAside project={project} />
        </div>
      </>
    );
  };

  return (
    <article className="glass-solid rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          <span className="font-mono">Q{attempt.order}</span> · {attempt.topic}
        </p>
        <p className="flex items-center gap-3 text-sm">
          <span className={`font-semibold ${verdict.tone}`}>
            {verdict.label}
          </span>
          <span className="text-muted">Not graded</span>
        </p>
      </div>

      <h3 className="mt-3 whitespace-pre-wrap leading-relaxed">
        {attempt.question}
      </h3>

      {attempt.feedback && (
        <p className="mt-2 text-sm text-muted">{attempt.feedback}</p>
      )}

      {renderWorkbench()}
    </article>
  );
};

export default ProjectReview;
