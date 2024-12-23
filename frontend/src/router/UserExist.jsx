import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const UserExist = () => {
  const [authUser] = useAuth();

  // If not authenticated, redirect to signup/login page
  if (!authUser) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default UserExist;
