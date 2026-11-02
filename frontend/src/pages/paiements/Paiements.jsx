import { useEffect, useMemo, useState } from 'react';

import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from '../../services/paymentService';

import { getStudents } from '../../services/studentService';
import { getGroups } from '../../services/groupService';

import './Paiements.css';

function Paiements() {
  // ==========================================
  // STATES
  // ==========================================

  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [form, setForm] = useState({
    studentId: '',
    groupId: '',
    amount: '',
    status: 'paid',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const [error, setError] = useState('');


  // ==========================================
  // CHARGER LES DONNÉES
  // ==========================================

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        paymentsData,
        studentsData,
        groupsData,
      ] = await Promise.all([
        getPayments(),
        getStudents(),
        getGroups(),
      ]);

      setPayments(paymentsData);
      setStudents(studentsData);
      setGroups(groupsData);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  // ==========================================
  // GROUPE SÉLECTIONNÉ
  // ==========================================

  const selectedGroup = useMemo(() => {
    return groups.find(
      (group) => group._id === form.groupId
    );
  }, [groups, form.groupId]);


  // ==========================================
  // ÉLÈVES DU GROUPE
  // ==========================================

  const filteredStudents = useMemo(() => {
    if (!form.groupId) {
      return students;
    }

    return students.filter(
      (student) =>
        (student.groupId?._id || student.groupId) === form.groupId
    );
  }, [students, form.groupId]);


  // ==========================================
  // RECHERCHE
  // ==========================================

  const displayedPayments = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return payments;
    }

    return payments.filter((payment) => {
      const firstName =
        payment.studentId?.firstName || '';

      const lastName =
        payment.studentId?.lastName || '';

      const groupName =
        payment.groupId?.name || '';

      return (
        `${firstName} ${lastName}`
          .toLowerCase()
          .includes(value) ||
        groupName
          .toLowerCase()
          .includes(value)
      );
    });
  }, [payments, search]);


  // ==========================================
  // STATISTIQUES
  // ==========================================

  const totalAmount = payments
    .filter((payment) => payment.status === 'paid')
    .reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

  const activeCycles = payments.filter(
    (payment) =>
      payment.status === 'paid' &&
      Number(payment.sessionsCovered || 0) < 4
  ).length;

  const completedCycles = payments.filter(
    (payment) =>
      payment.status === 'paid' &&
      Number(payment.sessionsCovered || 0) >= 4
  ).length;


  // ==========================================
  // FORMULAIRE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));


    // Si on change le groupe,
    // remettre l'élève à zéro
    if (name === 'groupId') {
      setForm((prev) => ({
        ...prev,
        groupId: value,
        studentId: '',
        amount:
          groups.find((group) => group._id === value)?.price || '',
      }));
    }
  };


  // ==========================================
  // OUVRIR AJOUT
  // ==========================================

  const handleAdd = () => {
    setEditingPayment(null);

    setForm({
      studentId: '',
      groupId: '',
      amount: '',
      status: 'paid',
      paymentDate: new Date()
        .toISOString()
        .split('T')[0],
    });

    setError('');
    setShowModal(true);
  };


  // ==========================================
  // OUVRIR MODIFICATION
  // ==========================================

  const handleEdit = (payment) => {
    setEditingPayment(payment);

    setForm({
      studentId:
        payment.studentId?._id ||
        payment.studentId ||
        '',

      groupId:
        payment.groupId?._id ||
        payment.groupId ||
        '',

      amount: payment.amount || '',

      status:
        payment.status || 'paid',

      paymentDate: payment.paymentDate
        ? new Date(payment.paymentDate)
            .toISOString()
            .split('T')[0]
        : '',
    });

    setError('');
    setShowModal(true);
  };


  // ==========================================
  // ENREGISTRER
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    try {

      if (!form.studentId) {
        throw new Error('Veuillez sélectionner un élève.');
      }

      if (!form.groupId) {
        throw new Error('Veuillez sélectionner un groupe.');
      }

      if (!form.amount) {
        throw new Error('Le montant est obligatoire.');
      }


      const data = {
        studentId: form.studentId,
        groupId: form.groupId,
        amount: Number(form.amount),
        status: form.status,
        paymentDate: form.paymentDate,
      };


      if (editingPayment) {
        await updatePayment(
          editingPayment._id,
          data
        );
      } else {
        await createPayment(data);
      }


      setShowModal(false);
      setEditingPayment(null);

      await loadData();

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };


  // ==========================================
  // SUPPRIMER
  // ==========================================

  const handleDelete = async (payment) => {

    const studentName = `${payment.studentId?.firstName || ''} ${
      payment.studentId?.lastName || ''
    }`.trim();

    const confirmed = window.confirm(
      `Supprimer le paiement de ${studentName} ?\n\nLes séances associées redeviendront non payées.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePayment(payment._id);
      await loadData();

    } catch (err) {
      alert(err.message);
    }
  };


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString(
      'fr-FR'
    );
  };


  // ==========================================
  // RENDU
  // ==========================================

  return (
    <div className="paiements-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="paiements-header">

        <div>
          <h1>Paiements</h1>

          <p>
            Gestion des paiements et des cycles de séances
          </p>
        </div>

        <button
          className="btn-add-payment"
          onClick={handleAdd}
        >
          + Nouveau paiement
        </button>

      </div>


      {/* ======================================
          STATISTIQUES
      ====================================== */}

      <div className="payment-stats">

        <div className="payment-stat-card">

          <div className="stat-icon">
            💰
          </div>

          <div>
            <span>Total encaissé</span>

            <strong>
              {totalAmount.toFixed(2)} DT
            </strong>
          </div>

        </div>


        <div className="payment-stat-card">

          <div className="stat-icon">
            🔄
          </div>

          <div>
            <span>Cycles en cours</span>

            <strong>
              {activeCycles}
            </strong>
          </div>

        </div>


        <div className="payment-stat-card">

          <div className="stat-icon">
            ✅
          </div>

          <div>
            <span>Cycles terminés</span>

            <strong>
              {completedCycles}
            </strong>
          </div>

        </div>


        <div className="payment-stat-card">

          <div className="stat-icon">
            📋
          </div>

          <div>
            <span>Total paiements</span>

            <strong>
              {payments.length}
            </strong>
          </div>

        </div>

      </div>


      {/* ======================================
          RECHERCHE
      ====================================== */}

      <div className="payment-toolbar">

        <div className="payment-search">

          <span>🔎</span>

          <input
            type="text"
            placeholder="Rechercher un élève ou un groupe..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

      </div>


      {/* ======================================
          ERREUR
      ====================================== */}

      {error && !showModal && (
        <div className="payment-error">
          {error}
        </div>
      )}


      {/* ======================================
          TABLEAU
      ====================================== */}

      <div className="payments-table-container">

        {loading ? (

          <div className="payment-loading">
            Chargement des paiements...
          </div>

        ) : displayedPayments.length === 0 ? (

          <div className="payment-empty">

            <div className="empty-icon">
              💰
            </div>

            <h3>
              Aucun paiement
            </h3>

            <p>
              Enregistrez votre premier paiement.
            </p>

            <button
              className="btn-add-payment"
              onClick={handleAdd}
            >
              + Nouveau paiement
            </button>

          </div>

        ) : (

          <table className="payments-table">

            <thead>

              <tr>
                <th>Élève</th>
                <th>Groupe</th>
                <th>Montant</th>
                <th>Cycle</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {displayedPayments.map(
                (payment) => {

                  const covered =
                    Number(
                      payment.sessionsCovered || 0
                    );

                  const percentage =
                    Math.min(
                      (covered / 4) * 100,
                      100
                    );

                  const completed =
                    covered >= 4;

                  return (

                    <tr key={payment._id}>

                      {/* ÉLÈVE */}

                      <td>

                        <div className="student-cell">

                          <div className="student-avatar">
                            {payment.studentId?.firstName
                              ?.charAt(0)
                              ?.toUpperCase() || '?'}
                          </div>

                          <div>
                            <strong>
                              {payment.studentId?.firstName}{' '}
                              {payment.studentId?.lastName}
                            </strong>

                            <small>
                              {payment.studentId?.phone || ''}
                            </small>
                          </div>

                        </div>

                      </td>


                      {/* GROUPE */}

                      <td>

                        <div className="group-cell">

                          <strong>
                            {payment.groupId?.name || '-'}
                          </strong>

                          <small>
                            {payment.groupId?.level || ''}
                          </small>

                        </div>

                      </td>


                      {/* MONTANT */}

                      <td>

                        <strong className="amount-cell">
                          {Number(payment.amount || 0).toFixed(2)} DT
                        </strong>

                      </td>


                      {/* CYCLE */}

                      <td>

                        <div className="cycle-cell">

                          <div className="cycle-top">

                            <span>
                              {covered} / 4 séances
                            </span>

                            {completed && (
                              <span className="cycle-complete">
                                Terminé
                              </span>
                            )}

                          </div>

                          <div className="progress-bar">

                            <div
                              className="progress-fill"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>

                      </td>


                      {/* STATUT */}

                      <td>

                        {payment.status === 'paid' ? (

                          <span className="status-paid">
                            ● Payé
                          </span>

                        ) : (

                          <span className="status-pending">
                            ● En attente
                          </span>

                        )}

                      </td>


                      {/* DATE */}

                      <td>
                        {formatDate(
                          payment.paymentDate
                        )}
                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="payment-actions">

                          <button
                            className="action-edit"
                            onClick={() =>
                              handleEdit(payment)
                            }
                            title="Modifier"
                          >
                            ✏️
                          </button>

                          <button
                            className="action-delete"
                            onClick={() =>
                              handleDelete(payment)
                            }
                            title="Supprimer"
                          >
                            🗑️
                          </button>

                        </div>

                      </td>

                    </tr>

                  );
                }
              )}

            </tbody>

          </table>

        )}

      </div>


      {/* ======================================
          MODAL
      ====================================== */}

      {showModal && (

        <div
          className="payment-modal-overlay"
          onClick={() => setShowModal(false)}
        >

          <div
            className="payment-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="payment-modal-header">

              <div>
                <h2>
                  {editingPayment
                    ? 'Modifier le paiement'
                    : 'Nouveau paiement'}
                </h2>

                <p>
                  Un paiement couvre jusqu'à 4 séances présentes.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>

            </div>


            <form
              className="payment-form"
              onSubmit={handleSubmit}
            >

              {/* GROUPE */}

              <div className="form-field">

                <label>
                  Groupe
                </label>

                <select
                  name="groupId"
                  value={form.groupId}
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
                      {group.name} — {group.level}
                    </option>

                  ))}

                </select>

              </div>


              {/* ÉLÈVE */}

              <div className="form-field">

                <label>
                  Élève
                </label>

                <select
                  name="studentId"
                  value={form.studentId}
                  onChange={handleChange}
                  required
                  disabled={!form.groupId}
                >

                  <option value="">
                    {!form.groupId
                      ? 'Sélectionnez d’abord un groupe'
                      : 'Sélectionner un élève'}
                  </option>

                  {filteredStudents.map(
                    (student) => (

                      <option
                        key={student._id}
                        value={student._id}
                      >
                        {student.firstName}{' '}
                        {student.lastName}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* PRIX */}

              <div className="payment-price-box">

                <div>
                  <span>
                    Prix du groupe
                  </span>

                  <strong>
                    {selectedGroup
                      ? `${selectedGroup.price} DT`
                      : '--'}
                  </strong>
                </div>

                <small>
                  Le montant du paiement doit être égal au prix du groupe.
                </small>

              </div>


              {/* MONTANT */}

              <div className="form-field">

                <label>
                  Montant payé
                </label>

                <div className="amount-input">

                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />

                  <span>
                    DT
                  </span>

                </div>

              </div>


              {/* DATE */}

              <div className="form-field">

                <label>
                  Date du paiement
                </label>

                <input
                  type="date"
                  name="paymentDate"
                  value={form.paymentDate}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* STATUT */}

              <div className="form-field">

                <label>
                  Statut
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >

                  <option value="paid">
                    Payé
                  </option>

                  <option value="pending">
                    En attente
                  </option>

                </select>

              </div>


              {error && (
                <div className="payment-form-error">
                  {error}
                </div>
              )}


              {/* ACTIONS */}

              <div className="payment-form-actions">

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn-save-payment"
                >
                  {editingPayment
                    ? 'Enregistrer les modifications'
                    : 'Enregistrer le paiement'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Paiements;