import React from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function InvoiceHistory() {
  const invoices = []; // later replace with API data

  return (
    <div className="relative flex h-screen text-gray-100 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[180px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-[180px]" />

      {/* Main Section */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6">
        {/* Title + Search */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Invoice History</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search invoices..."
              className="pl-10 pr-4 py-2 rounded-full bg-white/10 border border-white/20 placeholder-gray-400 text-gray-100 focus:ring-2 focus:ring-purple-400 outline-none"
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 shadow-lg"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="bg-white/5 text-gray-300">
                  <th className="py-3 px-4">Set No</th>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <DocumentTextIcon className="h-10 w-10 text-gray-500 mb-2" />
                        <p>No invoices found in your account</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-white/5 text-gray-200">
                      <td className="py-3 px-4">{inv.setNo}</td>
                      <td className="py-3 px-4">{inv.invoiceNo}</td>
                      <td className="py-3 px-4">{inv.customer}</td>
                      <td className="py-3 px-4">{inv.category}</td>
                      <td className="py-3 px-4">{inv.date}</td>
                      <td className="py-3 px-4 flex space-x-3">
                        <button className="text-blue-400 hover:text-blue-500">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button className="text-yellow-400 hover:text-yellow-500">
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button className="text-red-400 hover:text-red-500">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bottom Buttons */}
        <div className="flex justify-between mt-6">
          <Link
            to="/dashboard"
            className="px-5 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition text-gray-200"
          >
            ← Return to Dashboard
          </Link>
          <Link
            to="/invoice"
            className="flex items-center px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Create New Invoice
          </Link>
        </div>
      </main>
    </div>
  );
}
