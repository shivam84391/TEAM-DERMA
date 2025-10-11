import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_URL = import.meta.env.VITE_API_URL;

export default function UserPunch() {
  const token = localStorage.getItem("token");
  const [punch, setPunch] = useState(null);
  const [canPunch, setCanPunch] = useState(true);
  const [lastPunchTime, setLastPunchTime] = useState(null);
  const [nextPunchTime, setNextPunchTime] = useState(null);

  // Fetch today's or last punch
  const fetchPunch = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/my-punch`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.punch) {
        setPunch(data.punch);

        const last = new Date(data.punch.punchInTime);
        setLastPunchTime(last.toLocaleTimeString());

        const now = new Date();
        const isSameDay =
          last.getDate() === now.getDate() &&
          last.getMonth() === now.getMonth() &&
          last.getFullYear() === now.getFullYear();

        if (isSameDay) {
          setCanPunch(false);

          // next available = midnight of next day
          const next = new Date(last);
          next.setDate(next.getDate() + 1);
          next.setHours(0, 0, 0, 0);
          setNextPunchTime(next.toLocaleString());
        } else {
          setCanPunch(true);
        }
      } else {
        setPunch(null);
        setCanPunch(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch punch details.");
    }
  };

  useEffect(() => {
    fetchPunch();
  }, []);

  const handlePunchIn = async () => {
    if (!canPunch) {
      toast.warning("⚠️ You can only punch in once per day!", {
        position: "bottom-right",
      });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/users/punch-in`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setPunch(data.punch);
        setCanPunch(false);
        setLastPunchTime(new Date(data.punch.punchInTime).toLocaleTimeString());
        toast.success("✅ Punch In successful!");
      } else {
        toast.warning(data.message || "⚠️ Something went wrong while punching in!", {
          position: "bottom-right",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to punch in. Please try again later.");
    }
  };

  const handlePunchOut = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/punch-out`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setPunch(data.punch);
        toast.info("👋 You punched out successfully!");
      } else {
        toast.warning(data.message || "⚠️ Unable to punch out!", {
          position: "bottom-right",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to punch out. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🕒 Punch Machine</h1>

      {!punch || punch.punchOutTime ? (
        <button
          onClick={handlePunchIn}
          disabled={!canPunch}
          className={`px-6 py-2 rounded-lg text-lg font-semibold transition-all duration-200 ${
            canPunch
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          Punch In
        </button>
      ) : (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center space-y-4">
          <p>
            ✅ Punched In at:{" "}
            <span className="text-green-400 font-semibold">
              {new Date(punch.punchInTime).toLocaleTimeString()}
            </span>
          </p>
          <button
            onClick={handlePunchOut}
            className="px-5 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 transition-all duration-200"
          >
            Punch Out
          </button>
        </div>
      )}

      {!canPunch && punch && punch.punchOutTime && (
        <div className="mt-6 text-center space-y-2">
          <p className="text-yellow-400">
            🕓 You last punched in at{" "}
            <span className="font-semibold text-white">{lastPunchTime}</span>.
          </p>
          <p className="text-gray-300 text-sm">
            You can punch in again after midnight:{" "}
            <span className="text-blue-400 font-medium">{nextPunchTime}</span>
          </p>
        </div>
      )}

      {/* Toast container for all notifications */}
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}
