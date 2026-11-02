const Payment = require("../models/Payment");
const Attendance = require("../models/Attendance");
const Group = require("../models/Group");
const Student = require("../models/Student");

// ==========================================
// GET — Tous les paiements
// ==========================================

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("studentId", "firstName lastName phone")
      .populate("groupId", "name level price")
      .sort({ paymentDate: -1, createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements",
      error: error.message,
    });
  }
};


// ==========================================
// POST — Créer un paiement
// ==========================================

const createPayment = async (req, res) => {
  try {
    const {
      studentId,
      groupId,
      amount,
      status,
      paymentDate,
    } = req.body;


    // --------------------------------------
    // Vérification
    // --------------------------------------

    if (!studentId || !groupId || amount === undefined) {
      return res.status(400).json({
        message: "studentId, groupId et amount sont obligatoires",
      });
    }


    // --------------------------------------
    // Vérifier l'élève
    // --------------------------------------

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Élève introuvable",
      });
    }


    // --------------------------------------
    // Vérifier le groupe
    // --------------------------------------

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Groupe introuvable",
      });
    }


    // --------------------------------------
    // Vérifier que l'élève appartient
    // au groupe
    // --------------------------------------

    if (String(student.groupId) !== String(groupId)) {
      return res.status(400).json({
        message: "L'élève n'appartient pas à ce groupe.",
      });
    }


    // --------------------------------------
    // Le montant doit être celui du groupe
    // --------------------------------------

    if (Number(amount) !== Number(group.price)) {
      return res.status(400).json({
        message:
          `Le montant doit être égal au prix du groupe : ${group.price} DT`,
      });
    }


    // --------------------------------------
    // Vérifier s'il existe déjà un cycle
    // encore actif
    // --------------------------------------

    const activePayment = await Payment.findOne({
      studentId,
      groupId,
      status: "paid",
      $expr: {
        $lt: ["$sessionsCovered", "$sessionsLimit"],
      },
    });


    if (activePayment) {
      return res.status(400).json({
        message:
          "Un cycle de paiement est déjà en cours pour cet élève.",
        sessionsCovered: activePayment.sessionsCovered,
        sessionsRemaining:
          activePayment.sessionsLimit -
          activePayment.sessionsCovered,
      });
    }


    // --------------------------------------
    // Créer le paiement
    // --------------------------------------

    const payment = await Payment.create({
      studentId,
      groupId,
      amount,
      sessionsCovered: 0,
      sessionsLimit: 4,
      status: status || "paid",
      paymentDate: paymentDate || new Date(),
    });


    // --------------------------------------
    // Chercher les présences déjà effectuées
    // mais non encore payées
    // --------------------------------------

    const unpaidAttendances = await Attendance.find({
      studentId,
      groupId,
      status: "present",
      paymentId: null,
    }).populate("sessionId", "date content");


    // Trier par date de séance
    unpaidAttendances.sort((a, b) => {
      const dateA = new Date(a.sessionId?.date || a.createdAt);
      const dateB = new Date(b.sessionId?.date || b.createdAt);

      return dateA - dateB;
    });


    // --------------------------------------
    // Le paiement peut couvrir maximum
    // 4 présences
    // --------------------------------------

    const attendancesToPay =
      unpaidAttendances.slice(0, 4);


    // --------------------------------------
    // Associer les présences au paiement
    // --------------------------------------

    for (const attendance of attendancesToPay) {
      attendance.paymentId = payment._id;

      await attendance.save();
    }


    // --------------------------------------
    // Nombre de séances déjà couvertes
    // --------------------------------------

    payment.sessionsCovered =
      attendancesToPay.length;

    await payment.save();


    // --------------------------------------
    // Retour
    // --------------------------------------

    const result = await payment.populate([
      {
        path: "studentId",
        select: "firstName lastName phone",
      },
      {
        path: "groupId",
        select: "name level price",
      },
    ]);


    res.status(201).json(result);

  } catch (error) {
    console.error("Erreur createPayment :", error);

    res.status(500).json({
      message: "Erreur lors de la création du paiement",
      error: error.message,
    });
  }
};


// ==========================================
// PUT — Modifier un paiement
// ==========================================

const updatePayment = async (req, res) => {
  try {
    const {
      studentId,
      groupId,
      amount,
      status,
      paymentDate,
    } = req.body;


    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Paiement introuvable",
      });
    }


    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Groupe introuvable",
      });
    }


    if (Number(amount) !== Number(group.price)) {
      return res.status(400).json({
        message:
          `Le montant doit être égal au prix du groupe : ${group.price} DT`,
      });
    }


    // --------------------------------------
    // Libérer les anciennes présences
    // --------------------------------------

    await Attendance.updateMany(
      {
        paymentId: payment._id,
      },
      {
        $set: {
          paymentId: null,
        },
      }
    );


    // --------------------------------------
    // Modifier le paiement
    // --------------------------------------

    payment.studentId = studentId;
    payment.groupId = groupId;
    payment.amount = amount;
    payment.status = status || "paid";
    payment.paymentDate =
      paymentDate || payment.paymentDate;
    payment.sessionsCovered = 0;
    payment.sessionsLimit = 4;


    await payment.save();


    // --------------------------------------
    // Réattribuer les présences
    // --------------------------------------

    if (payment.status === "paid") {

      const unpaidAttendances = await Attendance.find({
        studentId,
        groupId,
        status: "present",
        paymentId: null,
      }).populate("sessionId", "date content");


      unpaidAttendances.sort((a, b) => {
        const dateA = new Date(
          a.sessionId?.date || a.createdAt
        );

        const dateB = new Date(
          b.sessionId?.date || b.createdAt
        );

        return dateA - dateB;
      });


      const attendancesToPay =
        unpaidAttendances.slice(0, 4);


      for (const attendance of attendancesToPay) {
        attendance.paymentId = payment._id;

        await attendance.save();
      }


      payment.sessionsCovered =
        attendancesToPay.length;

      await payment.save();
    }


    const result = await payment.populate([
      {
        path: "studentId",
        select: "firstName lastName phone",
      },
      {
        path: "groupId",
        select: "name level price",
      },
    ]);


    res.json(result);

  } catch (error) {
    console.error("Erreur updatePayment :", error);

    res.status(500).json({
      message: "Erreur lors de la modification du paiement",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE — Supprimer un paiement
// ==========================================

const deletePayment = async (req, res) => {
  try {

    const payment = await Payment.findById(
      req.params.id
    );

    if (!payment) {
      return res.status(404).json({
        message: "Paiement introuvable",
      });
    }


    // Les présences redeviennent non payées
    await Attendance.updateMany(
      {
        paymentId: payment._id,
      },
      {
        $set: {
          paymentId: null,
        },
      }
    );


    await Payment.findByIdAndDelete(
      req.params.id
    );


    res.json({
      message: "Paiement supprimé avec succès",
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression du paiement",
      error: error.message,
    });
  }
};


module.exports = {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
};