/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "framer-motion";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    cityState: "",
    pincode: "",
    password: "",
    role: "user",
  });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:4000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Registered Successfully!");
      } else {
        setMessage("❌ " + (data.message || "Something went wrong"));
      }
    } catch (error) {
      setMessage("❌ Server Error, please try again");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-3xl bg-gray-900/90 rounded-2xl border border-gray-700 shadow-2xl p-8"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <img
            src="/logos.png"
            alt="Logo"
            className="mx-auto max-h-20 w-auto object-contain drop-shadow-md"
          />
          <h1 className="text-indigo-400 font-extrabold text-3xl mt-4">
            Register User/Admin
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="9876543210"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Pincode</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              placeholder="123456"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* City/State */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">City/State</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              value={formData.cityState}
              onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
              placeholder="e.g. Delhi, India"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
            <motion.textarea
              whileFocus={{ scale: 1.02 }}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street, Locality, Landmark..."
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              rows="3"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Register As</label>
            <motion.select
              whileFocus={{ scale: 1.02 }}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </motion.select>
          </div>
        </form>

        {/* Message */}
        {message && (
          <p className={`mt-4 text-center font-medium ${
            message.startsWith("✅") ? "text-green-400" : "text-red-400"
          }`}>
            {message}
          </p>
        )}

        {/* Submit Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-6">
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full block text-center py-3 rounded-lg font-semibold text-lg bg-indigo-600 text-white shadow-lg transition"
          >
            REGISTER
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
