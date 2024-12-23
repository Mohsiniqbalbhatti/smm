import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const ProtectedRoute = () => {
  const [authUser] = useAuth();

  // If not authenticated, redirect to signup/login page
  if (!authUser) {
    return <Navigate to="/" />;
  }

  // If the roleRequired is "admin" and the user's role is not admin, redirect to unauthorized page
  if (authUser.role !== "admin") {
    return <Navigate to="/AdminAccess" />;
  }

  // If the user is authenticated and role matches (if required), render the requested route
  return <Outlet />;
};

export default ProtectedRoute;
