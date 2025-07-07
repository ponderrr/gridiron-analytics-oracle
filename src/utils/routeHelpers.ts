import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

/**
 * Route Helpers for App Routing
 *
 * Usage examples:
 *
 * 1. Protected route with error boundary (default):
 *    createProtectedRoute("/admin", AdminPage)
 *
 * 2. Public route with error boundary (default):
 *    createPublicRoute("/", HomePage)
 *
 * 3. Route without error boundary:
 *    createProtectedRoute("/admin", AdminPage, false)
 */

// Standard error handlers for routes
const handleRouteError = (error: Error, errorInfo: React.ErrorInfo) => {
  // Log route-specific errors
  console.error(`[Route Error] ${errorInfo.componentStack}`, error);
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
  if (navigateRef) {
    navigateRef(getCurrentPath(), { replace: true });
  } else {
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

// Specialized error boundary route creators for major routes
export function createDashboardRoute(Component: React.ComponentType) {
  return createProtectedRoute(
    "/dashboard",
    Component,
    true // always error boundary
  );
}

export function createPlayersRoute(Component: React.ComponentType) {
  return createProtectedRoute(
    "/players",
    Component,
    true // always error boundary
  );
}

export function createAnalyticsRoute(Component: React.ComponentType) {
  return createProtectedRoute(
    "/analytics",
    Component,
    true // always error boundary
  );
}

export function createAdminRoute(Component: React.ComponentType) {
  return createProtectedRoute(
    "/admin",
    Component,
    true // always error boundary
  );
}

export function createTradeAnalyzerRoute(Component: React.ComponentType) {
  return createProtectedRoute(
    "/trade-analyzer",
    Component,
    true // always error boundary
  );
}
