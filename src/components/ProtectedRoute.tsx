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

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!user) {
    // redirect to auth page with return url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function areEqual(
  prevProps: ProtectedRouteProps,
  nextProps: ProtectedRouteProps
) {
  return prevProps.children === nextProps.children;
}

export default React.memo(ProtectedRoute, areEqual);
