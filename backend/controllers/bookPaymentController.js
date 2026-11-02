const BookPayment = require('../models/BookPayment');
const Book = require('../models/Book');
const Student = require('../models/Student');

// ==========================================
// GET STUDENTS + PAYMENTS FOR ONE BOOK
// ==========================================

const getBookPayments = async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!bookId) {
      return res.status(400).json({
        message: 'ID du livre manquant',
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: 'Livre introuvable',
      });
    }

    // Tous les élèves
    const students = await Student.find()
      .populate('groupId', 'name level')
      .sort({
        firstName: 1,
        lastName: 1,
      });

    // Paiements de ce livre
    const payments = await BookPayment.find({
      bookId,
    }).populate(
      'studentId',
      'firstName lastName phone groupId'
    );

    // Créer une map des paiements
    const paymentMap = {};

    payments.forEach((payment) => {
      const studentId =
        payment.studentId?._id?.toString();

      if (studentId) {
        paymentMap[studentId] = payment;
      }
    });

    // Fusionner élèves + paiement
    const studentsWithPayment = students.map(
      (student) => {
        const payment =
          paymentMap[student._id.toString()];

        return {
          student,
          payment: payment || null,

          paid: Boolean(
            payment &&
            payment.status === 'paid'
          ),
        };
      }
    );

    res.json({
      book,
      students: studentsWithPayment,
    });
  } catch (error) {
    console.error(
      'Erreur getBookPayments:',
      error
    );

    res.status(500).json({
      message:
        'Erreur lors du chargement des paiements',
      error: error.message,
    });
  }
};

// ==========================================
// CREATE BOOK PAYMENT
// ==========================================

const createBookPayment = async (req, res) => {
  try {
    const {
      bookId,
      studentId,
      amount,
      paymentDate,
    } = req.body;

    if (!bookId || !studentId) {
      return res.status(400).json({
        message:
          'Le livre et l’élève sont obligatoires',
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: 'Livre introuvable',
      });
    }

    const student =
      await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: 'Élève introuvable',
      });
    }

    const existingPayment =
      await BookPayment.findOne({
        bookId,
        studentId,
      });

    if (existingPayment) {
      return res.status(400).json({
        message:
          'Cet élève a déjà un paiement pour ce livre',
      });
    }

    const payment =
      await BookPayment.create({
        bookId,
        studentId,

        amount:
          amount !== undefined &&
          amount !== ''
            ? Number(amount)
            : Number(book.price),

        status: 'paid',

        paymentDate:
          paymentDate || new Date(),
      });

    const result =
      await BookPayment.findById(
        payment._id
      )
        .populate(
          'studentId',
          'firstName lastName phone groupId'
        )
        .populate(
          'bookId',
          'name price'
        );

    res.status(201).json(result);
  } catch (error) {
    console.error(
      'Erreur createBookPayment:',
      error
    );

    res.status(500).json({
      message:
        'Erreur lors de l’enregistrement du paiement',
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE BOOK PAYMENT
// ==========================================

const updateBookPayment = async (
  req,
  res
) => {
  try {
    const {
      amount,
      status,
      paymentDate,
    } = req.body;

    const updateData = {};

    if (
      amount !== undefined &&
      amount !== ''
    ) {
      updateData.amount =
        Number(amount);
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (paymentDate !== undefined) {
      updateData.paymentDate =
        paymentDate || null;
    }

    const payment =
      await BookPayment.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          'studentId',
          'firstName lastName phone groupId'
        )
        .populate(
          'bookId',
          'name price'
        );

    if (!payment) {
      return res.status(404).json({
        message: 'Paiement introuvable',
      });
    }

    res.json(payment);
  } catch (error) {
    console.error(
      'Erreur updateBookPayment:',
      error
    );

    res.status(500).json({
      message:
        'Erreur lors de la modification du paiement',
      error: error.message,
    });
  }
};

// ==========================================
// DELETE BOOK PAYMENT
// ==========================================

const deleteBookPayment = async (
  req,
  res
) => {
  try {
    const payment =
      await BookPayment.findByIdAndDelete(
        req.params.id
      );

    if (!payment) {
      return res.status(404).json({
        message: 'Paiement introuvable',
      });
    }

    res.json({
      message:
        'Paiement supprimé avec succès',
    });
  } catch (error) {
    console.error(
      'Erreur deleteBookPayment:',
      error
    );

    res.status(500).json({
      message:
        'Erreur lors de la suppression du paiement',
    });
  }
};

module.exports = {
  getBookPayments,
  createBookPayment,
  updateBookPayment,
  deleteBookPayment,
};