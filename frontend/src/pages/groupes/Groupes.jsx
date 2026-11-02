import { useEffect, useState } from 'react';

import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from '../../services/groupService';

import './Groupes.css';

function Groupes() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    level: 'Bac',
    price: '',
    startDate: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // =========================
  // CHARGEMENT DES GROUPES
  // =========================

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);

      const data = await getGroups();

      setGroups(data);
    } catch (error) {
      console.error('Erreur groupes :', error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RECHERCHE
  // =========================

  const filteredGroups = groups.filter((group) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    return (
      group.name?.toLowerCase().includes(searchValue) ||
      group.level?.toLowerCase().includes(searchValue)
    );
  });

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

  const resetForm = () => {
    setFormData({
      name: '',
      level: 'Bac',
      price: '',
      startDate: '',
    });

    setEditingGroup(null);
    setShowForm(false);
  };

  // =========================
  // AJOUT / MODIFICATION
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const groupData = {
        name: formData.name.trim(),
        level: formData.level,
        price: Number(formData.price),
        startDate: formData.startDate,
      };

      if (editingGroup) {
        const updatedGroup = await updateGroup(
          editingGroup._id,
          groupData
        );

        setGroups((prev) =>
          prev.map((group) =>
            group._id === editingGroup._id
              ? updatedGroup
              : group
          )
        );
      } else {
        const newGroup = await createGroup(groupData);

        setGroups((prev) => [
          newGroup,
          ...prev,
        ]);
      }

      resetForm();
    } catch (error) {
      console.error(error);

      alert(
        editingGroup
          ? 'Erreur lors de la modification du groupe'
          : 'Erreur lors de la création du groupe'
      );
    }
  };

  // =========================
  // MODIFIER
  // =========================

  const handleEdit = (group) => {
    setEditingGroup(group);

    setFormData({
      name: group.name || '',
      level: group.level || 'Bac',
      price: group.price ?? '',
      startDate: group.startDate
        ? new Date(group.startDate)
            .toISOString()
            .split('T')[0]
        : '',
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // =========================
  // SUPPRESSION
  // =========================

  const handleDeleteClick = (group) => {
    setGroupToDelete(group);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) {
      return;
    }

    try {
      setDeleteError('');

      await deleteGroup(groupToDelete._id);

      setGroups((prev) =>
        prev.filter(
          (group) => group._id !== groupToDelete._id
        )
      );

      setShowDeleteModal(false);
      setGroupToDelete(null);
    } catch (error) {
      console.error(error);

      setDeleteError(
        'Impossible de supprimer ce groupe car il contient des élèves.'
      );
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setGroupToDelete(null);
    setDeleteError('');
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString('fr-FR');
  };

  // =========================
  // FORMULAIRE OUVERTURE
  // =========================

  const handleAddGroup = () => {
    if (showForm) {
      resetForm();
      return;
    }

    setEditingGroup(null);

    setFormData({
      name: '',
      level: 'Bac',
      price: '',
      startDate: '',
    });

    setShowForm(true);
  };

  return (
    <div className="groupes-page">

      {/* =================================
          MODALE SUPPRESSION
      ================================= */}

      {showDeleteModal && groupToDelete && (
        <div className="delete-modal-overlay">

          <div className="delete-modal">

            <div className="delete-modal-icon">
              ⚠️
            </div>

            <h2>Supprimer le groupe ?</h2>

            <p>
              Êtes-vous sûr de vouloir supprimer le groupe
              <strong> « {groupToDelete.name} » </strong> ?
            </p>

            {deleteError && (
              <div className="delete-modal-error">
                ⚠️ {deleteError}
              </div>
            )}

            <span className="delete-modal-warning">
              Cette action est irréversible.
            </span>

            <div className="delete-modal-actions">

              <button
                className="btn-modal-cancel"
                onClick={handleDeleteCancel}
              >
                Annuler
              </button>

              <button
                className="btn-modal-delete"
                onClick={handleDeleteConfirm}
              >
                🗑️ Supprimer
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================
          HEADER
      ================================= */}

      <div className="groupes-header">

        <div className="groupes-title">

          <h1>Groupes</h1>

          <p>
            Gérez vos groupes et leurs informations
          </p>

        </div>

        <button
          className="btn-add-group"
          onClick={handleAddGroup}
        >
          {showForm
            ? '✕ Fermer'
            : '＋ Ajouter un groupe'}
        </button>

      </div>

      {/* =================================
          STATISTIQUES
      ================================= */}

      {!loading && (
        <div className="groupes-summary">

          <div className="summary-card">

            <div className="summary-icon">
              👥
            </div>

            <div>
              <span className="summary-label">
                Total des groupes
              </span>

              <strong className="summary-value">
                {groups.length}
              </strong>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon bac">
              🎓
            </div>

            <div>
              <span className="summary-label">
                Groupes Bac
              </span>

              <strong className="summary-value">
                {
                  groups.filter(
                    (group) => group.level === 'Bac'
                  ).length
                }
              </strong>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon third">
              📚
            </div>

            <div>
              <span className="summary-label">
                Groupes 3ème
              </span>

              <strong className="summary-value">
                {
                  groups.filter(
                    (group) => group.level === '3ème'
                  ).length
                }
              </strong>
            </div>

          </div>

        </div>
      )}

      {/* =================================
          RECHERCHE
      ================================= */}

      {!loading && groups.length > 0 && (
        <div className="groupes-toolbar">

          <div className="group-search">

            <span className="search-icon">
              🔎
            </span>

            <input
              type="text"
              placeholder="Rechercher un groupe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch('')}
              >
                ✕
              </button>
            )}

          </div>

          <span className="group-results">
            {filteredGroups.length}{' '}
            {filteredGroups.length > 1
              ? 'groupes'
              : 'groupe'}
          </span>

        </div>
      )}

      {/* =================================
          FORMULAIRE MODALE
      ================================= */}

      {showForm && (
        <div className="group-form-overlay">

          <div className="group-form-modal">

            <div className="group-form-header">

              <div>

                <div className="form-title-icon">
                  {editingGroup ? '✏️' : '👥'}
                </div>

                <div>
                  <h2>
                    {editingGroup
                      ? 'Modifier un groupe'
                      : 'Ajouter un groupe'}
                  </h2>

                  <p>
                    {editingGroup
                      ? 'Modifiez les informations du groupe'
                      : 'Ajoutez un nouveau groupe'}
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="group-form-close"
                onClick={resetForm}
              >
                ✕
              </button>

            </div>

            <form
              className="group-form"
              onSubmit={handleSubmit}
            >

              <div className="group-form-grid">

                {/* NOM */}

                <div className="group-form-group">

                  <label>
                    Nom du groupe
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex : Groupe Bac 1"
                    required
                  />

                </div>

                {/* NIVEAU */}

                <div className="group-form-group">

                  <label>
                    Niveau
                  </label>

                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                  >
                    <option value="Bac">
                      Bac
                    </option>

                    <option value="3ème">
                      3ème
                    </option>
                  </select>

                </div>

                {/* PRIX */}

                <div className="group-form-group">

                  <label>
                    Prix du groupe
                  </label>

                  <div className="input-with-unit">

                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      placeholder="Ex : 60"
                      required
                    />

                    <span>
                      DT
                    </span>

                  </div>

                </div>

                {/* DATE */}

                <div className="group-form-group">

                  <label>
                    Date de début
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* ACTIONS */}

              <div className="group-form-actions">

                <button
                  type="button"
                  className="btn-cancel-group"
                  onClick={resetForm}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn-save-group"
                >
                  {editingGroup
                    ? '✓ Enregistrer les modifications'
                    : '＋ Ajouter le groupe'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================
          CHARGEMENT
      ================================= */}

      {loading && (
        <div className="groups-loading-container">

          <div className="loading-spinner"></div>

          <p>
            Chargement des groupes...
          </p>

        </div>
      )}

      {/* =================================
          AUCUN GROUPE
      ================================= */}

      {!loading && groups.length === 0 && (
        <div className="empty-groups">

          <div className="empty-group-icon">
            👥
          </div>

          <h3>
            Aucun groupe enregistré
          </h3>

          <p>
            Ajoutez votre premier groupe pour commencer.
          </p>

          <button
            className="empty-add-button"
            onClick={handleAddGroup}
          >
            ＋ Ajouter un groupe
          </button>

        </div>
      )}

      {/* =================================
          AUCUN RÉSULTAT
      ================================= */}

      {!loading &&
        groups.length > 0 &&
        filteredGroups.length === 0 && (
          <div className="empty-groups search-empty">

            <div className="empty-group-icon">
              🔎
            </div>

            <h3>
              Aucun groupe trouvé
            </h3>

            <p>
              Aucun groupe ne correspond à « {search} ».
            </p>

            <button
              className="empty-add-button"
              onClick={() => setSearch('')}
            >
              Réinitialiser la recherche
            </button>

          </div>
        )}

      {/* =================================
          LISTE DES GROUPES
      ================================= */}

      {!loading && filteredGroups.length > 0 && (
        <div className="groups-list">

          {filteredGroups.map((group) => (

            <div
              className="group-card"
              key={group._id}
            >

              {/* ICÔNE */}

              <div className="group-card-icon">
                👥
              </div>

              {/* INFORMATIONS */}

              <div className="group-card-info">

                <div className="group-card-title">

                  <h3>
                    {group.name}
                  </h3>

                  <span
                    className={`group-level ${
                      group.level === 'Bac'
                        ? 'level-bac'
                        : 'level-third'
                    }`}
                  >
                    {group.level}
                  </span>

                </div>

                <div className="group-details">

                  <div className="group-detail">

                    <span className="detail-icon">
                      💰
                    </span>

                    <div>
                      <span className="detail-label">
                        Prix
                      </span>

                      <strong>
                        {group.price} DT
                      </strong>
                    </div>

                  </div>

                  <div className="group-detail">

                    <span className="detail-icon">
                      📅
                    </span>

                    <div>
                      <span className="detail-label">
                        Début
                      </span>

                      <strong>
                        {formatDate(group.startDate)}
                      </strong>
                    </div>

                  </div>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="group-actions">

                <button
                  className="btn-edit-group"
                  onClick={() => handleEdit(group)}
                >
                  <span>✏️</span>
                  Modifier
                </button>

                <button
                  className="btn-delete-group"
                  onClick={() => handleDeleteClick(group)}
                >
                  <span>🗑️</span>
                  Supprimer
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default Groupes;