// backend/controllers/attendanceController.js

const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Group = require("../models/Group");
const Session = require("../models/Session");
const Payment = require("../models/Payment");


// ======================================================
// UTILITAIRE : appliquer un paiement à une présence
// ======================================================

const assignPaymentToAttendance = async (attendance) => {
  const payment = await Payment.findOne({
    studentId: attendance.studentId,
    groupId: attendance.groupId,
    status: "paid",
    sessionsCovered: { $lt: 4 },
  }).sort({
    paymentDate: 1,
    createdAt: 1,
  });

  if (!payment) {
    return null;
  }

  attendance.paymentId = payment._id;
  await attendance.save();

  payment.sessionsCovered += 1;
  await payment.save();

  return payment;
};


// ======================================================
// UTILITAIRE : libérer une présence d'un paiement
// ======================================================

const releasePaymentFromAttendance = async (attendance) => {
  if (!attendance.paymentId) {
    return;
  }

  const payment = await Payment.findById(attendance.paymentId);

  if (payment) {
    payment.sessionsCovered = Math.max(
      0,
      payment.sessionsCovered - 1
    );

    await payment.save();
  }

  attendance.paymentId = null;
  await attendance.save();
};


// ======================================================
// GET : toutes les présences
// ======================================================

const getAttendances = async (req, res) => {
  try {
    const attendances = await Attendance.find()
      .populate("studentId", "firstName lastName phone")
      .populate("groupId", "name level price")
      .populate("sessionId", "date content")
      .populate("paymentId", "amount status sessionsCovered paymentDate")
      .sort({ createdAt: -1 });

    res.json(attendances);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la récupération des présences",
    });
  }
};


// ======================================================
// GET : une présence
// ======================================================

const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate("studentId", "firstName lastName phone")
      .populate("groupId", "name level price")
      .populate("sessionId", "date content")
      .populate("paymentId", "amount status sessionsCovered paymentDate");

    if (!attendance) {
      return res.status(404).json({
        message: "Présence introuvable",
      });
    }

    res.json(attendance);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la récupération de la présence",
    });
  }
};


// ======================================================
// POST : créer une présence
// ======================================================

const createAttendance = async (req, res) => {
  try {
    const {
      studentId,
      groupId,
      sessionId,
      status,
    } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!studentId || !groupId || !sessionId || !status) {
      return res.status(400).json({
        message:
          "studentId, groupId, sessionId et status sont obligatoires",
      });
    }

    if (!["present", "absent"].includes(status)) {
      return res.status(400).json({
        message: "Le statut doit être present ou absent",
      });
    }

    // -----------------------------
    // Vérifier élève
    // -----------------------------

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Élève introuvable",
      });
    }

    // -----------------------------
    // Vérifier groupe
    // -----------------------------

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Groupe introuvable",
      });
    }

    // Vérifier que l'élève appartient au groupe
    if (student.groupId.toString() !== groupId.toString()) {
      return res.status(400).json({
        message:
          "Cet élève n'appartient pas à ce groupe",
      });
    }

    // -----------------------------
    // Vérifier séance
    // -----------------------------

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Séance introuvable",
      });
    }

    // Vérifier que la séance appartient au groupe
    if (session.groupId.toString() !== groupId.toString()) {
      return res.status(400).json({
        message:
          "Cette séance n'appartient pas à ce groupe",
      });
    }

    // -----------------------------
    // Vérifier doublon
    // -----------------------------

    const existingAttendance = await Attendance.findOne({
      studentId,
      sessionId,
    });

    if (existingAttendance) {
      return res.status(400).json({
        message:
          "La présence de cet élève pour cette séance existe déjà",
      });
    }

    // -----------------------------
    // Créer présence
    // -----------------------------

    const attendance = await Attendance.create({
      studentId,
      groupId,
      sessionId,
      status,
      paymentId: null,
    });

    // -----------------------------
    // Si présent :
    // chercher un paiement actif
    // -----------------------------

    if (status === "present") {
      await assignPaymentToAttendance(attendance);
    }

    const result = await Attendance.findById(attendance._id)
      .populate("studentId", "firstName lastName phone")
      .populate("groupId", "name level price")
      .populate("sessionId", "date content")
      .populate("paymentId", "amount status sessionsCovered paymentDate");

    res.status(201).json(result);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la création de la présence",
    });
  }
};


// ======================================================
// PUT : modifier une présence
// ======================================================

const updateAttendance = async (req, res) => {
  try {
    const {
      studentId,
      groupId,
      sessionId,
      status,
    } = req.body;

    const attendance = await Attendance.findById(
      req.params.id
    );

    if (!attendance) {
      return res.status(404).json({
        message: "Présence introuvable",
      });
    }

    // -----------------------------
    // Validation
    // -----------------------------

    if (
      !studentId ||
      !groupId ||
      !sessionId ||
      !status
    ) {
      return res.status(400).json({
        message:
          "studentId, groupId, sessionId et status sont obligatoires",
      });
    }

    if (!["present", "absent"].includes(status)) {
      return res.status(400).json({
        message: "Le statut doit être present ou absent",
      });
    }

    // -----------------------------
    // Vérifier élève
    // -----------------------------

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Élève introuvable",
      });
    }

    // -----------------------------
    // Vérifier groupe
    // -----------------------------

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Groupe introuvable",
      });
    }

    // -----------------------------
    // Vérifier séance
    // -----------------------------

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Séance introuvable",
      });
    }

    // -----------------------------
    // Libérer ancien paiement
    // uniquement si nécessaire
    // -----------------------------

    const oldStatus = attendance.status;
    const oldPaymentId = attendance.paymentId;

    if (
      oldPaymentId &&
      (
        status === "absent" ||
        studentId.toString() !== attendance.studentId.toString() ||
        groupId.toString() !== attendance.groupId.toString() ||
        sessionId.toString() !== attendance.sessionId.toString()
      )
    ) {
      await releasePaymentFromAttendance(attendance);
    }

    // -----------------------------
    // Mettre à jour
    // -----------------------------

    attendance.studentId = studentId;
    attendance.groupId = groupId;
    attendance.sessionId = sessionId;
    attendance.status = status;

    // Si absent => aucun paiement
    if (status === "absent") {
      attendance.paymentId = null;
      await attendance.save();
    }

    // -----------------------------
    // Si présent :
    // conserver le paiement existant
    // ou chercher un paiement actif
    // -----------------------------

    if (status === "present") {
      await attendance.save();

      if (!attendance.paymentId) {
        await assignPaymentToAttendance(attendance);
      }
    }

    const result = await Attendance.findById(
      attendance._id
    )
      .populate("studentId", "firstName lastName phone")
      .populate("groupId", "name level price")
      .populate("sessionId", "date content")
      .populate("paymentId", "amount status sessionsCovered paymentDate");

    res.json(result);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la modification de la présence",
    });
  }
};


// ======================================================
// DELETE : supprimer une présence
// ======================================================

const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(
      req.params.id
    );

    if (!attendance) {
      return res.status(404).json({
        message: "Présence introuvable",
      });
    }

    // -----------------------------
    // Libérer le paiement
    // -----------------------------

    if (attendance.paymentId) {
      await releasePaymentFromAttendance(attendance);
    }

    // -----------------------------
    // Supprimer présence
    // -----------------------------

    await Attendance.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Présence supprimée avec succès",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la suppression de la présence",
    });
  }
};


module.exports = {
  getAttendances,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
};