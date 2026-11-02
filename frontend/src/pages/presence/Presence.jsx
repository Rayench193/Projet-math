import { useEffect, useState } from 'react';
import './Presence.css';

import { getGroups } from '../../services/groupService';
import { getStudents } from '../../services/studentService';
import { getSessions } from '../../services/sessionService';
import {
  getAttendances,
  createAttendance,
} from '../../services/attendanceService';

function Presence() {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [allAttendances, setAllAttendances] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSession, setSelectedSession] = useState('');

  const [attendance, setAttendance] = useState({});

  const [loading, setLoading] = useState(true);
  const [savingStudent, setSavingStudent] = useState(null);

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        groupsData,
        studentsData,
        sessionsData,
        attendancesData,
      ] = await Promise.all([
        getGroups(),
        getStudents(),
        getSessions(),
        getAttendances(),
      ]);

      setGroups(groupsData || []);
      setStudents(studentsData || []);
      setSessions(sessionsData || []);
      setAllAttendances(attendancesData || []);

    } catch (error) {
      console.error(error);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // HELPERS
  // =========================

  const getId = (value) => {
    if (!value) return '';

    if (typeof value === 'object') {
      return value._id || value.id || '';
    }

    return value;
  };

  const getGroupName = (groupId) => {
    if (!groupId) {
      return 'Groupe inconnu';
    }

    if (typeof groupId === 'object') {
      return groupId.name || 'Groupe inconnu';
    }

    const group = groups.find(
      (item) => String(getId(item)) === String(groupId)
    );

    return group?.name || 'Groupe inconnu';
  };

  // =========================
  // GET ATTENDANCE STATUS
  // =========================

  const getExistingAttendance = (studentId, sessionId) => {
    return allAttendances.find((item) => {
      const attendanceStudentId = getId(item.studentId);
      const attendanceSessionId = getId(item.sessionId);

      return (
        String(attendanceStudentId) === String(studentId) &&
        String(attendanceSessionId) === String(sessionId)
      );
    });
  };

  // =========================
  // SESSION SELECTION
  // =========================

  const handleSessionChange = (sessionId) => {
    setSelectedSession(sessionId);

    if (!sessionId) {
      setSelectedGroup('');
      setAttendance({});
      return;
    }

    const session = sessions.find(
      (item) => String(getId(item)) === String(sessionId)
    );

    if (!session) {
      setSelectedGroup('');
      setAttendance({});
      return;
    }

    const groupId = getId(session.groupId);

    setSelectedGroup(groupId);

    // Charger les présences déjà enregistrées
    const sessionAttendances = allAttendances.filter((item) => {
      const attendanceSessionId = getId(item.sessionId);

      return (
        String(attendanceSessionId) === String(sessionId)
      );
    });

    const existingAttendance = {};

    sessionAttendances.forEach((item) => {
      const studentId = getId(item.studentId);

      if (studentId) {
        existingAttendance[studentId] =
          item.status?.toLowerCase();
      }
    });

    setAttendance(existingAttendance);
  };

  // =========================
  // GROUP SELECTION
  // =========================

  const handleGroupChange = (groupId) => {
    setSelectedGroup(groupId);
    setSelectedSession('');
    setAttendance({});
  };

  // =========================
  // CURRENT SESSION
  // =========================

  const currentSession = sessions.find(
    (session) =>
      String(getId(session)) === String(selectedSession)
  );

  // =========================
  // STUDENTS OF SELECTED GROUP
  // =========================

  const filteredStudents = students.filter((student) => {
    const studentGroupId = getId(student.groupId);

    return (
      String(studentGroupId) === String(selectedGroup)
    );
  });

  // =========================
  // SAVE ATTENDANCE
  // =========================

  const handleAttendance = async (studentId, status) => {
    try {
      if (!selectedSession || !selectedGroup) {
        alert('Veuillez sélectionner une séance');
        return;
      }

      setSavingStudent(studentId);

      const existingAttendance =
        getExistingAttendance(
          studentId,
          selectedSession
        );

      // Enregistrement dans la base
      const savedAttendance = await createAttendance({
        studentId: studentId,
        groupId: selectedGroup,
        sessionId: selectedSession,
        status: status,
      });

      // Mise à jour de l'état local
      setAttendance((prev) => ({
        ...prev,
        [studentId]: status,
      }));

      // Mise à jour de la liste globale
      setAllAttendances((prev) => {
        if (existingAttendance) {
          return prev.map((item) => {
            if (
              String(getId(item)) ===
              String(getId(existingAttendance))
            ) {
              return savedAttendance;
            }

            return item;
          });
        }

        return [
          ...prev,
          savedAttendance,
        ];
      });

    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de la présence :",
        error
      );

      alert(
        error.message ||
        "Erreur lors de l'enregistrement de la présence"
      );
    } finally {
      setSavingStudent(null);
    }
  };

  // =========================
  // STATISTICS
  // =========================

  const presentCount = Object.values(attendance).filter(
    (status) => status === 'present'
  ).length;

  const absentCount = Object.values(attendance).filter(
    (status) => status === 'absent'
  ).length;

  const notMarkedCount = Math.max(
    0,
    filteredStudents.length -
      presentCount -
      absentCount
  );

  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="presence-page">
        <div className="presence-loading">
          Chargement...
        </div>
      </div>
    );
  }

  // =========================
  // RETURN
  // =========================

  return (
    <div className="presence-page">

      {/* HEADER */}
      <div className="presence-header">
        <div>
          <h1>Présence</h1>

          <p>
            Gestion des présences et suivi des séances
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="presence-filters">

        {/* SESSION */}
        <div className="presence-field">
          <label>Choisir une séance</label>

          <select
            value={selectedSession}
            onChange={(e) =>
              handleSessionChange(e.target.value)
            }
          >
            <option value="">
              Sélectionner une séance
            </option>

            {sessions.map((session) => (
              <option
                key={getId(session)}
                value={getId(session)}
              >
                {getGroupName(session.groupId)}
                {' — '}
                {session.content ||
                  'Séance sans contenu'}
                {' — '}
                {formatDate(session.date)}
              </option>
            ))}
          </select>
        </div>

        {/* GROUP */}
        <div className="presence-field">
          <label>Groupe</label>

          <select
            value={selectedGroup}
            onChange={(e) =>
              handleGroupChange(e.target.value)
            }
          >
            <option value="">
              Tous les groupes
            </option>

            {groups.map((group) => (
              <option
                key={getId(group)}
                value={getId(group)}
              >
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* SESSION INFO */}
        <div className="presence-session-info">
          {currentSession ? (
            <>
              <span>
                📅 {formatDate(currentSession.date)}
              </span>

              <span>
                📚 {getGroupName(currentSession.groupId)}
              </span>

              <span>
                📝 {currentSession.content || '-'}
              </span>
            </>
          ) : (
            <span>
              Sélectionnez une séance pour commencer
            </span>
          )}
        </div>

      </div>

      {/* STATISTICS */}
      {selectedSession && (
        <div className="presence-stats">

          <div className="presence-stat-card">
            <div className="stat-icon">👨‍🎓</div>

            <div>
              <span>Total élèves</span>

              <strong>
                {filteredStudents.length}
              </strong>
            </div>
          </div>

          <div className="presence-stat-card present">
            <div className="stat-icon">✓</div>

            <div>
              <span>Présents</span>

              <strong>
                {presentCount}
              </strong>
            </div>
          </div>

          <div className="presence-stat-card absent">
            <div className="stat-icon">✕</div>

            <div>
              <span>Absents</span>

              <strong>
                {absentCount}
              </strong>
            </div>
          </div>

          <div className="presence-stat-card pending">
            <div className="stat-icon">○</div>

            <div>
              <span>Non renseignés</span>

              <strong>
                {notMarkedCount}
              </strong>
            </div>
          </div>

        </div>
      )}

      {/* STUDENTS */}
      <div className="presence-content">

        {!selectedSession ? (

          <div className="presence-empty">

            <div className="empty-icon">
              📋
            </div>

            <h3>
              Aucune séance sélectionnée
            </h3>

            <p>
              Sélectionnez une séance pour afficher
              les élèves et enregistrer leur présence.
            </p>

          </div>

        ) : filteredStudents.length === 0 ? (

          <div className="presence-empty">

            <div className="empty-icon">
              👨‍🎓
            </div>

            <h3>
              Aucun élève
            </h3>

            <p>
              Aucun élève n'est associé à ce groupe.
            </p>

          </div>

        ) : (

          <div className="students-presence-list">

            <div className="presence-list-header">

              <div>
                <h2>
                  Liste des élèves
                </h2>

                <p>
                  {filteredStudents.length} élève(s)
                </p>
              </div>

            </div>

            {filteredStudents.map((student) => {

              const status =
                attendance[student._id];

              const isSaving =
                savingStudent === student._id;

              return (
                <div
                  className="student-presence-row"
                  key={student._id}
                >

                  {/* STUDENT INFO */}
                  <div className="student-info">

                    <div className="student-avatar">

                      {student.firstName
                        ?.charAt(0)
                        ?.toUpperCase()}

                      {student.lastName
                        ?.charAt(0)
                        ?.toUpperCase()}

                    </div>

                    <div>

                      <h3>
                        {student.firstName}{' '}
                        {student.lastName}
                      </h3>

                      <span>
                        📱 {student.phone || '-'}
                      </span>

                    </div>

                  </div>

                  {/* ATTENDANCE */}
                  <div className="attendance-actions">

                    <button
                      type="button"
                      disabled={isSaving}
                      className={`attendance-btn present-btn ${
                        status === 'present'
                          ? 'active'
                          : ''
                      }`}
                      onClick={() =>
                        handleAttendance(
                          student._id,
                          'present'
                        )
                      }
                    >
                      {isSaving &&
                      status !== 'present'
                        ? 'Enregistrement...'
                        : '✓ Présent'}
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      className={`attendance-btn absent-btn ${
                        status === 'absent'
                          ? 'active'
                          : ''
                      }`}
                      onClick={() =>
                        handleAttendance(
                          student._id,
                          'absent'
                        )
                      }
                    >
                      {isSaving &&
                      status !== 'absent'
                        ? 'Enregistrement...'
                        : '✕ Absent'}
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}

export default Presence;