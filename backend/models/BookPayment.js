const mongoose = require('mongoose');

const bookPaymentSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'pending',
    },

    paymentDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookPaymentSchema.index(
  {
    bookId: 1,
    studentId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  'BookPayment',
  bookPaymentSchema
);