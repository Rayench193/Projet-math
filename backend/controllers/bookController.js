const Book = require('../models/Book');

// ==========================================
// GET ALL BOOKS
// ==========================================

const getBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    console.error('Erreur getBooks:', error);

    res.status(500).json({
      message: 'Erreur lors du chargement des livres',
    });
  }
};

// ==========================================
// GET ONE BOOK
// ==========================================

const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: 'Livre introuvable',
      });
    }

    res.json(book);
  } catch (error) {
    console.error('Erreur getBook:', error);

    res.status(500).json({
      message: 'Erreur lors du chargement du livre',
    });
  }
};

// ==========================================
// CREATE BOOK
// ==========================================

const createBook = async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined || price === '') {
      return res.status(400).json({
        message: 'Le nom et le prix sont obligatoires',
      });
    }

    const book = await Book.create({
      name,
      price: Number(price),
    });

    res.status(201).json(book);
  } catch (error) {
    console.error('Erreur createBook:', error);

    res.status(500).json({
      message: 'Erreur lors de la création du livre',
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE BOOK
// ==========================================

const updateBook = async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined || price === '') {
      return res.status(400).json({
        message: 'Le nom et le prix sont obligatoires',
      });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price: Number(price),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!book) {
      return res.status(404).json({
        message: 'Livre introuvable',
      });
    }

    res.json(book);
  } catch (error) {
    console.error('Erreur updateBook:', error);

    res.status(500).json({
      message: 'Erreur lors de la modification du livre',
      error: error.message,
    });
  }
};

// ==========================================
// DELETE BOOK
// ==========================================

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: 'Livre introuvable',
      });
    }

    res.json({
      message: 'Livre supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur deleteBook:', error);

    res.status(500).json({
      message: 'Erreur lors de la suppression du livre',
    });
  }
};

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
};