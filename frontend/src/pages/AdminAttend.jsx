import React, { useEffect, useState } from "react";

export default function AdminPunches() {
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fetchPunches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/admin/punches-today", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error("Error fetching punches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPunches();
    const interval = setInterval(fetchPunches, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "-";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const filtered = records.filter(
    (u) =>
      u.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Download CSV for a single user
  const downloadUserCSV = async (userId, userName) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/admin/user-punches/${userId}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch user punches");
      const data = await res.json();

      const headers = ["Date", "Punch In", "Punch Out", "Total Time"];
      const rows = data.map((rec) => [
        new Date(rec.punchInTime).toLocaleDateString(),
        rec.punchInTime ? new Date(rec.punchInTime).toLocaleTimeString() : "-",
        rec.punchOutTime ? new Date(rec.punchOutTime).toLocaleTimeString() : "-",
        formatDuration(rec.totalTime),
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `attendance_${userName}_last_30_days.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading CSV:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <span>🕒</span>
            <span>Today's Punch Records</span>
          </h1>
          <p className="text-gray-400 mt-1">📅 {formattedDate}</p>
        </div>

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-3 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 
                     placeholder-gray-400 text-white focus:ring-2 focus:ring-purple-400 outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg">
        {loading ? (
          <div className="text-center py-6 text-gray-400">Loading...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-white/10 text-gray-300 text-left">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Punch In</th>
                <th className="px-4 py-3">Punch Out</th>
                <th className="px-4 py-3">Total Time</th>
                <th className="px-4 py-3">Download</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((rec, idx) => {
                  const { user, punchInTime, punchOutTime, totalTime } = rec;
                  return (
                    <tr
                      key={idx}
                      className={`border-t border-white/10 text-gray-200 transition ${
                        !punchInTime ? "bg-gray-800/40" : "hover:bg-white/10"
                      }`}
                    >
                      <td className="px-4 py-3">{user?.name || "-"}</td>
                      <td className="px-4 py-3">{user?.email || "-"}</td>
                      <td className="px-4 py-3">{punchInTime ? new Date(punchInTime).toLocaleTimeString() : "-"}</td>
                      <td className="px-4 py-3">{punchOutTime ? new Date(punchOutTime).toLocaleTimeString() : "-"}</td>
                      <td className="px-4 py-3">{formatDuration(totalTime)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => downloadUserCSV(user._id, user.name)}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs"
                        >
                          📥 Download Attendence
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-400">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
