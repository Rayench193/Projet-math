import { useEffect, useState } from 'react';

import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
} from '../../services/sessionService';

import { getGroups } from '../../services/groupService';

import './Sessions.css';

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==============================
  // FORMULAIRE
  // ==============================

  const [showForm, setShowForm] = useState(false);
  const [groupId, setGroupId] = useState('');
  const [date, setDate] = useState('');
  const [content, setContent] = useState('');
  const [editingSession, setEditingSession] = useState(null);

  // ==============================
  // RECHERCHE / FILTRE
  // ==============================

  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  // ==============================
  // SUPPRESSION
  // ==============================

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // ==============================
  // CHARGEMENT
  // ==============================

  useEffect(() => {
    loadSessions();
    loadGroups();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);

      const data = await getSessions();

      setSessions(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Impossible de récupérer les séances.');
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (err) {
      console.error('Erreur groupes:', err);
    }
  };

  // ==============================
  // FORMULAIRE AJOUT
  // ==============================

  const openAddForm = () => {
    setEditingSession(null);
    setGroupId('');
    setDate('');
    setContent('');
    setShowForm(true);
  };

  // ==============================
  // FORMULAIRE MODIFICATION
  // ==============================

  const openEditForm = (session) => {
    setEditingSession(session);

    setGroupId(
      session.groupId?._id || session.groupId || ''
    );

    setDate(
      session.date
        ? new Date(session.date)
            .toISOString()
            .slice(0, 10)
        : ''
    );

    setContent(session.content || '');

    setShowForm(true);
  };

  // ==============================
  // FERMER FORMULAIRE
  // ==============================

  const closeForm = () => {
    setShowForm(false);
    setEditingSession(null);
    setGroupId('');
    setDate('');
    setContent('');
  };

  // ==============================
  // ENREGISTRER
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupId || !date || !content.trim()) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const sessionData = {
        groupId,
        date,
        content: content.trim(),
      };

      if (editingSession) {
        await updateSession(
          editingSession._id,
          sessionData
        );
      } else {
        await createSession(sessionData);
      }

      closeForm();
      await loadSessions();
    } catch (err) {
      console.error(err);

      alert(
        editingSession
          ? 'Erreur lors de la modification de la séance.'
          : 'Erreur lors de l’ajout de la séance.'
      );
    }
  };

  // ==============================
  // SUPPRESSION
  // ==============================

  const handleDeleteClick = (session) => {
    setSessionToDelete(session);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;

    try {
      setDeleteError('');

      await deleteSession(sessionToDelete._id);

      setSessions((prev) =>
        prev.filter(
          (session) =>
            session._id !== sessionToDelete._id
        )
      );

      setShowDeleteModal(false);
      setSessionToDelete(null);
    } catch (err) {
      console.error(err);

      setDeleteError(
        'Impossible de supprimer cette séance.'
      );
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSessionToDelete(null);
    setDeleteError('');
  };

  // ==============================
  // FILTRE
  // ==============================

  const filteredSessions = sessions.filter(
    (session) => {
      const sessionContent =
        session.content || '';

      const matchesSearch =
        sessionContent
          .toLowerCase()
          .includes(search.toLowerCase());

      const sessionGroupId =
        session.groupId?._id ||
        session.groupId;

      const matchesGroup =
        selectedGroup === '' ||
        String(sessionGroupId) ===
          String(selectedGroup);

      return (
        matchesSearch &&
        matchesGroup
      );
    }
  );

  // ==============================
  // FORMAT DATE
  // ==============================

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';

    return new Date(
      dateValue
    ).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatShortDate = (dateValue) => {
    if (!dateValue) return '-';

    return new Date(
      dateValue
    ).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="sessions-page">

      {/* ==================================================
          MODAL SUPPRESSION
      ================================================== */}

      {showDeleteModal &&
        sessionToDelete && (
          <div
            className="delete-modal-overlay"
            onClick={handleDeleteCancel}
          >
            <div
              className="delete-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="delete-modal-icon">
                🗑️
              </div>

              <h2>
                Supprimer la séance ?
              </h2>

              <p className="delete-modal-text">
                Cette séance sera définitivement
                supprimée de votre historique.
              </p>

              <div className="delete-session-preview">

                <div className="preview-icon">
                  📚
                </div>

                <div>
                  <strong>
                    {sessionToDelete.groupId?.name ||
                      'Groupe inconnu'}
                  </strong>

                  <span>
                    📅{' '}
                    {formatShortDate(
                      sessionToDelete.date
                    )}
                  </span>

                  <span>
                    {sessionToDelete.content ||
                      'Aucun contenu'}
                  </span>
                </div>

              </div>

              {deleteError && (
                <div className="delete-modal-error">
                  ⚠️ {deleteError}
                </div>
              )}

              <div className="delete-modal-warning">
                ⚠️ Cette action est irréversible.
              </div>

              <div className="delete-modal-actions">

                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={handleDeleteCancel}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  className="btn-modal-delete"
                  onClick={handleDeleteConfirm}
                >
                  🗑 Supprimer
                </button>

              </div>

            </div>
          </div>
        )}

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="sessions-header">

        <div className="sessions-title-area">

          <div className="sessions-title-icon">
            📚
          </div>

          <div>
            <h1>Séances</h1>

            <p>
              Gérez les séances et le contenu
              de vos groupes
            </p>
          </div>

        </div>

        <button
          className="btn-add-session"
          onClick={openAddForm}
        >
          <span className="add-icon">
            +
          </span>

          Ajouter une séance
        </button>

      </div>

      {/* ==================================================
          STATISTIQUES
      ================================================== */}

      <div className="sessions-stats">

        <div className="session-stat">

          <div className="stat-icon blue">
            📚
          </div>

          <div>
            <span>
              Total séances
            </span>

            <strong>
              {sessions.length}
            </strong>
          </div>

        </div>

        <div className="session-stat">

          <div className="stat-icon purple">
            👥
          </div>

          <div>
            <span>
              Groupes concernés
            </span>

            <strong>
              {
                new Set(
                  sessions.map(
                    (session) =>
                      session.groupId?._id ||
                      session.groupId
                  )
                ).size
              }
            </strong>
          </div>

        </div>

        <div className="session-stat">

          <div className="stat-icon green">
            🔎
          </div>

          <div>
            <span>
              Résultats affichés
            </span>

            <strong>
              {filteredSessions.length}
            </strong>
          </div>

        </div>

      </div>

      {/* ==================================================
          FILTRES
      ================================================== */}

      <div className="sessions-toolbar">

        <div className="search-box">

          <span className="search-icon">
            🔎
          </span>

          <input
            type="text"
            placeholder="Rechercher par contenu..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() =>
                setSearch('')
              }
            >
              ×
            </button>
          )}

        </div>

        <div className="group-filter">

          <span>
            👥
          </span>

          <select
            value={selectedGroup}
            onChange={(e) =>
              setSelectedGroup(
                e.target.value
              )
            }
          >
            <option value="">
              Tous les groupes
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

        {(search || selectedGroup) && (
          <button
            type="button"
            className="reset-filters"
            onClick={() => {
              setSearch('');
              setSelectedGroup('');
            }}
          >
            Réinitialiser
          </button>
        )}

      </div>

      {/* ==================================================
          FORMULAIRE
      ================================================== */}

      {showForm && (
        <div
          className="session-form-overlay"
          onClick={closeForm}
        >

          <div
            className="session-form-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="session-form-header">

              <div className="form-title-wrapper">

                <div className="form-title-icon">
                  {editingSession
                    ? '✏️'
                    : '📚'}
                </div>

                <div>

                  <h2>
                    {editingSession
                      ? 'Modifier la séance'
                      : 'Nouvelle séance'}
                  </h2>

                  <p>
                    {editingSession
                      ? 'Modifiez les informations de la séance'
                      : 'Ajoutez une séance à votre groupe'}
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="session-form-close"
                onClick={closeForm}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="session-form-body">

                <div className="session-form-grid">

                  {/* GROUPE */}

                  <div className="form-group">

                    <label>
                      Groupe
                    </label>

                    <div className="input-wrapper">

                      <span>
                        👥
                      </span>

                      <select
                        value={groupId}
                        onChange={(e) =>
                          setGroupId(
                            e.target.value
                          )
                        }
                      >

                        <option value="">
                          Sélectionner un groupe
                        </option>

                        {groups.map(
                          (group) => (
                            <option
                              key={group._id}
                              value={group._id}
                            >
                              {group.name} —{' '}
                              {group.level}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                  </div>

                  {/* DATE */}

                  <div className="form-group">

                    <label>
                      Date
                    </label>

                    <div className="input-wrapper">

                      <span>
                        📅
                      </span>

                      <input
                        type="date"
                        value={date}
                        onChange={(e) =>
                          setDate(
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

                {/* CONTENU */}

                <div className="form-group content-form-group">

                  <label>
                    Contenu de la séance
                  </label>

                  <textarea
                    placeholder="Exemple : Limites et continuité, exercices d'application..."
                    rows="6"
                    value={content}
                    onChange={(e) =>
                      setContent(
                        e.target.value
                      )
                    }
                  />

                  <div className="textarea-footer">
                    <span>
                      Décrivez le contenu étudié
                      pendant cette séance.
                    </span>

                    <span>
                      {content.length} caractères
                    </span>
                  </div>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="form-actions">

                <button
                  type="button"
                  className="btn-form-cancel"
                  onClick={closeForm}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn-form-submit"
                >
                  {editingSession
                    ? '✓ Enregistrer'
                    : '+ Créer la séance'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ==================================================
          CHARGEMENT
      ================================================== */}

      {loading && (
        <div className="sessions-loading">

          <div className="loading-spinner"></div>

          <span>
            Chargement des séances...
          </span>

        </div>
      )}

      {/* ==================================================
          ERREUR
      ================================================== */}

      {error && (
        <div className="sessions-error">
          ⚠️ {error}
        </div>
      )}

      {/* ==================================================
          AUCUNE SÉANCE
      ================================================== */}

      {!loading &&
        !error &&
        sessions.length === 0 && (
          <div className="empty-sessions">

            <div className="empty-icon">
              📚
            </div>

            <h3>
              Aucune séance enregistrée
            </h3>

            <p>
              Commencez par ajouter votre
              première séance.
            </p>

            <button
              onClick={openAddForm}
              className="empty-add-button"
            >
              + Ajouter une séance
            </button>

          </div>
        )}

      {/* ==================================================
          AUCUN RÉSULTAT
      ================================================== */}

      {!loading &&
        !error &&
        sessions.length > 0 &&
        filteredSessions.length === 0 && (
          <div className="empty-sessions">

            <div className="empty-icon">
              🔎
            </div>

            <h3>
              Aucune séance trouvée
            </h3>

            <p>
              Aucune séance ne correspond
              à vos critères de recherche.
            </p>

            <button
              onClick={() => {
                setSearch('');
                setSelectedGroup('');
              }}
              className="empty-add-button"
            >
              Réinitialiser les filtres
            </button>

          </div>
        )}

      {/* ==================================================
          LISTE
      ================================================== */}

      {!loading &&
        !error &&
        filteredSessions.length > 0 && (

          <div className="sessions-list">

            {filteredSessions.map(
              (session) => {

                const group =
                  session.groupId;

                return (
                  <div
                    className="session-card"
                    key={session._id}
                  >

                    {/* TOP */}

                    <div className="session-card-top">

                      <div className="session-group">

                        <div className="session-group-icon">
                          👥
                        </div>

                        <div>

                          <span>
                            Groupe
                          </span>

                          <h3>
                            {group?.name ||
                              'Groupe inconnu'}
                          </h3>

                        </div>

                      </div>

                      <div className="session-date-badge">
                        📅{' '}
                        {formatShortDate(
                          session.date
                        )}
                      </div>

                    </div>

                    {/* CONTENT */}

                    <div className="session-card-content">

                      <div className="content-label">
                        CONTENU DE LA SÉANCE
                      </div>

                      <p>
                        {session.content ||
                          'Aucun contenu renseigné.'}
                      </p>

                    </div>

                    {/* FOOTER */}

                    <div className="session-card-footer">

                      <div className="session-full-date">
                        📅 {formatDate(
                          session.date
                        )}
                      </div>

                      <div className="session-actions">

                        <button
                          className="btn-session-edit"
                          onClick={() =>
                            openEditForm(
                              session
                            )
                          }
                        >
                          ✏️ Modifier
                        </button>

                        <button
                          className="btn-session-delete"
                          onClick={() =>
                            handleDeleteClick(
                              session
                            )
                          }
                        >
                          🗑 Supprimer
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

    </div>
  );
}

export default Sessions;