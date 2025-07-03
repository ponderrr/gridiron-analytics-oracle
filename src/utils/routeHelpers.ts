import React from "react";
import { RouteConfig } from "@/config/routes";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary, { withErrorBoundary } from "@/components/ErrorBoundary";
import * as Sentry from "@sentry/react";

/**
 * Route Helpers with Error Boundary Integration
 *
 * All route creation functions now include error boundaries by default.
 *
 * Usage examples:
 *
 * 1. Protected route with error boundary (default):
 * createProtectedRoute("/admin", AdminPage)
 *
 * 2. Public route with error boundary (default):
 * createPublicRoute("/", HomePage)
 *
 * 3. Route without error boundary:
 * createProtectedRoute("/admin", AdminPage, false)
 *
 * 4. Using HOC-based route creation:
 * createRouteWithHOC("/dashboard", DashboardPage, true, "Dashboard")
 */

// Standard error handlers for routes
const handleRouteError = (error: Error, errorInfo: React.ErrorInfo) => {
  // Log route-specific errors
  console.error(`[Route Error] ${errorInfo.componentStack}`, error);

  // Send to Sentry in production
  // NOTE: Sentry.init should be called ONCE at app startup (e.g., in main.tsx or a sentry.ts). Do not call it here.
  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        context: "Route Error",
        url: window.location.href,
      },
    });
  }
};

// Navigation singleton for programmatic navigation outside components
let navigateRef: ((to: string, options?: any) => void) | null = null;

export function setNavigate(fn: (to: string, options?: any) => void) {
  navigateRef = fn;
}

function getCurrentPath() {
  return (
    window.location.pathname + window.location.search + window.location.hash
  );
}

const handleRouteRetry = () => {
  // Gracefully retry the current route using the router if possible
  if (navigateRef) {
    // Reload the current route (replace: true to avoid pushing a new entry)
    navigateRef(getCurrentPath(), { replace: true });
  } else {
    // Fallback: hard reload if navigation is not available
    window.location.reload();
  }
};

export function createProtectedRoute(
  path: string,
  Component: React.ComponentType,
  errorBoundary: boolean = true
) {
  let element = React.createElement(Component);
  element = React.createElement(ProtectedRoute, { children: element });

  if (errorBoundary) {
    element = React.createElement(ErrorBoundary, {
      context: `Protected Route: ${path}`,
      onError: handleRouteError,
      onRetry: handleRouteRetry,
      children: element,
    });
  }

  return { path, element };
}

export function createPublicRoute(
  path: string,
  Component: React.ComponentType,
  errorBoundary: boolean = true
) {
  let element = React.createElement(Component);

  if (errorBoundary) {
    element = React.createElement(ErrorBoundary, {
      context: `Public Route: ${path}`,
      onError: handleRouteError,
      onRetry: handleRouteRetry,
      children: element,
    });
  }

  return { path, element };
}

export function createRouteWithErrorBoundary(
  path: string,
  element: React.ReactNode,
  context?: string
) {
  return {
    path,
    element: React.createElement(ErrorBoundary, {
      context: context || `Route: ${path}`,
      onError: handleRouteError,
      onRetry: handleRouteRetry,
      children: element,
    }),
  };
}

// HOC-based route creation for better error boundary integration
export function createRouteWithHOC(
  path: string,
  Component: React.ComponentType,
  isProtected: boolean = false,
  context?: string
) {
  const WrappedComponent = withErrorBoundary(
    Component,
    context || `Route: ${path}`,
    handleRouteError,
    handleRouteRetry
  );

  let element: React.ReactElement = React.createElement(WrappedComponent);

  if (isProtected) {
    element = React.createElement(ProtectedRoute, { children: element });
  }

  return { path, element };
}
