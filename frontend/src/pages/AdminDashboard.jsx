import React, { useState, useEffect } from "react";
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
  UserGroupIcon,
  DocumentChartBarIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const stats = [
  { name: "Total Invoices", value: 16539, icon: ClipboardDocumentListIcon, color: "text-purple-400" },
  { name: "Approved", value: 1928, icon: CheckCircleIcon, color: "text-green-400" },
  { name: "Pending", value: 11655, icon: ClockIcon, color: "text-yellow-400" },
  { name: "Rejected", value: 2198, icon: XCircleIcon, color: "text-red-400" },
];

const sidebarLinks = [
  { name: "Dashboard", icon: HomeIcon, path: "/admin/dashboard" },
  { name: "Invoices", icon: FolderIcon, path: "/invoices" },
  { name: "Total Users", icon: UserGroupIcon, path: "/users" },
  { name: "Reports", icon: DocumentChartBarIcon, path: "/reports" },
  { name: "Approve Set", icon: CheckCircleIcon, path: "/approve-set" },
  { name: "Pending Users", icon: ClockIcon, path: "/pending-users" },
  { name: "Help Center", icon: ChatBubbleOvalLeftEllipsisIcon, path: "/help-center" },
  { name: "Settings", icon: Cog6ToothIcon, path: "/admin/settings" },
];

const recentInvoices = [
  { id: "#NV398336", amount: "₹2,275.00", date: "Sep 30, 2025", email: "FAZALNAIKWADI2712@GMAIL.COM", status: "Pending" },
  { id: "#NV402190", amount: "₹3,516.00", date: "Sep 30, 2025", email: "IRAMMUJAWAR09@GMAIL.COM", status: "Pending" },
  { id: "#NV399318", amount: "₹17,153.00", date: "Sep 30, 2025", email: "TAJFOODPLAZA@GMAIL.COM", status: "Pending" },
  { id: "#NV401832", amount: "₹23,716.00", date: "Sep 30, 2025", email: "FATMAANSARI442@GMAIL.COM", status: "Pending" },
  { id: "#NV398577", amount: "₹1,910.00", date: "Sep 30, 2025", email: "NAZMAKHAN03009@GMAIL.COM", status: "Pending" },
];

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex h-screen text-gray-100 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[180px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-[180px]" />

      {/* Sidebar */}
      <aside className="relative z-10 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between">
        <div>
          <div className="p-6 text-center font-bold text-2xl tracking-wide text-white">
            Invoice<span className="text-purple-400">System</span>
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

        {/* ✅ Logout Section */}
        <div className="p-4 border-t border-white/10 text-sm">
          <div className="mb-2 font-semibold">Admin User</div>
          <Link to="/" className="flex items-center space-x-2 text-red-400 hover:text-red-500">
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          {/* Left side: Dashboard + Time */}
          <div className="flex items-center space-x-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <span className="text-gray-300 text-sm">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>

          {/* Right side: Search + Notifications */}
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
                5
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-300 mb-8">
          Welcome back, <span className="font-semibold text-white">Admin</span> 🚀
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
              transition={{ delay: idx * 0.1 }}
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
            </motion.div>
          ))}
        </div>

        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg mb-10"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-base">Total Revenue</h3>
              <p className="text-3xl font-bold mt-1 text-white">₹9,640.00</p>
              <p className="text-sm text-green-400 mt-2">12% approval rate</p>
            </div>
            <div className="bg-purple-500/10 p-4 rounded-lg text-purple-400">
              <CurrencyRupeeIcon className="h-8 w-8" />
            </div>
          </div>
        </motion.div>

        {/* Recent Invoices */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-white">Recent Invoices</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="bg-white/5 text-gray-300">
                  <th className="py-3 px-4">Invoice</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv, idx) => (
                  <tr key={idx} className="border-t border-white/10 text-gray-300">
                    <td className="py-3 px-4">{inv.id}</td>
                    <td className="py-3 px-4">{inv.amount}</td>
                    <td className="py-3 px-4">{inv.date}</td>
                    <td className="py-3 px-4">{inv.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
