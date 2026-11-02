const express = require('express');

const {
  getBookPayments,
  createBookPayment,
  updateBookPayment,
  deleteBookPayment,
} = require('../controllers/bookPaymentController');

const router = express.Router();

// Tous les élèves + paiements d'un livre
router.get(
  '/book/:bookId',
  getBookPayments
);

// Ajouter un paiement
router.post(
  '/',
  createBookPayment
);

// Modifier un paiement
router.put(
  '/:id',
  updateBookPayment
);

// Supprimer un paiement
router.delete(
  '/:id',
  deleteBookPayment
);

module.exports = router;