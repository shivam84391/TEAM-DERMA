import React, { useEffect, useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function AdminApproval() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Vite env variable
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/admin/pending-users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [API_URL]);

  const handleApproval = async (userId, approve) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/admin/approve-user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approve }),
      });

      if (!res.ok) throw new Error("Failed to update user status");

      // Remove user from the list after approval/rejection
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  if (loading) return <p className="text-center text-white mt-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      <h1 className="text-2xl font-bold mb-6">📝 Pending User Approvals</h1>

      <div className="overflow-x-auto bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-white/10 text-gray-300 text-left">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">City/State</th>
              <th className="px-4 py-3">Pincode</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, idx) => (
                <tr
                  key={idx}
                  className="border-t border-white/10 text-gray-200 hover:bg-white/10 transition"
                >
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.phone || "-"}</td>
                  <td className="px-4 py-3">{user.cityState || "-"}</td>
                  <td className="px-4 py-3">{user.pincode || "-"}</td>
                  <td className="px-2 py-2 flex gap-2">
                    <button
                      onClick={() => handleApproval(user._id, true)}
                      className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-green-700 px-2 py-0.5 rounded-md text-xs hover:scale-105 transition"
                    >
                      <CheckIcon className="h-4 w-4" /> <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleApproval(user._id, false)}
                      className="flex items-center space-x-1 bg-gradient-to-r from-red-500 to-red-700 px-2 py-0.5 rounded-md text-xs hover:scale-105 transition"
                    >
                      <XMarkIcon className="h-4 w-4" /> <span>Reject</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400">
                  No pending users
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
