/**
 * The RAG API returns every error as
 *   { "error": { "code": "...", "message": "...", "request_id": "..." } }
 * Older builds used FastAPI's { "detail": ... }; both are read here.
 */
export type RagApiError = { code: string | null; message: string | null };

export function parseRagError(body: string): RagApiError {
  try {
    const parsed = JSON.parse(body) as {
      error?: { code?: unknown; message?: unknown };
      detail?: unknown;
    };
    if (parsed.error && typeof parsed.error === "object") {
      return {
        code: typeof parsed.error.code === "string" ? parsed.error.code : null,
        message:
          typeof parsed.error.message === "string"
            ? parsed.error.message
            : null,
      };
    }
    if (typeof parsed.detail === "string") {
      return { code: null, message: parsed.detail };
    }
  } catch {
    /* not JSON */
  }
  return { code: null, message: null };
}

/** A short headline plus the API's own explanation, for inline display. */
export type UploadError = { title: string; detail: string };

export function uploadErrorFor(status: number, body: string): UploadError {
  const { code, message } = parseRagError(body);

  switch (status) {
    case 415:
      return {
        title: "That file type is not supported.",
        detail: message ?? "Upload a .pdf file.",
      };
    case 422:
      // unprocessable_document: password-protected, scanned (no text) or
      // unparseable PDFs. Its messages say exactly what to do, so show them.
      return {
        title: "This PDF could not be indexed.",
        detail:
          code === "unprocessable_document" && message
            ? message
            : "Upload a text-based PDF that is not password-protected.",
      };
    case 413:
      return {
        title: "That file is too large.",
        detail: message ?? "Upload a smaller PDF.",
      };
    default:
      return {
        title: `Upload failed (${status}).`,
        detail: message ?? "Please try again in a moment.",
      };
  }
}
