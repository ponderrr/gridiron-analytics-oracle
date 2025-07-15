import { Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { routes } from "@/config/routes";
import {
  createProtectedRoute,
  createPublicRoute,
  setNavigate,
} from "@/utils/routeHelpers";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: true,
    },
  },
});

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
      <ThemeProvider>
        <Router>
          <NavigatorSetter />
          <AuthProvider>
            <Toaster />
            <Suspense
              fallback={<LoadingSpinner size="lg" message="Loading..." />}
            >
              <Routes>
                {(
                  routes.map(
                    ({
                      path,
                      component: Component,
                      protected: isProtected,
                      errorBoundary,
                    }) => {
                      return !!isProtected
                        ? createProtectedRoute(path, Component, errorBoundary)
                        : createPublicRoute(path, Component, errorBoundary);
                    }
                  ) as { path: string; element: React.ReactElement }[]
                ).map((routeConfig) => (
                  <Route
                    key={routeConfig.path}
                    path={routeConfig.path}
                    element={routeConfig.element}
                  />
                ))}
              </Routes>
            </Suspense>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
