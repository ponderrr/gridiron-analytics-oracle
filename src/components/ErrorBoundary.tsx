import React, { ReactNode } from "react";

// Error type shapes
export type AppErrorType = "network" | "auth" | "data" | "unknown";
export interface AppError extends Error {
  type?: AppErrorType;
  status?: number;
  stack?: string;
  context?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const getErrorType = (error: AppError): AppErrorType => {
  if (error.type) return error.type;
  if (error.message?.toLowerCase().includes("network")) return "network";
  if (error.message?.toLowerCase().includes("auth")) return "auth";
  if (error.message?.toLowerCase().includes("token")) return "auth";
  if (error.message?.toLowerCase().includes("not found")) return "data";
  return "unknown";
};

const getErrorTitle = (type: AppErrorType) => {
  switch (type) {
    case "network":
      return "Network Error";
    case "auth":
      return "Authentication Error";
    case "data":
      return "Data Error";
    default:
      return "Something went wrong";
  }
};

const getErrorMessage = (type: AppErrorType) => {
  switch (type) {
    case "network":
      return "We couldn't connect to the server. Please check your internet connection and try again.";
    case "auth":
      return "There was a problem with your authentication. Please log in again or contact support.";
    case "data":
      return "We couldn't load the requested data. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again or contact support if the problem persists.";
  }
};

function reportError(
  error: AppError,
  errorInfo: React.ErrorInfo,
  context?: string
) {
  // Add more sophisticated reporting here (e.g., Sentry, LogRocket)
  // eslint-disable-next-line no-console
  console.error("[ErrorBoundary]", { error, errorInfo, context });
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log error if needed
    console.error("ErrorBoundary caught: ", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-400 font-bold text-lg mb-2">
            An error occurred
          </div>
          <div className="text-slate-400 mb-4">{this.state.error?.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
