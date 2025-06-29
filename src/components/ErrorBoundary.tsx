import React from "react";

// Error type shapes
export type AppErrorType = "network" | "auth" | "data" | "unknown";
export interface AppError extends Error {
  type?: AppErrorType;
  status?: number;
  stack?: string;
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  context?: string;
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
  retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: AppError): ErrorBoundaryState {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: AppError, errorInfo: React.ErrorInfo) {
    reportError(error, errorInfo, this.props.context);
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    const delay = Math.min(1000 * 2 ** retryCount, 10000);
    this.setState({ hasError: false, error: null, retryCount: retryCount + 1 });
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
    this.retryTimeout = setTimeout(() => {
      // No-op: just allow re-render
    }, delay);
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const type = getErrorType(this.state.error);
      const title = getErrorTitle(type);
      const message = getErrorMessage(type);
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-center p-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-400 mb-2">{title}</h2>
            <p className="text-slate-300 mb-4">{message}</p>
            {process.env.NODE_ENV === "development" &&
              this.state.error.stack && (
                <details className="bg-slate-900 text-red-300 text-xs rounded p-2 mb-4 overflow-x-auto">
                  <summary>Stack Trace</summary>
                  <pre>{this.state.error.stack}</pre>
                </details>
              )}
            {this.state.error.message && (
              <pre className="bg-slate-900 text-red-300 text-xs rounded p-2 mb-4 overflow-x-auto">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleRetry}
              className="btn-primary px-6 py-2 rounded font-semibold mt-2"
            >
              Retry
            </button>
            {this.state.retryCount > 0 && (
              <div className="text-xs text-slate-500 mt-2">
                Retrying... (attempt {this.state.retryCount + 1})
              </div>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
