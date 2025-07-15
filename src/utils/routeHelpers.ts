import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

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
  // Inline protection logic (mimics ProtectedRoute)
  function ProtectedWrapper(props: any) {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    if (isLoading) return <LoadingSpinner size="lg" />;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    return <Component {...props} />;
  }
  let element = React.createElement(ProtectedWrapper);
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
