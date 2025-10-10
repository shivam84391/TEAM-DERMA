import Punch from "../models/punch_models.js";
import User from "../models/user_models.js";

// -------------------------
// USER CONTROLLERS
// -------------------------

// ✅ Punch In
export const punchIn = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming JWT middleware adds user info
    const existingPunch = await Punch.findOne({ userId, punchOutTime: null });

    if (existingPunch) {
      return res.status(400).json({ message: "You are already punched in!" });
    }

    const newPunch = await Punch.create({
      userId,
      punchInTime: new Date(),
      status: "Active",
    });

    res.status(201).json({ message: "Punched in successfully", punch: newPunch });
  } catch (error) {
    res.status(500).json({ message: "Error punching in", error: error.message });
  }
};

// ✅ Punch Out
export const punchOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const punch = await Punch.findOne({ userId, punchOutTime: null });

    if (!punch) {
      return res.status(400).json({ message: "You are not punched in!" });
    }

    punch.punchOutTime = new Date();

    // Calculate total time (in hours)
    const totalTime = (punch.punchOutTime - punch.punchInTime) / (1000 * 60 * 60);

    // Auto detect if forced logout (less than 7 hours)
    if (totalTime < 7) {
      punch.status = "Forced Logout";
    } else {
      punch.status = "Completed";
    }

    await punch.save();
    res.status(200).json({ message: "Punched out successfully", punch });
  } catch (error) {
    res.status(500).json({ message: "Error punching out", error: error.message });
  }
};

// ✅ Start Break
export const startBreak = async (req, res) => {
  try {
    const userId = req.user._id;
    const punch = await Punch.findOne({ userId, punchOutTime: null });

    if (!punch) {
      return res.status(400).json({ message: "Punch in first before break!" });
    }

    if (punch.breakStartTime) {
      return res.status(400).json({ message: "Break already started!" });
    }

    punch.breakStartTime = new Date();
    await punch.save();

    res.status(200).json({ message: "Break started", punch });
  } catch (error) {
    res.status(500).json({ message: "Error starting break", error: error.message });
  }
};

// ✅ End Break
export const endBreak = async (req, res) => {
  try {
    const userId = req.user._id;
    const punch = await Punch.findOne({ userId, punchOutTime: null });

    if (!punch || !punch.breakStartTime) {
      return res.status(400).json({ message: "No active break found!" });
    }

    punch.breakEndTime = new Date();

    // Calculate break duration (minutes)
    const breakDuration = (punch.breakEndTime - punch.breakStartTime) / (1000 * 60);
    if (breakDuration > 60) {
      punch.breakStatus = "Exceeded";
    } else {
      punch.breakStatus = "Normal";
    }

    await punch.save();
    res.status(200).json({ message: "Break ended", punch });
  } catch (error) {
    res.status(500).json({ message: "Error ending break", error: error.message });
  }
};
