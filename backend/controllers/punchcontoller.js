import Punch from "../models/punch_models.js";
import User from "../models/user_models.js";

// -------------------------
// USER CONTROLLERS
// -------------------------

// ✅ Punch In (Once per calendar day)
export const punchIn = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check for active punch
    const existingPunch = await Punch.findOne({ userId, punchOutTime: null });
    if (existingPunch) {
      return res.status(400).json({ message: "You are already punched in!" });
    }

    // Find last punch (latest punchInTime)
    const lastPunch = await Punch.findOne({ userId }).sort({ punchInTime: -1 });

    if (lastPunch) {
      const lastPunchDate = new Date(lastPunch.punchInTime);
      const today = new Date();

      // Check if both dates are same (same calendar day)
      const isSameDay =
        lastPunchDate.getDate() === today.getDate() &&
        lastPunchDate.getMonth() === today.getMonth() &&
        lastPunchDate.getFullYear() === today.getFullYear();

      if (isSameDay) {
        return res.status(400).json({
          message: "You have already punched in today. Try again tomorrow.",
        });
      }
    }

    // Create new punch
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
