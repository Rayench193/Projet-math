const Student = require("../models/Student");
const Group = require("../models/Group");

// ==========================================
// GET /api/students
// Récupérer tous les élèves
// ==========================================
const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("groupId", "name level price")
      .sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (error) {
    console.error("Erreur getStudents :", error);

    res.status(500).json({
      message: "Erreur lors de la récupération des élèves",
    });
  }
};

// ==========================================
// GET /api/students/:id
// Récupérer un élève
// ==========================================
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("groupId", "name level price");

    if (!student) {
      return res.status(404).json({
        message: "Élève introuvable",
      });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Erreur getStudentById :", error);

    res.status(400).json({
      message: "ID de l'élève invalide",
    });
  }
};

// ==========================================
// POST /api/students
// Créer un élève
// ==========================================
const createStudent = async (req, res) => {
  try {
    const { firstName, lastName, phone, groupId } = req.body;

    if (!firstName || !lastName || !phone || !groupId) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires",
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Le groupe sélectionné n'existe pas",
      });
    }

    const student = await Student.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      groupId,
    });

    const populatedStudent = await Student.findById(student._id)
      .populate("groupId", "name level price");

    res.status(201).json({
      message: "Élève créé avec succès",
      student: populatedStudent,
    });
  } catch (error) {
    console.error("Erreur createStudent :", error);

    res.status(400).json({
      message: "Erreur lors de la création de l'élève",
    });
  }
};

// ==========================================
// PUT /api/students/:id
// Modifier un élève
// ==========================================
const updateStudent = async (req, res) => {
  try {
    const { firstName, lastName, phone, groupId } = req.body;

    if (groupId) {
      const group = await Group.findById(groupId);

      if (!group) {
        return res.status(404).json({
          message: "Le groupe sélectionné n'existe pas",
        });
      }
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        ...(firstName !== undefined && {
          firstName: firstName.trim(),
        }),
        ...(lastName !== undefined && {
          lastName: lastName.trim(),
        }),
        ...(phone !== undefined && {
          phone: phone.trim(),
        }),
        ...(groupId !== undefined && {
          groupId,
        }),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("groupId", "name level price");

    if (!student) {
      return res.status(404).json({
        message: "Élève introuvable",
      });
    }

    res.status(200).json({
      message: "Élève modifié avec succès",
      student,
    });
  } catch (error) {
    console.error("Erreur updateStudent :", error);

    res.status(400).json({
      message: "Impossible de modifier l'élève",
    });
  }
};
// ==========================================
// DELETE /api/students/:id
// Supprimer un élève
// ==========================================
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Élève introuvable",
      });
    }

    await student.deleteOne();

    res.status(200).json({
      message: "Élève supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur deleteStudent :", error);

    res.status(400).json({
      message: "Impossible de supprimer l'élève",
    });
  }
};
// ==========================================
// EXPORT
// ==========================================
module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};