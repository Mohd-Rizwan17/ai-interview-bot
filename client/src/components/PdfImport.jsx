import { useState } from "react";

const PREVIEW_CHARS = 200000;

const PdfImport = ({ onClose }) => {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const isLoading = status === "loading";

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

      setResult({ name: file.name, text, pageCount });
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
            {result.pageCount > 1 ? "s" : ""} ·{" "}
            <span className="font-mono">{result.text.length}</span> characters
          </p>
          <pre className="mt-2 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-md border border-line bg-ground p-3 font-mono text-xs">
            {result.text.slice(0, PREVIEW_CHARS)}
          </pre>
          {result.text.length > PREVIEW_CHARS && (
            <p className="mt-1 text-xs text-warn">
              Preview shows the first {PREVIEW_CHARS} characters only.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default PdfImport;
