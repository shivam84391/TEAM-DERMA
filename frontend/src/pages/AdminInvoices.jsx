import React, { useEffect, useState } from "react";
import { MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function AdminInvoices() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/api/admin/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch customers");
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };

    fetchData();
  }, []);

  // search filter
  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      {/* Heading + Search */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <span>👥</span> <span>Customer Management</span>
        </h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 
                       placeholder-gray-400 text-white focus:ring-2 focus:ring-purple-400 outline-none"
          />
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-white/10 text-gray-300 text-left">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Total Invoices</th>
              <th className="px-4 py-3">Pending</th>
              <th className="px-4 py-3">Approved</th>
              <th className="px-4 py-3">Rejected</th>
              <th className="px-4 py-3">Awaiting Review</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((c, idx) => {
                const total = c.invoices?.length || 0;
                const pending = c.invoices?.filter(i => i.status === "pending").length || 0;
                const approved = c.invoices?.filter(i => i.status === "approved").length || 0;
                const rejected = c.invoices?.filter(i => i.status === "rejected").length || 0;
                const awaiting = c.invoices?.filter(i => i.status === "awaiting").length || 0;

                return (
                  <tr
                    key={idx}
                    className={`border-t border-white/10 text-gray-200 transition ${
                      total === 0 ? "bg-gray-800/40" : "hover:bg-white/10"
                    }`}
                  >
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3">{c.contact || "-"}</td>
                    <td className="px-4 py-3">{total}</td>

                    {/* Gradient Badges */}
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium">
                        {pending}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-green-400 to-green-600 text-black font-medium">
                        {approved}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-red-400 to-red-600 text-white font-medium">
                        {rejected}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-purple-400 to-purple-600 text-white font-medium">
                        {awaiting}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button className="flex items-center space-x-1 bg-gradient-to-r from-red-500 to-red-700 px-3 py-1 rounded-md text-xs hover:scale-105 transition">
                        <TrashIcon className="h-4 w-4" /> <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-400">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
