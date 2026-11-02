const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  { studentId: 1, sessionId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);