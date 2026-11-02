import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { getStudents } from '../../services/studentService';
import { getGroups } from '../../services/groupService';
import { getSessions } from '../../services/sessionService';
import { getAttendances } from '../../services/attendanceService';

import './SeancesEleve.css';

function SeancesEleve() {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId } = useParams();

  const [student, setStudent] = useState(
    location.state?.student || null
  );
  const [group, setGroup] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        studentsData,
        groupsData,
        sessionsData,
        attendancesData,
      ] = await Promise.all([
        getStudents(),
        getGroups(),
        getSessions(),
        getAttendances(),
      ]);

      let currentStudent = student;

      if (!currentStudent) {
        currentStudent = studentsData.find(
          (item) =>
            String(item._id) === String(studentId)
        );
      }

      setStudent(currentStudent || null);

      if (currentStudent) {
        const currentGroupId =
          currentStudent.groupId?._id ||
          currentStudent.groupId;

        const currentGroup = groupsData.find(
          (item) =>
            String(item._id) ===
            String(currentGroupId)
        );

        setGroup(currentGroup || null);

        const studentSessions = sessionsData.filter(
          (session) => {
            const sessionGroupId =
              session.groupId?._id ||
              session.groupId;

            return (
              String(sessionGroupId) ===
              String(currentGroupId)
            );
          }
        );

        setSessions(studentSessions);
      }

      setAttendances(attendancesData || []);
    } catch (error) {
      console.error(
        'Erreur lors du chargement des séances :',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const getAttendance = (sessionId) => {
    return attendances.find((attendance) => {
      const attendanceSessionId =
        attendance.sessionId?._id ||
        attendance.sessionId;

      const attendanceStudentId =
        attendance.studentId?._id ||
        attendance.studentId;

      return (
        String(attendanceSessionId) ===
          String(sessionId) &&
        String(attendanceStudentId) ===
          String(studentId)
      );
    });
  };

  // Vérifie simplement si la présence est liée à un paiement
  const isPaid = (attendance) => {
    if (!attendance) {
      return false;
    }

    if (!attendance.paymentId) {
      return false;
    }

    // Si paymentId est un objet vide
    if (
      typeof attendance.paymentId === 'object' &&
      Object.keys(attendance.paymentId).length === 0
    ) {
      return false;
    }

    return true;
  };

  const formatDate = (date) => {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );
  };

  const sortedSessions = [...sessions].sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  );

  const presentCount = sortedSessions.filter(
    (session) => {
      const attendance =
        getAttendance(session._id);

      return (
        attendance?.status?.toLowerCase() ===
        'present'
      );
    }
  ).length;

  const absentCount = sortedSessions.filter(
    (session) => {
      const attendance =
        getAttendance(session._id);

      return (
        attendance?.status?.toLowerCase() ===
        'absent'
      );
    }
  ).length;

  const totalSessions =
    sortedSessions.length;

  if (!loading && !student) {
    return (
      <div className="student-sessions-page">
        <div className="student-sessions-not-found">

          <div className="not-found-icon">
            👨‍🎓
          </div>

          <h2>Élève introuvable</h2>

          <p>
            Impossible de trouver les informations
            de cet élève.
          </p>

          <button
            className="btn-back-students"
            onClick={() =>
              navigate('/eleves')
            }
          >
            ← Retour aux élèves
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="student-sessions-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="student-sessions-header">
        <div>

          <button
            className="btn-back-students"
            onClick={() =>
              navigate('/eleves')
            }
          >
            ← Retour aux élèves
          </button>

          <div className="student-title">

            <div className="student-large-avatar">
              {student?.firstName?.charAt(0)}
              {student?.lastName?.charAt(0)}
            </div>

            <div>
              <h1>
                {student?.firstName}{' '}
                {student?.lastName}
              </h1>

              <p>
                📞 {student?.phone || '-'}
              </p>

              <p>
                👥{' '}
                {group
                  ? `${group.name} - ${group.level}`
                  : 'Groupe non trouvé'}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* =========================
          STATISTIQUES
      ========================= */}

      {!loading && (
        <div className="student-session-stats">

          <div className="session-stat-card">
            <div className="session-stat-icon">
              📚
            </div>

            <div>
              <span>Total séances</span>
              <strong>{totalSessions}</strong>
            </div>
          </div>

          <div className="session-stat-card">
            <div className="session-stat-icon">
              ✅
            </div>

            <div>
              <span>Présent</span>
              <strong>{presentCount}</strong>
            </div>
          </div>

          <div className="session-stat-card">
            <div className="session-stat-icon">
              ❌
            </div>

            <div>
              <span>Absent</span>
              <strong>{absentCount}</strong>
            </div>
          </div>

        </div>
      )}

      {/* =========================
          CONTENU
      ========================= */}

      <div className="student-sessions-content">

        <div className="student-sessions-content-header">

          <div>
            <h2>Historique des séances</h2>

            <p>
              Toutes les séances du groupe de l'élève
            </p>
          </div>

          <div className="sessions-count">
            {totalSessions} séance
            {totalSessions > 1 ? 's' : ''}
          </div>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="sessions-loading">
            Chargement des séances...
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          sortedSessions.length === 0 && (
            <div className="sessions-empty">

              <div className="sessions-empty-icon">
                📚
              </div>

              <h3>Aucune séance</h3>

              <p>
                Aucune séance n'a encore été
                enregistrée pour le groupe de cet élève.
              </p>

            </div>
          )}

        {/* LISTE DES SÉANCES */}

        {!loading &&
          sortedSessions.length > 0 && (
            <div className="student-sessions-list">

              {sortedSessions.map((session) => {

                const attendance =
                  getAttendance(session._id);

                const status =
                  attendance?.status?.toLowerCase();

                const paid =
                  status === 'present' &&
                  isPaid(attendance);

                return (
                  <div
                    className="student-session-card"
                    key={session._id}
                  >

                    {/* DATE */}

                    <div className="session-date">

                      <div className="session-date-icon">
                        📅
                      </div>

                      <div>
                        <span>Date</span>

                        <strong>
                          {formatDate(session.date)}
                        </strong>
                      </div>

                    </div>

                    {/* CONTENU */}

                    <div className="session-content">

                      <span>
                        Contenu de la séance
                      </span>

                      <strong>
                        {session.content ||
                          'Aucun contenu renseigné'}
                      </strong>

                    </div>

                    {/* PRESENCE */}

                    <div className="session-attendance">

                      <span>
                        Présence
                      </span>

                      {status === 'present' && (
                        <span className="attendance-badge present">
                          ✓ Présent
                        </span>
                      )}

                      {status === 'absent' && (
                        <span className="attendance-badge absent">
                          ✕ Absent
                        </span>
                      )}

                      {!status && (
                        <span className="attendance-badge unknown">
                          — Non renseignée
                        </span>
                      )}

                      {/* INDICE DE PAIEMENT */}
                      {paid && (
                        <span className="payment-indicator">
                          ✓ Payé
                        </span>
                      )}

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

export default SeancesEleve;