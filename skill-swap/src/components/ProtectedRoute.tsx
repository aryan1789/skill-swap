import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You must be logged in to access this page.");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
