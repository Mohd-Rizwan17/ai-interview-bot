import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useStore } from "react-redux";
import { flushProject } from "../miniProjectSlice.js";
import { buildPreviewDocument } from "../previewDocument.js";

const MAX_LOG_LINES = 100;

const LOG_TONES = {
  log: "text-ink",
  info: "text-ink",
  warn: "text-warn",
  error: "text-danger",
};

const PreviewFrame = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const frameRef = useRef(null);
  const nextLogId = useRef(0);
  const [runCount, setRunCount] = useState(0);
  const [documentHtml, setDocumentHtml] = useState("");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const handleMessage = (event) => {
      const { data } = event;

      if (event.source !== frameRef.current?.contentWindow) return;
      if (data?.source !== "mini-project-preview") return;

      nextLogId.current += 1;

      const line = {
        id: nextLogId.current,
        level: data.level,
        text: String(data.text).slice(0, 500),
      };

      setLogs((current) => [...current, line].slice(-MAX_LOG_LINES));
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleRun = async () => {
    await dispatch(flushProject());

    setLogs([]);
    setDocumentHtml(buildPreviewDocument(store.getState().miniProject.files));
    setRunCount((count) => count + 1);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <p className="text-xs text-muted">Runs only when you click Run.</p>
        <button
          type="button"
          onClick={handleRun}
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1 text-sm font-semibold text-ground"
        >
          <Play size={14} />
          Run
        </button>
      </div>

      <div className="relative min-h-64 flex-1 bg-white">
        {runCount === 0 ? (
          <p className="p-4 text-sm text-muted">
            Click Run to see your project.
          </p>
        ) : (
          <iframe
            key={runCount}
            ref={frameRef}
            title="Project preview"
            sandbox="allow-scripts allow-modals allow-forms"
            srcDoc={documentHtml}
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>

      <div className="border-t border-line">
        <div className="flex items-center justify-between px-3 py-1">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Console
          </h3>
          <button
            type="button"
            onClick={() => setLogs([])}
            className="text-xs text-muted hover:text-ink"
          >
            Clear
          </button>
        </div>
        <ul className="h-28 overflow-y-auto px-3 pb-2 font-mono text-xs">
          {logs.length === 0 ? (
            <li className="text-muted">No output yet.</li>
          ) : (
            logs.map((line) => (
              <li
                key={line.id}
                className={`whitespace-pre-wrap break-words ${LOG_TONES[line.level] ?? "text-ink"}`}
              >
                {line.text}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default PreviewFrame;
