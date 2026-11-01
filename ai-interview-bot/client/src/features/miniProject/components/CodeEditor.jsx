import Editor from "@monaco-editor/react";
import { X } from "lucide-react";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { baseName } from "../fileTree.js";
import { closeTab, openFile, updateContent } from "../miniProjectSlice.js";

const LANGUAGES = {
  html: "html",
  css: "css",
  js: "javascript",
  mjs: "javascript",
  jsx: "javascript",
  json: "json",
  md: "markdown",
};

const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily: "'JetBrains Mono', monospace",
  tabSize: 2,
  automaticLayout: true,
  scrollBeyondLastLine: false,
  wordWrap: "on",
};

const languageOf = (path) =>
  LANGUAGES[path.split(".").at(-1).toLowerCase()] ?? "plaintext";

const defineTheme = (monaco) => {
  monaco.editor.defineTheme("interview-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
   colors: { "editor.background": "#121212" },
  });
};

const CodeEditor = ({ readOnly }) => {
  const dispatch = useDispatch();
  const { files, openTabs, activePath } = useSelector(
    (state) => state.miniProject,
  );
  const activeFile = files.find((file) => file.path === activePath);
  const options = useMemo(() => ({ ...EDITOR_OPTIONS, readOnly }), [readOnly]);

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div
        role="tablist"
        className="flex overflow-x-auto border-b border-line bg-(--panel-solid)"
      >
        {openTabs.map((path) => (
          <div
            key={path}
            className={`flex shrink-0 items-center gap-2 border-r border-line px-3 py-1.5 text-sm ${
              path === activePath ? "bg-ground text-ink" : "text-muted"
            }`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={path === activePath}
              title={path}
              onClick={() => dispatch(openFile(path))}
            >
              {baseName(path)}
            </button>
            <button
              type="button"
              aria-label={`Close ${baseName(path)}`}
              onClick={() => dispatch(closeTab(path))}
              className="text-muted hover:text-ink"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="relative min-h-96 flex-1">
        {activeFile ? (
          <div className="absolute inset-0">
            <Editor
              height="100%"
              path={activeFile.path}
              value={activeFile.content}
              language={languageOf(activeFile.path)}
              theme="interview-dark"
              beforeMount={defineTheme}
              options={options}
              loading={
                <p className="p-4 text-sm text-muted">Loading editor...</p>
              }
              onChange={(value) =>
                dispatch(
                  updateContent({
                    path: activeFile.path,
                    content: value ?? "",
                  }),
                )
              }
            />
          </div>
        ) : (
          <p className="p-6 text-sm text-muted">
            Open a file from the explorer to start coding.
          </p>
        )}
      </div>
    </section>
  );
};

export default CodeEditor;
