const Group = require("../models/Group");
const Student = require("../models/Student");

// GET - Récupérer tous les groupes
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des groupes",
      error: error.message,
    });
  }
};

// GET - Récupérer un groupe par son ID
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        message: "Groupe introuvable",
      });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du groupe",
      error: error.message,
    });
  }
};

// POST - Créer un groupe
const createGroup = async (req, res) => {
  try {
    const {
      name,
      level,
      price,
      startDate,
    } = req.body;

    if (
      !name ||
      !level ||
      price === undefined ||
      !startDate
    ) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires",
      });
    }

    const group = await Group.create({
      name,
      level,
      price,
      startDate,
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création du groupe",
      error: error.message,
    });
  }
};

// PUT - Modifier un groupe
const updateGroup = async (req, res) => {
  try {
    const {
      name,
      level,
      price,
      startDate,
    } = req.body;

    const group = await Group.findByIdAndUpdate(
      req.params.id,
      {
        name,
        level,
        price,
        startDate,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!group) {
      return res.status(404).json({
        message: "Groupe introuvable",
      });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la modification du groupe",
      error: error.message,
    });
  }
};

// DELETE - Supprimer un groupe
const deleteGroup = async (req, res) => {
  try {
    // Vérifier si le groupe contient des élèves
    const studentsCount = await Student.countDocuments({
      groupId: req.params.id,
    });

    if (studentsCount > 0) {
      return res.status(400).json({
        message:
          "Impossible de supprimer ce groupe car il contient des élèves.",
        studentsCount,
      });
    }

    const group = await Group.findByIdAndDelete(
      req.params.id
    );

    if (!group) {
      return res.status(404).json({
        message: "Groupe introuvable",
      });
    }

    res.json({
      message: "Groupe supprimé avec succès",
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression du groupe",
      error: error.message,
    });
  }
};

module.exports = {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
};