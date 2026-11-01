import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export const MAX_PDF_BYTES = 10 * 1024 * 1024;

export const MAX_PDF_PAGES = 150;

export class PdfError extends Error {
  constructor(message) {
    super(message);
    this.name = "PdfError";
  }
}

const textOf = (item) =>
  typeof item.str === "string" ? item.str + (item.hasEOL ? "\n" : "") : "";

export const extractPdfText = async (file) => {
  if (file.type !== "application/pdf") {
    throw new PdfError("Choose a PDF file");
  }

  if (file.size > MAX_PDF_BYTES) {
    throw new PdfError(
      `PDF is too large (max ${MAX_PDF_BYTES / 1024 / 1024} MB)`,
    );
  }

  const task = pdfjs.getDocument({ data: await file.arrayBuffer() });

  try {
    const pdf = await task.promise;

    if (pdf.numPages > MAX_PDF_PAGES) {
      throw new PdfError(
        `PDF has ${pdf.numPages} pages (max ${MAX_PDF_PAGES})`,
      );
    }

    const pages = [];

    for (let number = 1; number <= pdf.numPages; number += 1) {
      const page = await pdf.getPage(number);
      const content = await page.getTextContent();

      pages.push(content.items.map(textOf).join(""));
    }

    const text = pages.join("\n\n").trim();

    if (!text) {
      throw new PdfError("No text found. Scanned PDFs are not supported");
    }

    return { text, pageCount: pdf.numPages };
  } catch (error) {
    if (error instanceof PdfError) throw error;

    if (error.name === "PasswordException") {
      throw new PdfError("This PDF is password protected");
    }

    throw new PdfError("Could not read this PDF");
  } finally {
    await task.destroy();
  }
};
