  const mongoose = require("mongoose");

  const studentSchema = new mongoose.Schema(
    {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

  module.exports = mongoose.model("Student", studentSchema);