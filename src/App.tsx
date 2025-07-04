import React, { Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { routes } from "@/config/routes";
import {
  createProtectedRoute,
  createPublicRoute,
  setNavigate,
} from "@/utils/routeHelpers";

const queryClient = new QueryClient();

function NavigatorSetter() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <NavigatorSetter />
        <AuthProvider>
          <Suspense
            fallback={<LoadingSpinner size="lg" message="Loading..." />}
          >
            <Routes>
              {routes.map(
                ({
                  path,
                  component: Component,
                  protected: isProtected,
                  errorBoundary,
                }) => {
                  const routeConfig = isProtected
                    ? createProtectedRoute(path, Component, errorBoundary)
                    : createPublicRoute(path, Component, errorBoundary);
                  return (
                    <Route
                      key={routeConfig.path}
                      path={routeConfig.path}
                      element={routeConfig.element}
                    />
                  );
                }
              )}
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
