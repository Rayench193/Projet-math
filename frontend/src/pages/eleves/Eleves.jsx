import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../services/studentService";

import { getGroups } from "../../services/groupService";

import "./Eleves.css";

function Eleves() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingStudent, setEditingStudent] = useState(null);

  // =========================
  // SUPPRESSION
  // =========================

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    groupId: "",
  });

  // =========================
  // CHARGEMENT
  // =========================

  const loadData = async () => {
    try {
      setLoading(true);

      const [studentsData, groupsData] = await Promise.all([
        getStudents(),
        getGroups(),
      ]);

      setStudents(studentsData);
      setGroups(groupsData);
    } catch (error) {
      console.error("Erreur chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // FORMULAIRE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddStudent = () => {
    setEditingStudent(null);

    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      groupId: "",
    });

    setShowForm(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);

    setFormData({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      phone: student.phone || "",
      groupId: student.groupId?._id || student.groupId || "",
    });

    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingStudent(null);

    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      groupId: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (
        !formData.firstName.trim() ||
        !formData.lastName.trim() ||
        !formData.groupId
      ) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
      }

      if (editingStudent) {
        const updatedStudent = await updateStudent(
          editingStudent._id,
          formData
        );

        setStudents((prev) =>
          prev.map((student) =>
            student._id === editingStudent._id
              ? updatedStudent
              : student
          )
        );
      } else {
        const newStudent = await createStudent(formData);

        setStudents((prev) => [...prev, newStudent]);
      }

      handleCancelForm();
    } catch (error) {
      console.error(error);

      alert(
        "Une erreur est survenue lors de l'enregistrement de l'élève."
      );
    }
  };

  // =========================
  // SUPPRESSION
  // =========================

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    try {
      setDeleteError("");

      await deleteStudent(studentToDelete._id);

      setStudents((prev) =>
        prev.filter(
          (student) => student._id !== studentToDelete._id
        )
      );

      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error(error);

      setDeleteError(
        "Impossible de supprimer cet élève. Vérifiez qu'il n'est pas lié à des données existantes."
      );
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
    setDeleteError("");
  };

  // =========================
  // SÉANCES DE L'ÉLÈVE
  // =========================

  const handleViewSessions = (student) => {
    navigate(`/eleves/${student._id}/seances`, {
      state: {
        student,
      },
    });
  };

  // =========================
  // RECHERCHE
  // =========================

  const filteredStudents = students.filter((student) => {
    const searchValue = search.toLowerCase();

    const fullName =
      `${student.firstName || ""} ${student.lastName || ""}`.toLowerCase();

    const phone = (student.phone || "").toLowerCase();

    return (
      fullName.includes(searchValue) ||
      phone.includes(searchValue)
    );
  });

  // =========================
  // GROUPE
  // =========================

  const getGroupName = (student) => {
    if (student.groupId && typeof student.groupId === "object") {
      return student.groupId.name || "Groupe inconnu";
    }

    const group = groups.find(
      (group) => group._id === student.groupId
    );

    return group ? group.name : "Groupe inconnu";
  };

  // =========================
  // INITIALLES
  // =========================

  const getInitials = (student) => {
    const first = student.firstName?.charAt(0) || "";
    const last = student.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className="eleves-page">

      {/* =========================
          MODALE SUPPRESSION
      ========================= */}

      {showDeleteModal && studentToDelete && (
        <div className="student-delete-overlay">
          <div className="student-delete-modal">

            <div className="student-delete-icon">
              🗑️
            </div>

            <h2>
              Supprimer l'élève ?
            </h2>

            <p className="student-delete-message">
              Êtes-vous sûr de vouloir supprimer
              <strong>
                {" "}
                {studentToDelete.firstName}{" "}
                {studentToDelete.lastName}
              </strong>
              ?
            </p>

            <p className="student-delete-warning">
              Cette action est irréversible.
            </p>

            {deleteError && (
              <div className="student-delete-error">
                ⚠️ {deleteError}
              </div>
            )}

            <div className="student-delete-actions">

              <button
                type="button"
                className="btn-student-delete-cancel"
                onClick={handleDeleteCancel}
              >
                Annuler
              </button>

              <button
                type="button"
                className="btn-student-delete-confirm"
                onClick={handleDeleteConfirm}
              >
                🗑️ Supprimer
              </button>

            </div>
          </div>
        </div>
      )}

      {/* =========================
          HEADER
      ========================= */}

      <div className="eleves-header">

        <div>
          <h1>Élèves</h1>

          <p>
            Gérez vos élèves et leurs informations
          </p>
        </div>

        <button
          className="btn-add-student"
          onClick={handleAddStudent}
        >
          + Ajouter un élève
        </button>

      </div>

      {/* =========================
          RECHERCHE
      ========================= */}

      <div className="student-search">

        <span>🔍</span>

        <input
          type="text"
          placeholder="Rechercher un élève..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* =========================
          FORMULAIRE
      ========================= */}

      {showForm && (
        <div className="student-form-overlay">

          <div className="student-form-modal">

            <div className="student-form-header">

              <div>
                <h2>
                  {editingStudent
                    ? "Modifier l'élève"
                    : "Ajouter un élève"}
                </h2>

                <p>
                  {editingStudent
                    ? "Modifiez les informations de l'élève."
                    : "Ajoutez un nouvel élève à votre liste."}
                </p>
              </div>

              <button
                type="button"
                className="student-form-close"
                onClick={handleCancelForm}
              >
                ✕
              </button>

            </div>

            <form
              className="student-form"
              onSubmit={handleSubmit}
            >

              <div className="student-form-grid">

                {/* PRÉNOM */}

                <div className="student-form-group">

                  <label>
                    Prénom *
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Ex : Ahmed"
                    required
                  />

                </div>

                {/* NOM */}

                <div className="student-form-group">

                  <label>
                    Nom *
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Ex : Ben Ali"
                    required
                  />

                </div>

                {/* TÉLÉPHONE */}

                <div className="student-form-group">

                  <label>
                    Téléphone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ex : 55 123 456"
                  />

                </div>

                {/* GROUPE */}

                <div className="student-form-group">

                  <label>
                    Groupe *
                  </label>

                  <select
                    name="groupId"
                    value={formData.groupId}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Sélectionner un groupe
                    </option>

                    {groups.map((group) => (
                      <option
                        key={group._id}
                        value={group._id}
                      >
                        {group.name}
                      </option>
                    ))}

                  </select>

                </div>

              </div>

              <div className="student-form-actions">

                <button
                  type="button"
                  className="btn-cancel-student"
                  onClick={handleCancelForm}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn-save-student"
                >
                  {editingStudent
                    ? "Enregistrer les modifications"
                    : "Ajouter l'élève"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =========================
          LISTE
      ========================= */}

      {loading ? (
        <div className="empty-students">
          <div className="empty-icon">
            ⏳
          </div>

          <h3>
            Chargement...
          </h3>

          <p className="students-loading">
            Chargement des élèves en cours.
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (

        <div className="empty-students">

          <div className="empty-icon">
            👨‍🎓
          </div>

          <h3>
            Aucun élève trouvé
          </h3>

          <p>
            {search
              ? "Aucun élève ne correspond à votre recherche."
              : "Commencez par ajouter votre premier élève."}
          </p>

        </div>

      ) : (

        <div className="students-list">

          {filteredStudents.map((student) => (

            <div
              className="student-card"
              key={student._id}
            >

              <div className="student-info">

                <div className="student-avatar">
                  {getInitials(student)}
                </div>

                <div>

                  <h3>
                    {student.firstName}{" "}
                    {student.lastName}
                  </h3>

                  <p>
                    📱 {student.phone || "Aucun téléphone"}
                  </p>

                  <p>
                    👥 {getGroupName(student)}
                  </p>

                </div>

              </div>

              <div className="student-actions">

                <button
                  className="btn-student-sessions"
                  onClick={() =>
                    handleViewSessions(student)
                  }
                >
                  📚 Voir les séances
                </button>

                <button
                  className="btn-edit-student"
                  onClick={() =>
                    handleEditStudent(student)
                  }
                >
                  ✏️ Modifier
                </button>

                <button
                  className="btn-delete-student"
                  onClick={() =>
                    handleDeleteClick(student)
                  }
                >
                  🗑️ Supprimer
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Eleves;