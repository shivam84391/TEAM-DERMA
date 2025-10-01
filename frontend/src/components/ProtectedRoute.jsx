import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("token"); 
  // login successful hone ke baad yeh set hoga

  if (!isAuthenticated) {
    return <Navigate to="/" />; // agar login nahi hai toh Login pe bhej do
  }

  return children; // agar login hai toh jo bhi component hai usko dikhao
}
