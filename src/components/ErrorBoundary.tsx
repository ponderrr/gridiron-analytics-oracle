import React, { ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  // Customization props
  title?: string;
  message?: string;
  showRetry?: boolean;
  showHome?: boolean;
  onRetry?: () => void;
  onError?: (error: AppError, errorInfo: React.ErrorInfo) => void;
  context?: string;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: React.ErrorInfo | null;
}

const getErrorType = (error: AppError): AppErrorType => {
  if (error.type) return error.type;
  if (error.message?.toLowerCase().includes("network")) return "network";
  if (error.message?.toLowerCase().includes("auth")) return "auth";
  if (error.message?.toLowerCase().includes("token")) return "auth";
  if (error.message?.toLowerCase().includes("not found")) return "data";
  return "unknown";
};

const getDefaultErrorTitle = (type: AppErrorType) => {
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

const getDefaultErrorMessage = (type: AppErrorType) => {
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

// Enhanced error reporting function
function reportError(
  error: AppError,
  errorInfo: React.ErrorInfo,
  context?: string
) {
  // Add more sophisticated reporting here (e.g., Sentry, LogRocket)
  const errorReport = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      type: getErrorType(error),
      status: error.status,
    },
    errorInfo: {
      componentStack: errorInfo.componentStack,
    },
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("[ErrorBoundary]", errorReport);
  }

  // TODO: Send to error reporting service in production
  // Example: Sentry.captureException(error, { extra: errorReport });
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error: error as AppError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = error as AppError;
    this.setState({ error: appError, errorInfo });

    // Report error
    reportError(appError, errorInfo, this.props.context);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(appError, errorInfo);
    }
  }

  handleRetry = () => {
    if (this.props.onRetry) {
      this.props.onRetry();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const errorType = this.state.error
        ? getErrorType(this.state.error)
        : "unknown";
      const title = this.props.title || getDefaultErrorTitle(errorType);
      const message = this.props.message || getDefaultErrorMessage(errorType);

      return (
        <div
          className={`flex flex-col items-center justify-center min-h-[400px] text-center p-8 ${
            this.props.className || ""
          }`}
        >
          <div className="max-w-md mx-auto">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-500/20 p-4 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </div>

            {/* Error Title */}
            <h2 className="text-xl font-bold text-white mb-3">{title}</h2>

            {/* Error Message */}
            <p className="text-slate-400 mb-6 leading-relaxed">{message}</p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-400 mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-xs text-slate-400 font-mono overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.props.showRetry !== false && (
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
              )}

              {this.props.showHome !== false && <HomeButton />}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Separate component for home button to use hooks
function HomeButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      className="flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-3 rounded-lg font-medium transition-colors"
    >
      <Home className="h-4 w-4" />
      <span>Go Home</span>
    </button>
  );
}

// Wrapper component to provide router context
function ErrorBoundaryWithRouter(props: ErrorBoundaryProps) {
  return <ErrorBoundary {...props} />;
}

export default ErrorBoundaryWithRouter;
