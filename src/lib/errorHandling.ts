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
  if (
    typeof error === "object" &&
    error &&
    "type" in error &&
    (error as AppError).type
  ) {
    return (error as AppError).type!;
  }
  if (typeof error === "object" && error && "message" in error) {
    const msg = (error as AppError).message?.toLowerCase() || "";
    if (msg.includes("network")) return "network";
    if (msg.includes("auth") || msg.includes("token")) return "auth";
    if (msg.includes("not found")) return "data";
    if (msg.includes("timeout")) return "timeout";
  }
  return "unknown";
}

export function withErrorHandling<T>(
  fn: (...args: any[]) => Promise<T>,
  context?: string
): (...args: any[]) => Promise<T> {
  return async (...args: any[]) => {
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
