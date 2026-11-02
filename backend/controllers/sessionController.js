const Session = require("../models/Session");
const Group = require("../models/Group");

// ==========================================
// GET /api/sessions
// Récupérer toutes les séances
// ==========================================
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate("groupId", "name level price")
      .sort({ date: -1 });

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Erreur getSessions :", error);

    res.status(500).json({
      message: "Erreur lors de la récupération des séances",
    });
  }
};

// ==========================================
// POST /api/sessions
// Créer une séance
// ==========================================
const createSession = async (req, res) => {
  try {
    const { groupId, date, content } = req.body;

    if (!groupId || !date || !content) {
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

    const session = await Session.create({
      groupId,
      date,
      content: content.trim(),
    });

    const populatedSession = await Session.findById(session._id)
      .populate("groupId", "name level price");

    res.status(201).json({
      message: "Séance créée avec succès",
      session: populatedSession,
    });
  } catch (error) {
    console.error("Erreur createSession :", error);

    res.status(400).json({
      message: "Erreur lors de la création de la séance",
    });
  }
};
// ==========================================
// PUT /api/sessions/:id
// Modifier une séance
// ==========================================
const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupId, date, content } = req.body;

    if (!groupId || !date || !content) {
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

    const session = await Session.findByIdAndUpdate(
      id,
      {
        groupId,
        date,
        content: content.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("groupId", "name level price");

    if (!session) {
      return res.status(404).json({
        message: "Séance introuvable",
      });
    }

    res.status(200).json({
      message: "Séance modifiée avec succès",
      session,
    });
  } catch (error) {
    console.error("Erreur updateSession :", error);

    res.status(400).json({
      message: "Erreur lors de la modification de la séance",
    });
  }
};
// ==========================================
// DELETE /api/sessions/:id
// Supprimer une séance
// ==========================================
const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findByIdAndDelete(id);

    if (!session) {
      return res.status(404).json({
        message: "Séance introuvable",
      });
    }

    res.status(200).json({
      message: "Séance supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur deleteSession :", error);

    res.status(400).json({
      message: "Erreur lors de la suppression de la séance",
    });
  }
};
module.exports = {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
};