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
  FolderIcon,
  HomeIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
const AttendanceIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`h-6 w-6 ${props.className || ""}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002"
    />
  </svg>
);
const approvalIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
  className={`h-6 w-6 ${props.className || ""}`}
  >
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
</svg>
);



const sidebarLinks = [
  { name: "Dashboard", icon: HomeIcon, path: "/admin/dashboard" },
  { name: "Invoices", icon: FolderIcon, path: "/admin/invoices" },
  { name: "Total Users", icon: UserGroupIcon, path: "/admin/users" },
  { name: "Reports", icon: DocumentChartBarIcon, path: "/admin/reports" },
  { name: "Add User", icon: UserGroupIcon, path: "/add-user" },
  { name: "Settings", icon: Cog6ToothIcon, path: "/admin/settings" },
  { name: "Attendance", icon:AttendanceIcon,path:"/admin/attend"},
  { name: "User Approvals", icon:approvalIcon,path:"/admin/approvals"},
];

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [customers, setCustomers] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [statsData, setStatsData] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  // Disable browser back button
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch customers and their invoices
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

  // Calculate stats dynamically
  useEffect(() => {
    if (customers.length === 0) return;

    let total = 0,
      approved = 0,
      pending = 0,
      rejected = 0;

    customers.forEach((c) => {
      c.invoices.forEach((inv) => {
        total++;
        if (inv.status === "Approved") approved++;
        else if (inv.status === "Pending") pending++;
        else if (inv.status === "Rejected") rejected++;
      });
    });

    setStatsData({ total, approved, pending, rejected });
  }, [customers]);

  // Flatten invoices from all customers and sort
  useEffect(() => {
    if (customers.length === 0) return;

    const flattened = [];
    customers.forEach((customer) => {
      customer.invoices.forEach((inv) => {
        flattened.push({
          id: inv._id,
          user: customer.name || customer.email,
          date: inv.createdAt ? new Date(inv.createdAt) : null,
          status: inv.status || "Pending",
          setNumber: inv.setNumber || "-",
        });
      });
    });

    flattened.sort((a, b) => (b.date || 0) - (a.date || 0));
    setRecentInvoices(flattened.slice(0, 5));
  }, [customers]);

  // Stats data
  const stats = [
    {
      name: "Total Invoices",
      value: statsData.total,
      icon: ClipboardDocumentListIcon,
      color: "text-purple-400",
    },
    {
      name: "Approved",
      value: statsData.approved,
      icon: CheckCircleIcon,
      color: "text-green-400",
    },
    {
      name: "Pending",
      value: statsData.pending,
      icon: ClockIcon,
      color: "text-yellow-400",
    },
    {
      name: "Rejected",
      value: statsData.rejected,
      icon: XCircleIcon,
      color: "text-red-400",
    },
  ];

  return (
    <div className="relative flex h-screen text-gray-100 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[180px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-[180px]" />

      {/* Sidebar */}
      <aside className="relative z-10 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between">
        <div>
          <div className="text-center mt-2">
            <div className="p-3 text-center">
              <img
                src="/logos.png"
                alt="ZENTRASense Logo"
                className=" w-auto  h-10 object-contain scale-130"
              />
            </div>
          </div>
          <nav className="mt-4 space-y-2">
            {sidebarLinks.map((item) => (
              <a
                href={item.path}
                key={item.name}
                className="flex items-center w-full px-5 py-3 rounded-lg hover:bg-white/10 transition text-left"
              >
                <item.icon className="h-5 w-5 mr-3 text-purple-400" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>

        {/* Sidebar bottom */}
        <div className="p-6">
          <button
            type="button"
            onClick={() => {
              localStorage.clear(); // clear all storage
              window.location.href = "/"; // redirect to home
            }}
            className="flex items-center justify-center space-x-2 w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-full transition duration-200 shadow-md"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
        </aside>
      <main className="relative z-10 flex-1 overflow-y-auto p-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <span className="text-gray-300 text-sm">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
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
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Set</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv, idx) => (
                  <tr key={idx} className="border-t border-white/10 text-gray-300">
                    <td className="py-3 px-4">{inv.id}</td>
                    <td className="py-3 px-4">{inv.user}</td>
                    <td className="py-3 px-4">
                      {inv.date ? inv.date.toLocaleDateString() : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          inv.status === "Approved"
                            ? "bg-green-500/20 text-green-300"
                            : inv.status === "Rejected"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{inv.setNumber}</td>
                  </tr>
                ))}
                {recentInvoices.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-gray-400 text-center py-4">
                      No invoices found.
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
