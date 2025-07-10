import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show a spinner while we’re still confirming auth state
  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  // If not signed in, bump the user to the login page and
  // preserve their intended destination in state
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Otherwise render the protected content
  return <>{children}</>;
};

// Memo-izing is optional here; the component is tiny,
// but keeping it doesn’t hurt.
function areEqual(
  prevProps: ProtectedRouteProps,
  nextProps: ProtectedRouteProps
) {
  return prevProps.children === nextProps.children;
}

export default React.memo(ProtectedRoute, areEqual);
