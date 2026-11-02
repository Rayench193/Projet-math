import { useEffect, useState } from "react";

import { getStudents } from "../../services/studentService";
import { getGroups } from "../../services/groupService";

import "./Dashboard.css";

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendances, setAttendances] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // CHARGEMENT DU DASHBOARD
  // =========================

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // =========================
      // ÉLÈVES
      // =========================

      try {
        const studentsData = await getStudents();

        console.log("Élèves :", studentsData);

        setStudents(
          Array.isArray(studentsData)
            ? studentsData
            : []
        );
      } catch (error) {
        console.error(
          "Erreur élèves :",
          error
        );

        setStudents([]);
      }

      // =========================
      // GROUPES
      // =========================

      try {
        const groupsData = await getGroups();

        console.log("Groupes :", groupsData);

        setGroups(
          Array.isArray(groupsData)
            ? groupsData
            : []
        );
      } catch (error) {
        console.error(
          "Erreur groupes :",
          error
        );

        setGroups([]);
      }

      // =========================
      // PAIEMENTS
      // =========================

      try {
        const response = await fetch(
          "http://localhost:5000/api/payments"
        );

        if (!response.ok) {
          throw new Error(
            "Erreur API paiements"
          );
        }

        const paymentsData =
          await response.json();

        console.log(
          "Paiements :",
          paymentsData
        );

        setPayments(
          Array.isArray(paymentsData)
            ? paymentsData
            : []
        );
      } catch (error) {
        console.error(
          "Erreur paiements :",
          error
        );

        setPayments([]);
      }

      // =========================
      // PRÉSENCES
      // =========================

      try {
        const response = await fetch(
          "http://localhost:5000/api/attendances"
        );

        if (!response.ok) {
          throw new Error(
            "Erreur API présences"
          );
        }

        const attendancesData =
          await response.json();

        console.log(
          "Présences :",
          attendancesData
        );

        setAttendances(
          Array.isArray(attendancesData)
            ? attendancesData
            : []
        );
      } catch (error) {
        console.error(
          "Erreur présences :",
          error
        );

        setAttendances([]);
      }

    } catch (error) {
      console.error(
        "Erreur Dashboard :",
        error
      );

      setError(
        "Impossible de charger les données."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DATE ACTUELLE
  // =========================

  const now = new Date();

  const currentYear =
    now.getFullYear();

  const currentMonth =
    now.getMonth();

  const today =
    now.toISOString().split("T")[0];

  // =========================
  // REVENUS DU MOIS
  // =========================

  const monthlyRevenue =
    payments
      .filter((payment) => {

        // Seulement les paiements payés
        if (payment.status !== "paid") {
          return false;
        }

        // Vérifier la date
        if (!payment.paymentDate) {
          return false;
        }

        const paymentDate =
          new Date(
            payment.paymentDate
          );

        return (
          paymentDate.getFullYear() ===
            currentYear &&
          paymentDate.getMonth() ===
            currentMonth
        );
      })
      .reduce(
        (total, payment) =>
          total +
          Number(payment.amount || 0),
        0
      );

  // =========================
  // PAIEMENTS EN ATTENTE
  // =========================

  const pendingPayments =
    payments
      .filter(
        (payment) =>
          payment.status === "pending"
      )
      .reduce(
        (total, payment) =>
          total +
          Number(payment.amount || 0),
        0
      );

  // =========================
  // ABSENTS AUJOURD'HUI
  // =========================

  const absentToday =
    attendances.filter(
      (attendance) => {

        // Seulement les absents
        if (
          attendance.status !==
          "absent"
        ) {
          return false;
        }

        // La séance doit être présente
        const sessionDate =
          attendance.sessionId?.date;

        if (!sessionDate) {
          return false;
        }

        const date =
          new Date(sessionDate)
            .toISOString()
            .split("T")[0];

        return date === today;
      }
    ).length;

  // =========================
  // AFFICHAGE
  // =========================

  return (
    <div className="dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="dashboard-header">

        <div>
          <h1>Dashboard</h1>

          <p>
            Vue d'ensemble de votre activité
          </p>
        </div>

      </div>

      {/* =========================
          ERREUR
      ========================= */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* =========================
          LOADING
      ========================= */}

      {loading ? (
        <p className="dashboard-loading">
          Chargement des statistiques...
        </p>
      ) : (

        <div className="dashboard-cards">

          {/* =========================
              TOTAL ÉLÈVES
          ========================= */}

          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              👨‍🎓
            </div>

            <div>
              <strong>
                {students.length}
              </strong>

              <span>
                Total élèves
              </span>
            </div>

          </div>

          {/* =========================
              GROUPES
          ========================= */}

          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              👥
            </div>

            <div>
              <strong>
                {groups.length}
              </strong>

              <span>
                Groupes
              </span>
            </div>

          </div>

          {/* =========================
              REVENUS
          ========================= */}

          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              💰
            </div>

            <div>
              <strong>
                {monthlyRevenue.toFixed(2)} DT
              </strong>

              <span>
                Revenus du mois
              </span>
            </div>

          </div>

          {/* =========================
              PAIEMENTS EN ATTENTE
          ========================= */}

          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              🟠
            </div>

            <div>
              <strong>
                {pendingPayments.toFixed(2)} DT
              </strong>

              <span>
                Paiements en attente
              </span>
            </div>

          </div>

          {/* =========================
              ABSENTS
          ========================= */}

          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              🔴
            </div>

            <div>
              <strong>
                {absentToday}
              </strong>

              <span>
                Absents aujourd'hui
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Dashboard;