import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = () => {
  const auth = JSON.parse(localStorage.getItem("user"));

  if (!auth) return <Navigate to="/login" replace />;
  if (auth.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
};

export default AdminProtectedRoute;
