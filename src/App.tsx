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
                  // Create the base element
                  let element = <Component />;

                  // Wrap with ProtectedRoute if needed
                  if (isProtected) {
                    element = <ProtectedRoute>{element}</ProtectedRoute>;
                  }

                  // Wrap with ErrorBoundary if specified
                  if (errorBoundary) {
                    element = (
                      <ErrorBoundary context={`Route: ${path}`}>
                        {element}
                      </ErrorBoundary>
                    );
                  }

                  return <Route key={path} path={path} element={element} />;
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
