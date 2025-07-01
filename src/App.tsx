import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { routes } from "@/config/routes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
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
                  const element = isProtected ? (
                    <ProtectedRoute>
                      <Component />
                    </ProtectedRoute>
                  ) : (
                    <Component />
                  );

                  return (
                    <Route
                      key={path}
                      path={path}
                      element={
                        errorBoundary ? (
                          <ErrorBoundary context={`Route: ${path}`}>
                            {element}
                          </ErrorBoundary>
                        ) : (
                          element
                        )
                      }
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
