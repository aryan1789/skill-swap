import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../store/hooks";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  // Use Redux to check authentication state
  const { isLoggedIn, loading } = useAuth();
  
  console.log("ProtectedRoute - Auth state:", { isLoggedIn, loading });

  // Show loading if Redux is still determining auth state
  if (loading) {
    return <div style={{ padding: "1rem" }}>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
