import React from "react";
import { RouteConfig } from "@/config/routes";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary, { withErrorBoundary } from "@/components/ErrorBoundary";

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
};

const handleRouteRetry = () => {
  // Force a page refresh for route errors
  window.location.reload();
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
