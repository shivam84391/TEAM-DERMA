import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyRupeeIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
  FolderIcon,
  HomeIcon,
  FingerPrintIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  { name: "Punch Machine", icon: FingerPrintIcon, path: "/punch" },
];

export default function Dashboard() {
  const { user } = useUser();
  const [sets, setSets] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Prevent back navigation after login
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Fetch bills and compute stats
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

      const grouped = {};
      data.forEach((invoice) => {
        const setNum = invoice.setNumber ?? "unknown";
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

        grouped[setNum].total += 1;
        const status = (invoice.status || "").toLowerCase();
        if (status === "approved") grouped[setNum].approved += 1;
        else if (status === "pending") grouped[setNum].pending += 1;
        else if (status === "rejected") grouped[setNum].rejected += 1;

        if (invoice.createdAt && new Date(invoice.createdAt) < new Date(grouped[setNum].created)) {
          grouped[setNum].created = invoice.createdAt;
        }
      });

      const setsArr = Object.values(grouped);
      setSets(setsArr);

      const total = setsArr.reduce((acc, s) => acc + Number(s.total || 0), 0);
      const approvedCount = setsArr.reduce((acc, s) => acc + Number(s.approved || 0), 0);
      const pendingCount = setsArr.reduce((acc, s) => acc + Number(s.pending || 0), 0);
      const rejectedCount = setsArr.reduce((acc, s) => acc + Number(s.rejected || 0), 0);

      setStats([
        { ...initialStats[0], value: total },
        { ...initialStats[1], value: approvedCount },
        { ...initialStats[2], value: pendingCount },
        { ...initialStats[3], value: rejectedCount },
      ]);
    } catch (err) {
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate earnings
  useEffect(() => {
    let calculatedEarnings = 0;
    sets.forEach((set) => {
      const totalInv = Number(set.total || 0);
      const invalidInv = Number(set.rejected || 0);
      const validInv = totalInv - invalidInv;

      if (validInv >= 3 && invalidInv <= 1) calculatedEarnings += 100;
      else if (invalidInv === 2 || invalidInv === 3) calculatedEarnings += validInv * 2;
    });
    setEarnings(calculatedEarnings);
  }, [sets]);

  // Fetch bills on mount
  useEffect(() => {
    fetchBills();
  }, []);

  // Logout with punch-out confirmation
  const handleLogoutClick = () => {
    const punchInTime = localStorage.getItem("punchInTime"); // store this on punch-in
    const now = new Date();
    let hoursWorked = 0;

    if (punchInTime) {
      const diffMs = now - new Date(punchInTime);
      hoursWorked = Math.floor(diffMs / (1000 * 60 * 60)); // convert to hours
    }

    toast.info(
      <div>
        <p>You have worked {hoursWorked} hour{hoursWorked !== 1 ? "s" : ""} today.</p>
        {hoursWorked < 7 && <p className="text-red-400">You haven't completed 7 hours yet!</p>}
        <p>Do you want to logout?</p>
        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss();
              logoutUser();
            }}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            No
          </button>
        </div>
      </div>,
      { autoClose: false, closeButton: false }
    );
  };

  const logoutUser = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch("http://localhost:4000/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("punchInTime"); // clear punch info
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="relative flex h-screen text-gray-100 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden">
      <ToastContainer position="top-center" autoClose={false} closeOnClick={false} draggable={false} />

      {/* Background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[180px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-[180px]" />

      {/* Sidebar */}
      <aside className="relative z-10 w-52 bg-white/10 backdrop-blur-xl border-r border-white/5 flex flex-col justify-between">
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
              <Link
                to={item.path}
                key={item.name}
                className="flex items-center w-full px-4 py-2 rounded-lg hover:bg-white/20 hover:backdrop-blur-sm transition text-left text-sm text-gray-200"
              >
                <item.icon className="h-5 w-5 mr-3 text-purple-300" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Bottom: Logout + Refresh */}
        <div className="p-3 border-t border-white/10 text-sm">
          <button
            onClick={handleLogoutClick}
            className="flex items-center justify-center space-x-2 w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-full transition duration-200 shadow-md"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
          <button
            onClick={fetchBills}
            className="mt-2 w-full px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-full transition duration-200 shadow-md"
          >
            Refresh
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
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
                  <div className="text-3xl font-bold text-white">{stat.value ?? 0}</div>
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
                    <td className="py-4 px-4" colSpan={7}>Loading...</td>
                  </tr>
                ) : sets.length > 0 ? (
                  sets.map((s, idx) => (
                    <tr key={idx} className="border-b border-white/10 text-gray-300">
                      <td className="py-3 px-4">{s.setNumber}</td>
                      <td className="py-3 px-4">{s.total}</td>
                      <td className="py-3 px-4 text-green-400">{s.approved}</td>
                      <td className="py-3 px-4 text-yellow-400">{s.pending}</td>
                      <td className="py-3 px-4 text-red-400">{s.rejected}</td>
                      <td className="py-3 px-4">{s.created ? new Date(s.created).toLocaleDateString() : "-"}</td>
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
                    <td className="py-4 px-4" colSpan={7}>No data available</td>
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
