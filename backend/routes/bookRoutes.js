const express = require('express');

const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');

const router = express.Router();

router.get('/', getBooks);

router.get('/:id', getBook);

router.post('/', createBook);

router.put('/:id', updateBook);

router.delete('/:id', deleteBook);

module.exports = router;