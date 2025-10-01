import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyRupeeIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
  FolderIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

const initialStats = [
  { name: "Total Invoices", value: 0, icon: ClipboardDocumentListIcon, color: "text-purple-400" },
  { name: "Approved Invoices", value: 0, icon: CheckCircleIcon, color: "text-green-400" },
  { name: "Pending Invoices", value: 0, icon: ClockIcon, color: "text-yellow-400" },
  { name: "Rejected Invoices", value: 0, icon: XCircleIcon, color: "text-red-400" },
];

const sidebarLinks = [
  { name: "Dashboard", icon: HomeIcon, path: "/dashboard" },
  { name: "Create Invoice", icon: PlusCircleIcon, path: "/invoice" },
  { name: "Invoices", icon: FolderIcon, path: "/invoice-history" },
  { name: "Settings", icon: Cog6ToothIcon, path: "/admin/settings" },
];

export default function Dashboard() {
  const { user } = useUser();
  const [sets, setSets] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/users/bills", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      // Group by setNumber
      const grouped = {};
      data.forEach((invoice) => {
        const setNum = invoice.setNumber ?? invoice.setNumber?.toString() ?? "unknown";
        if (!grouped[setNum]) {
          grouped[setNum] = {
            setNumber: setNum,
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            created: invoice.createdAt,
          };
        }

        grouped[setNum].total++;
        const status = (invoice.status || "").toString();
        if (status === "Approved") grouped[setNum].approved++;
        else if (status === "Pending") grouped[setNum].pending++;
        else if (status === "Rejected") grouped[setNum].rejected++;

        // keep earliest created date for the set
        if (invoice.createdAt && new Date(invoice.createdAt) < new Date(grouped[setNum].created)) {
          grouped[setNum].created = invoice.createdAt;
        }
      });

      setSets(Object.values(grouped));

      // Update stats
      const total = Array.isArray(data) ? data.length : 0;
      const approvedCount = data.filter((d) => (d.status || "") === "Approved").length;
      const pendingCount = data.filter((d) => (d.status || "") === "Pending").length;
      const rejectedCount = data.filter((d) => (d.status || "") === "Rejected").length;

      setStats([
        { ...initialStats[0], value: total },
        { ...initialStats[1], value: approvedCount },
        { ...initialStats[2], value: pendingCount },
        { ...initialStats[3], value: rejectedCount },
      ]);

      // Try to compute earnings from common fields, fallback to 0
      const totalEarnings = data.reduce((sum, inv) => {
        if (typeof inv.totalAmount === "number") return sum + inv.totalAmount;
        if (typeof inv.total === "number") return sum + inv.total;
        if (Array.isArray(inv.products)) {
          const pSum = inv.products.reduce((s, p) => {
            const price = p.price ?? p.rate ?? p.amount ?? 0;
            const qty = p.quantity ?? p.qty ?? 1;
            return s + price * qty;
          }, 0);
          return sum + pSum;
        }
        return sum;
      }, 0);
      setEarnings(totalEarnings);
    } catch (err) {
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return (
    <div className="relative flex h-screen text-gray-100 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[180px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-[180px]" />

      {/* Sidebar */}
      <aside className="relative z-10 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between">
        <div>
          <div className="p-6 text-center font-bold text-2xl tracking-wide text-white">
            Byte<span className="text-purple-400">Sense</span>
          </div>
          <nav className="mt-4 space-y-2">
            {sidebarLinks.map((item) => (
              <Link
                to={item.path}
                key={item.name}
                className="flex items-center w-full px-5 py-3 rounded-lg hover:bg-white/10 transition text-left"
              >
                <item.icon className="h-5 w-5 mr-3 text-purple-400" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 text-sm">
          <div className="mb-2 font-semibold">Admin User</div>
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-red-400 hover:text-red-500">
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span>Logout</span>
            </Link>
            <button
              onClick={fetchBills}
              className="ml-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs"
            >
              Refresh
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-full bg-white/10 border border-white/20 placeholder-gray-400 text-gray-100 focus:ring-2 focus:ring-purple-400 outline-none"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2 text-gray-400" />
            </div>
            <div className="relative">
              <BellIcon className="h-6 w-6 text-gray-200 cursor-pointer" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                1
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-300 mb-8">
          Welcome back, <span className="font-semibold text-white">{user?.email ?? "User"}</span> 🚀
        </p>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="p-5 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-gray-400 mt-1">{stat.name}</div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm text-green-400 mt-3">↑ 0% from last month</p>
            </motion.div>
          ))}
        </div>

        {/* Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg mb-10"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-base">Total Earnings</h3>
              <p className="text-3xl font-bold mt-1 text-white">
                {earnings > 0
                  ? earnings.toLocaleString("en-IN", { style: "currency", currency: "INR" })
                  : "₹0.00"}
              </p>
              <p className="text-sm text-green-400 mt-2">↑ 0.00% from last month</p>
            </div>
            <div className="bg-purple-500/10 p-4 rounded-lg text-purple-400">
              <CurrencyRupeeIcon className="h-8 w-8" />
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-white">Your Sets</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="bg-white/5 text-gray-300">
                  <th className="py-3 px-4">Set No</th>
                  <th className="py-3 px-4">Total Invoices</th>
                  <th className="py-3 px-4">Approved</th>
                  <th className="py-3 px-4">Pending</th>
                  <th className="py-3 px-4">Rejected</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="text-gray-400 text-center">
                    <td className="py-4 px-4" colSpan={7}>
                      Loading...
                    </td>
                  </tr>
                ) : sets.length > 0 ? (
                  sets.map((s, idx) => (
                    <tr key={idx} className="border-b border-white/10 text-gray-300">
                      <td className="py-3 px-4">{s.setNumber}</td>
                      <td className="py-3 px-4">{s.total}</td>
                      <td className="py-3 px-4 text-green-400">{s.approved}</td>
                      <td className="py-3 px-4 text-yellow-400">{s.pending}</td>
                      <td className="py-3 px-4 text-red-400">{s.rejected}</td>
                      <td className="py-3 px-4">
                        {s.created ? new Date(s.created).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/invoice-set/${encodeURIComponent(s.setNumber)}`}
                          className="px-3 py-1 text-xs bg-purple-600 rounded-lg hover:bg-purple-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="text-gray-400 text-center">
                    <td className="py-4 px-4" colSpan={7}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
