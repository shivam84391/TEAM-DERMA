import React, { useEffect, useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate, useParams } from "react-router-dom";

export default function UserDetails() {
  const navigate = useNavigate();
  const { id } = useParams(); // userId from route params

  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user details + invoices
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:4000/api/admin/${id}/details`);
      const data = await res.json();
      setUser(data.user);
      setInvoices(data.invoices);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [id]);

  // Update invoice status (Approve / Reject) and auto-refresh
  const updateStatus = async (setNumber, action) => {
    try {
      const token = localStorage.getItem("token");
      let url = `http://localhost:4000/api/admin/invoices/${setNumber}`;
      if (action === "approve") url += "/approve";
      if (action === "reject") url += "/reject";

      const res = await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Auto-refresh after update
      await fetchUserData();
    } catch (err) {
      console.error("Error updating invoice status:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
        Loading user details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        User not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg mb-6 border border-white/20 transition"
      >
        <ArrowLeftIcon className="h-5 w-5" /> Back to Customers
      </button>

      <h1 className="text-2xl font-bold mb-6">📑 Invoice Details</h1>

      {/* === USER CARD === */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6 shadow-lg">
        <h2 className="text-lg font-bold mb-4">{user.name}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-300">Email</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="text-gray-300">Phone</p>
            <p>{user.phone}</p>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <p className="text-gray-300">Address</p>
            <p>{user.address}</p>
          </div>
          <div>
            <p className="text-gray-300">City/State</p>
            <p>{user.cityState}</p>
          </div>
          <div>
            <p className="text-gray-300">Pincode</p>
            <p>{user.pincode}</p>
          </div>
          <div>
            <p className="text-gray-300">Member Since</p>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* === STATS === */}
      {stats && (
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
            <p className="text-gray-300 text-sm">Total Invoices</p>
            <p className="text-2xl font-bold">{stats.totalInvoices}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
            <p className="text-gray-300 text-sm">Approved</p>
            <p className="text-2xl font-bold text-green-400">{stats.approvedCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
            <p className="text-gray-300 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pendingCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
            <p className="text-gray-300 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-red-400">{stats.rejectedCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
            <p className="text-gray-300 text-sm">Total Amount</p>
            <p className="text-2xl font-bold text-blue-400">
              ₹{stats.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* === TABLE === */}
      <div className="overflow-x-auto bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-white/10 text-gray-300 text-left">
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => (
              <tr
                key={idx}
                className="border-t border-white/10 hover:bg-white/10 transition"
              >
                <td className="px-4 py-3">{inv.invoiceNumber || inv._id}</td>
                <td className="px-4 py-3">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">{inv.products?.length || 0}</td>
                <td className="px-4 py-3">
                  ₹
                  {inv.products?.reduce(
                    (sum, p) => sum + (p.rate * p.qty - p.discount),
                    0
                  ).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  {inv.status === "Approved" ? (
                    <span className="px-2 py-1 text-green-400 bg-green-400/10 rounded-md">
                      Approved
                    </span>
                  ) : inv.status === "Rejected" ? (
                    <span className="px-2 py-1 text-red-400 bg-red-400/10 rounded-md">
                      Rejected
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-yellow-400 bg-yellow-400/10 rounded-md">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 flex flex-wrap gap-2">
                  <button className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 rounded-md">
                    View
                  </button>
                  <button
                    onClick={() => updateStatus(inv.setNumber, "approve")}
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded-md"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(inv.setNumber, "reject")}
                    className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
