/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; // ✅ import context

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setUser } = useUser(); // ✅ context setter

  // handle login for both user/admin
  const handleLogin = async (role) => {
    setError("");

    try {
      const response = await fetch("http://localhost:4000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      // ✅ Save in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ email: data.email, role: data.role })
      );

      // ✅ Refresh UserContext from localStorage
      const savedUser = JSON.parse(localStorage.getItem("user"));
      console.log("Saved user from localStorage:", savedUser);
      setUser(savedUser);

      // ✅ navigate based on role
      if (role === "user") {
        navigate("/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
      {/* background circles */}
      <motion.div
        className="absolute w-72 h-72 bg-indigo-600/30 rounded-full blur-3xl top-10 left-10"
        animate={{ x: [0, 30, -30, 0], y: [0, 20, -20, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl bottom-10 right-10"
        animate={{ x: [0, -40, 40, 0], y: [0, -20, 20, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
      />

      {/* card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
        >
          {/* header */}
          <div className="p-6 text-center border-b border-gray-700">
             <div className="p-3 text-center">
  <img
    src="public\logos.png"
    alt="ZENTRASense Logo"
    className="max-h-32 w-auto object-contain scale-110"
  />
</div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-gray-400 mt-2"
            >
              Login to continue your journey 🚀
            </motion.p>
          </div>

          {/* form */}
          <div className="p-6">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="email"
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 outline-none transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setpassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 outline-none transition"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}

              {/* Buttons */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  type="button"
                  onClick={() => handleLogin("user")}
                  className="w-full block text-center py-3 rounded-lg font-semibold text-lg bg-indigo-600 text-white shadow-lg transition"
                >
                  SIGN IN AS USER
                </button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  type="button"
                  onClick={() => handleLogin("admin")}
                  className="w-full block text-center py-3 rounded-lg font-semibold text-lg bg-yellow-600 text-white shadow-lg transition"
                >
                  SIGN IN AS ADMIN
                </button>
              </motion.div>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center space-y-2">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-400"
              >
                Don’t have an account?{" "}
                <a
                  href="#"
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Register
                </a>
              </motion.p>
              <motion.a
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                href="#"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Forgot password?
              </motion.a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
