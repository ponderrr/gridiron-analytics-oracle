import React from "react";
import { RouteConfig } from "@/config/routes";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

export function createProtectedRoute(path: string, Component: React.ComponentType, errorBoundary?: boolean) {
  let element = <Component />;
  element = <ProtectedRoute>{element}</ProtectedRoute>;
  if (errorBoundary) {
    element = <ErrorBoundary context={`Route: ${path}`}>{element}</ErrorBoundary>;
  }
  return { path, element };
}

export function createPublicRoute(path: string, Component: React.ComponentType, errorBoundary?: boolean) {
  let element = <Component />;
  if (errorBoundary) {
    element = <ErrorBoundary context={`Route: ${path}`}>{element}</ErrorBoundary>;
  }
  return { path, element };
}

export function createRouteWithErrorBoundary(path: string, element: React.ReactNode) {
  return {
    path,
    element: <ErrorBoundary context={`Route: ${path}`}>{element}</ErrorBoundary>,
  };
} 