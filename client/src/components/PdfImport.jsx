import { useState } from "react";
import { parseQuestions } from "../utils/parseQuestions.js";

const PREVIEW_CHARS = 200000;
const LETTERS = ["A", "B", "C", "D"];

const PdfImport = ({ onClose }) => {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const isLoading = status === "loading";
  const readyCount = result?.drafts.filter(
    (draft) => !draft.issues.length,
  ).length;

  const handleFile = async (event) => {
    const [file] = event.target.files;

    event.target.value = "";

    if (!file) return;

    setStatus("loading");
    setError(null);
    setResult(null);

    try {
      const { extractPdfText } = await import("../utils/pdfText.js");
      const { text, pageCount } = await extractPdfText(file);

      setResult({
        name: file.name,
        text,
        pageCount,
        drafts: parseQuestions(text),
      });
    } catch (readError) {
      setError(
        readError.name === "PdfError"
          ? readError.message
          : "Could not read this PDF",
      );
    } finally {
      setStatus("idle");
    }
  };

  return (
    <section className="mt-6 rounded-xl border border-line bg-panel p-5">
      <h2 className="text-lg font-semibold">Import from PDF</h2>
      <p className="mt-1 text-sm text-muted">
        The PDF is read in your browser. It is not uploaded anywhere.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent">
          {isLoading ? "Reading..." : "Choose PDF"}
          <input
            type="file"
            accept="application/pdf"
            disabled={isLoading}
            onChange={handleFile}
            className="sr-only"
          />
        </label>
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-md border border-line px-4 py-2 text-sm disabled:opacity-60"
        >
          Close
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4">
          <p className="text-sm text-muted">
            {result.name} · {result.pageCount} page
            {result.pageCount > 1 ? "s" : ""}
          </p>

          {result.drafts.length === 0 ? (
            <p role="status" className="mt-3 text-sm text-warn">
              No questions found. This PDF layout is not supported yet.
            </p>
          ) : (
            <>
              <p className="mt-3 text-sm">
                Found <span className="font-mono">{result.drafts.length}</span>{" "}
                questions ·{" "}
                <span className="font-mono text-accent">{readyCount}</span>{" "}
                ready ·{" "}
                <span className="font-mono text-danger">
                  {result.drafts.length - readyCount}
                </span>{" "}
                need fixing
              </p>
              <ul className="mt-3 flex max-h-96 flex-col gap-3 overflow-y-auto">
                {result.drafts.map((draft) => (
                  <li
                    key={draft.id}
                    className="rounded-md border border-line bg-ground p-3 text-sm"
                  >
                    <p className="font-mono text-xs text-muted">
                      Q{draft.number}
                      {draft.topic && ` · ${draft.topic}`}
                    </p>
                    <p className="mt-1">{draft.question}</p>
                    <ul className="mt-2 flex flex-col gap-1">
                      {draft.options.map((option, index) => (
                        <li
                          key={index}
                          className={
                            index === draft.correctOption
                              ? "text-accent"
                              : "text-muted"
                          }
                        >
                          {LETTERS[index]}. {option}
                          {index === draft.correctOption && " ✓"}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-muted">
                      Hint: {draft.hint ? "yes" : "no"} · Explanation:{" "}
                      {draft.explanation ? "yes" : "no"}
                    </p>
                    {draft.issues.map((issue) => (
                      <p key={issue} className="mt-1 text-xs text-danger">
                        {issue}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            </>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted">
              Raw text ({result.text.length} characters)
            </summary>
            <pre className="mt-2 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-md border border-line bg-ground p-3 font-mono text-xs">
              {result.text.slice(0, PREVIEW_CHARS)}
            </pre>
          </details>
        </div>
      )}
    </section>
  );
};

export default PdfImport;
