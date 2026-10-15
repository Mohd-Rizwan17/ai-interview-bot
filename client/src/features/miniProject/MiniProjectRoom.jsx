import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CodeEditor from "./components/CodeEditor.jsx";
import FileTree from "./components/FileTree.jsx";
import ProjectActions from "./components/ProjectActions.jsx";
import ProjectAside from "./components/ProjectAside.jsx";
import useAutosave from "./hooks/useAutosave.js";
import {
  flushProject,
  loadProject,
  resetProject,
  saveProject,
} from "./miniProjectSlice.js";

const SAVE_LABELS = {
  saved: { text: "All changes saved", tone: "text-muted" },
  dirty: { text: "Unsaved changes", tone: "text-warn" },
  saving: { text: "Saving...", tone: "text-muted" },
  error: { text: "Save failed", tone: "text-danger" },
};

const MiniProjectRoom = ({ attemptId, isTimeUp, submit }) => {
  const dispatch = useDispatch();
  const { status, error, project, saveStatus, saveError } = useSelector(
    (state) => state.miniProject,
  );
  const saveLabel = SAVE_LABELS[saveStatus];

  useAutosave();

  useEffect(() => {
    dispatch(loadProject(attemptId));

    return () => {
      dispatch(resetProject());
    };
  }, [dispatch, attemptId]);

  useEffect(() => {
    if (isTimeUp) dispatch(flushProject());
  }, [dispatch, isTimeUp]);

  if (status === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
        <button
          type="button"
          onClick={() => dispatch(loadProject(attemptId))}
          className="rounded-md border border-line px-4 py-2 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2">
        <h1 className="font-semibold">{project.title}</h1>
        <p className={`flex items-center gap-2 text-sm ${saveLabel.tone}`}>
          {saveLabel.text}
          {saveStatus === "error" && (
            <>
              <span className="text-xs">{saveError}</span>
              <button
                type="button"
                onClick={() => dispatch(saveProject())}
                className="rounded border border-line px-2 py-0.5 text-xs text-ink"
              >
                Retry
              </button>
            </>
          )}
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <FileTree disabled={isTimeUp} />
        <CodeEditor readOnly={isTimeUp} />
        <ProjectAside
          project={project}
          footer={<ProjectActions isTimeUp={isTimeUp}>{submit}</ProjectActions>}
        />
      </div>
    </div>
  );
};

export default MiniProjectRoom;
