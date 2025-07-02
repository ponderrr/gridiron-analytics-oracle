import React from "react";
import { RouteConfig } from "@/config/routes";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

export function createProtectedRoute(path: string, Component: React.ComponentType, errorBoundary?: boolean) {
  let element = React.createElement(Component);
  element = React.createElement(ProtectedRoute, {}, element);
  if (errorBoundary) {
    element = React.createElement(ErrorBoundary, { context: `Route: ${path}` }, element);
  }
  return { path, element };
}

export function createPublicRoute(path: string, Component: React.ComponentType, errorBoundary?: boolean) {
  let element = React.createElement(Component);
  if (errorBoundary) {
    element = React.createElement(ErrorBoundary, { context: `Route: ${path}` }, element);
  }
  return { path, element };
}

export function createRouteWithErrorBoundary(path: string, element: React.ReactNode) {
  return {
    path,
    element: React.createElement(ErrorBoundary, { context: `Route: ${path}` }, element),
  };
}