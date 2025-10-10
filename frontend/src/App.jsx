import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceHistory from "./pages/InvoiceHistory";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminInvoices from "./pages/AdminInvoices.jsx";
import Admincal from "./pages/Admincal.jsx";
import Register from "./pages/Register.jsx";
import UserDetails from "./pages/UserDetails.jsx";
import UserReport from "./pages/UserReport.jsx";
import Punch from "./pages/Punch.jsx";
import AdminAttend from "./pages/AdminAttend.jsx";

export default function App() {
  return (
    <>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice"
          element={
            <ProtectedRoute>
              <CreateInvoice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice-history"
          element={
            <ProtectedRoute>
              <InvoiceHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminInvoices/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/invoices"
          element={
            <ProtectedRoute>
              <Admincal/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-user"
          element={
            <ProtectedRoute>
              <Register/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customer/:id"
          element={
            <ProtectedRoute>
              <UserDetails/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <UserReport/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/punch"
          element={
            <ProtectedRoute>
              <Punch/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attend"
          element={
            <ProtectedRoute>
              <AdminAttend/>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </>
  );
}
