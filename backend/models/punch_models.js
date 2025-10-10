import mongoose from "mongoose";

const punchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    punchInTime: Date,
    punchOutTime: Date,
    breakStartTime: Date,
    breakEndTime: Date,
    status: {
      type: String,
      enum: ["Active", "Completed", "Forced Logout"],
      default: "Active",
    },
    breakStatus: {
      type: String,
      enum: ["Normal", "Exceeded", null],
      default: null,
    },
    adminApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Punch", punchSchema);
