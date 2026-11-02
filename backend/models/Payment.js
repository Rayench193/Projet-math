const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
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

    // Montant payé
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Nombre de séances présentes couvertes par ce paiement
    sessionsCovered: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },

    // Un paiement couvre au maximum 4 présences
    sessionsLimit: {
      type: Number,
      default: 4,
    },

    status: {
      type: String,
      enum: ["paid", "pending"],
      default: "paid",
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);