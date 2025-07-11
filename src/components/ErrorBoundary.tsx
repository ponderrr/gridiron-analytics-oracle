import React, { ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createAppError, getErrorType } from "@/lib/errorHandling";
import { ThemeContext } from "@/contexts/ThemeContext";

/**
 * ErrorBoundary Component
 *
 * Usage examples:
 *
 * 1. Basic usage:
 * <ErrorBoundary context="MyComponent">
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * 2. With HOC:
 * const SafeComponent = withErrorBoundary(MyComponent, "MyComponent");
 *
 * 3. With custom handlers:
 * const SafeComponent = withErrorBoundary(
 *   MyComponent,
 *   "MyComponent",
 *   (error, errorInfo) => console.error("Custom error handler", error),
 *   () => console.log("Custom retry handler")
 * );
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  context?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// Standardized error reporting
function reportError(
  error: Error,
  _errorInfo: React.ErrorInfo,
  context?: string
) {
  const appError = createAppError(
    error.message,
    "unknown",
    undefined,
    context,
    error
  );

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("[ErrorBoundary]", {
      error: appError,
      context,
      url: window.location.href,
    });
  }

  // TODO: Send to error reporting service in production
  // Ex: Sentry.captureException(error, { extra: appError });
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
    return { hasError: true, error: error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error: error, errorInfo });

    // Report error
    reportError(error, errorInfo, this.props.context);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
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

      // Error type mapping for title and message
      const errorTypeMap: Record<string, { title: string; message: string }> = {
        network: {
          title: "Connection Issue",
          message:
            "We couldn't connect to the server. Please check your internet connection, then click 'Try Again.' If the problem continues, contact support.",
        },
        auth: {
          title: "Sign-in Required",
          message:
            "Your session has expired or there was a problem signing you in. Please log in again. If you continue to have trouble, contact support for help.",
        },
        data: {
          title: "Data Unavailable",
          message:
            "We couldn't load the information you requested. Please refresh the page or try again later. If this keeps happening, let us know.",
        },
        unknown: {
          title: "Something Went Wrong",
          message:
            "Oops! An unexpected error occurred. Please click 'Try Again' or return to the home page. If the issue persists, contact our support team for assistance.",
        },
      };

      const { title, message } =
        errorTypeMap[errorType] || errorTypeMap["unknown"];

      // Get theme classes
      // Removed unused: const { effectiveTheme } = this.context as { effectiveTheme: "light" | "dark" };

      return (
        <div
          className={`flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-[var(--color-bg-primary)]`}
        >
          <div className="max-w-md mx-auto">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className={`bg-red-500/20 text-red-400 p-4 rounded-full`}>
                <AlertTriangle className={`text-red-400 h-8 w-8`} />
              </div>
            </div>

            {/* Error Title */}
            <h2
              className={`text-xl font-bold text-[var(--color-text-primary)] mb-3`}
            >
              {title}
            </h2>

            {/* Error Message */}
            <p
              className={`text-[var(--color-text-tertiary)] mb-6 leading-relaxed`}
            >
              {message}
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left">
                <summary
                  className={`text-sm text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text-tertiary)] mb-2`}
                >
                  Error Details (Development)
                </summary>
                <div
                  className={`bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-4 text-xs text-[var(--color-text-tertiary)] font-mono overflow-auto`}
                >
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
              <button
                onClick={this.handleRetry}
                className={`flex items-center justify-center space-x-2 bg-emerald-500/20 hover:bg-emerald-600 text-emerald-400 px-6 py-3 rounded-lg font-medium transition-colors`}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </button>

              <HomeButton />
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

// HOC for easier component wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  context?: string,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void,
  onRetry?: () => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary context={context} onError={onError} onRetry={onRetry}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Add contextType for theme
ErrorBoundary.contextType = ThemeContext;

export default ErrorBoundaryWithRouter;
