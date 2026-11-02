const express = require("express");

const {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} = require("../controllers/paymentController");

const router = express.Router();

router.get("/", getPayments);

router.post("/", createPayment);

router.put("/:id", updatePayment);

router.delete("/:id", deletePayment);

module.exports = router;