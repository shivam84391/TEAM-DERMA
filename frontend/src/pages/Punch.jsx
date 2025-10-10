import React, { useState, useEffect, useRef } from "react";

export default function UserPunch() {
  const token = localStorage.getItem("token");
  const [punch, setPunch] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const intervalRef = useRef(null);

  // Fetch active punch for current user
  const fetchPunch = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/users/my-punch", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.punch) {
        setPunch(data.punch);
        setIsOnBreak(!!data.punch.breakStartTime && !data.punch.breakEndTime);
        const startTime = new Date(data.punch.punchInTime).getTime();
        const endTime = data.punch.punchOutTime
          ? new Date(data.punch.punchOutTime).getTime()
          : Date.now();
        setElapsed(Math.floor((endTime - startTime) / 1000));
      } else {
        setPunch(null);
        setElapsed(0);
        setIsOnBreak(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPunch();
  }, []);

  // Live timer only for current user’s active punch
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (punch && !punch.punchOutTime && !isOnBreak) {
      intervalRef.current = setInterval(() => {
        const startTime = new Date(punch.punchInTime).getTime();
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [punch, isOnBreak]);

  const handlePunchIn = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/users/punch-in", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPunch(data.punch);
        setIsOnBreak(false);
        setElapsed(0);
      } else alert(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePunchOut = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/users/punch-out", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPunch(data.punch);
        const startTime = new Date(data.punch.punchInTime).getTime();
        const endTime = new Date(data.punch.punchOutTime).getTime();
        setElapsed(Math.floor((endTime - startTime) / 1000));
        setIsOnBreak(false);
      } else alert(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBreak = async () => {
    if (!punch) return;
    try {
      const url = isOnBreak
        ? "http://localhost:4000/api/users/end-break"
        : "http://localhost:4000/api/users/start-break";
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setIsOnBreak(!isOnBreak);
      else alert(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}h ${m
      .toString()
      .padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#141e30] to-[#243b55] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🕒 Punch Machine</h1>

      {!punch || punch.punchOutTime ? (
        <button
          onClick={handlePunchIn}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-lg font-semibold"
        >
          Punch In
        </button>
      ) : (
        <div className="bg-white/10 p-6 rounded-2xl shadow-lg text-center space-y-4">
          <div>
            <p className="text-lg font-semibold">Elapsed Time:</p>
            <p className="text-2xl">{formatTime(elapsed)}</p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={toggleBreak}
              className={`px-5 py-2 rounded-lg font-semibold ${
                isOnBreak ? "bg-yellow-500" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isOnBreak ? "End Break" : "Start Break"}
            </button>
            <button
              onClick={handlePunchOut}
              className="px-5 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700"
            >
              Punch Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
