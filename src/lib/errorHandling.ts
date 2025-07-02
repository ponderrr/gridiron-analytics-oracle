// Standardized error handling utility

export type AppErrorType = "network" | "auth" | "data" | "timeout" | "unknown";

export interface AppError extends Error {
  type?: AppErrorType;
  status?: number;
  stack?: string;
  context?: string;
  originalError?: unknown;
}

export function createAppError(
  message: string,
  type: AppErrorType = "unknown",
  status?: number,
  context?: string,
  originalError?: unknown
): AppError {
  const error = new Error(message) as AppError;
  error.type = type;
  error.status = status;
  error.context = context;
  error.originalError = originalError;
  return error;
}

export function formatErrorMessage(error: AppError | unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return (error as AppError).message || "An unknown error occurred.";
  }
  return "An unknown error occurred.";
}

export function getErrorType(error: AppError | unknown): AppErrorType {
  // Check for explicit type property first
  if (
    typeof error === "object" &&
    error &&
    "type" in error &&
    (error as AppError).type
  ) {
    return (error as AppError).type!;
  }

  // Check for error codes or status
  if (typeof error === "object" && error) {
    // Common error code properties
    const code =
      (error as any).code ||
      (error as any).status ||
      (error as any).errno ||
      (error as any).statusCode;
    if (code) {
      // Normalize code to string for easier matching
      const codeStr = String(code).toLowerCase();
      // Network errors
      if (
        [
          "ecconrefused",
          "enotfound",
          "econnreset",
          "etimedout",
          "network_error",
          "fetcherror",
          "502",
          "503",
          "504",
        ].some((k) => codeStr.includes(k))
      ) {
        return "network";
      }
      // Auth errors
      if (
        [
          "unauthorized",
          "forbidden",
          "401",
          "403",
          "invalid_token",
          "auth",
        ].some((k) => codeStr.includes(k))
      ) {
        return "auth";
      }
      // Data errors
      if (
        ["not_found", "404", "nodb", "no_data", "enoent"].some((k) =>
          codeStr.includes(k)
        )
      ) {
        return "data";
      }
      // Timeout errors
      if (["timeout", "etimedout", "408"].some((k) => codeStr.includes(k))) {
        return "timeout";
      }
    }
  }

  // Check for message patterns
  if (typeof error === "object" && error && "message" in error) {
    const msg = ((error as AppError).message || "").toLowerCase();
    // Network
    if (
      /network|connection|fetch failed|502|503|504|econnrefused|enotfound|econnreset/.test(
        msg
      )
    )
      return "network";
    // Auth
    if (/auth|token|unauthorized|forbidden|401|403|invalid[_ ]?token/.test(msg))
      return "auth";
    // Data
    if (/not found|404|no data|enoent|nodb/.test(msg)) return "data";
    // Timeout
    if (/timeout|timed out|etimedout|408/.test(msg)) return "timeout";
  }

  return "unknown";
}

// Wraps an async function (returns Promise<T>) with standardized error handling
export function withErrorHandling<T, A extends any[]>(
  fn: (...args: A) => Promise<T>,
  context?: string
): (...args: A) => Promise<T> {
  return async (...args: A): Promise<T> => {
    try {
      return await fn(...args);
    } catch (err) {
      throw createAppError(
        formatErrorMessage(err),
        getErrorType(err),
        undefined,
        context,
        err
      );
    }
  };
}
