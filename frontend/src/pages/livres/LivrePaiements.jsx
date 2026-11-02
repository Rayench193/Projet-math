import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  getBookPayments,
  createBookPayment,
  deleteBookPayment,
} from '../../services/bookPaymentService';

import './LivrePaiements.css';

function LivrePaiements() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: '',
  });

  // =========================
  // CHARGER LES DONNÉES
  // =========================

  const loadData = async () => {
    try {
      setLoading(true);

      const data = await getBookPayments(bookId);

      setBook(data.book);
      setStudents(data.students || []);
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          'Erreur lors du chargement des paiements'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookId) {
      loadData();
    }
  }, [bookId]);

  // =========================
  // ÉLÈVES PAYÉS / NON PAYÉS
  // =========================

  const paidStudents = useMemo(() => {
    return students.filter((item) => item.paid);
  }, [students]);

  const unpaidStudents = useMemo(() => {
    return students.filter((item) => !item.paid);
  }, [students]);

  // =========================
  // RECHERCHE
  // =========================

  const filterStudent = (item) => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return true;
    }

    const student = item.student;

    const fullName =
      `${student.firstName || ''} ${
        student.lastName || ''
      }`.toLowerCase();

    const phone = (
      student.phone || ''
    ).toLowerCase();

    const groupName = (
      student.groupId?.name || ''
    ).toLowerCase();

    return (
      fullName.includes(value) ||
      phone.includes(value) ||
      groupName.includes(value)
    );
  };

  const filteredPaidStudents =
    paidStudents.filter(filterStudent);

  const filteredUnpaidStudents =
    unpaidStudents.filter(filterStudent);

  // =========================
  // TOTAL ENCAISSÉ
  // =========================

  const totalCollected = useMemo(() => {
    return paidStudents.reduce(
      (total, item) => {
        return (
          total +
          Number(item.payment?.amount || 0)
        );
      },
      0
    );
  }, [paidStudents]);

  // =========================
  // OUVRIR MODAL PAIEMENT
  // =========================

  const openPaymentModal = (item) => {
    setSelectedStudent(item.student);

    setPaymentForm({
      amount: book?.price || '',
      paymentDate: new Date()
        .toISOString()
        .split('T')[0],
    });

    setShowPaymentModal(true);
  };

  // =========================
  // FERMER MODAL
  // =========================

  const closePaymentModal = () => {
    if (saving) {
      return;
    }

    setShowPaymentModal(false);
    setSelectedStudent(null);

    setPaymentForm({
      amount: '',
      paymentDate: '',
    });
  };

  // =========================
  // CHANGEMENT FORMULAIRE
  // =========================

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;

    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // ENREGISTRER PAIEMENT
  // =========================

  const handleSavePayment = async (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      return;
    }

    const amount = Number(
      paymentForm.amount
    );

    if (
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      alert(
        'Veuillez saisir un montant valide.'
      );
      return;
    }

    if (!paymentForm.paymentDate) {
      alert(
        'Veuillez sélectionner une date de paiement.'
      );
      return;
    }

    try {
      setSaving(true);

      await createBookPayment({
        bookId,
        studentId: selectedStudent._id,
        amount,
        paymentDate:
          paymentForm.paymentDate,
      });

      setShowPaymentModal(false);
      setSelectedStudent(null);

      setPaymentForm({
        amount: '',
        paymentDate: '',
      });

      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          'Erreur lors de l’enregistrement du paiement'
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // ANNULER PAIEMENT
  // =========================

  const handleCancelPayment = async (
    payment
  ) => {
    if (!payment?._id) {
      return;
    }

    const confirmed = window.confirm(
      'Voulez-vous vraiment annuler ce paiement ?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await deleteBookPayment(
        payment._id
      );

      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          'Erreur lors de l’annulation du paiement'
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString(
      'fr-FR'
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="livre-paiements-page">
        <div className="livre-payment-state">
          <div className="payment-loading-spinner"></div>

          <h3>
            Chargement des paiements...
          </h3>

          <p>
            Veuillez patienter.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // LIVRE INTROUVABLE
  // =========================

  if (!book) {
    return (
      <div className="livre-paiements-page">
        <div className="livre-payment-state">
          <div className="payment-empty-icon">
            📚
          </div>

          <h3>
            Livre introuvable
          </h3>

          <p>
            Le livre demandé n'existe pas.
          </p>

          <button
            className="back-books-button"
            onClick={() =>
              navigate('/livres')
            }
          >
            ← Retour aux livres
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="livre-paiements-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="livre-payment-header">

        <button
          className="back-button"
          onClick={() =>
            navigate('/livres')
          }
        >
          ←
        </button>

        <div className="livre-payment-title">

          <div className="payment-book-icon">
            📘
          </div>

          <div>
            <span className="page-breadcrumb">
              Livres / Paiements
            </span>

            <h1>
              {book.name}
            </h1>

            <p>
              Gestion des paiements des élèves
            </p>
          </div>

        </div>

      </div>

      {/* =========================
          STATISTIQUES
      ========================= */}

      <div className="payment-summary">

        <div className="payment-summary-card">

          <div className="summary-icon blue">
            💰
          </div>

          <div>
            <span>
              Prix du livre
            </span>

            <strong>
              {Number(book.price).toFixed(2)} DT
            </strong>
          </div>

        </div>

        <div className="payment-summary-card">

          <div className="summary-icon purple">
            👥
          </div>

          <div>
            <span>
              Total élèves
            </span>

            <strong>
              {students.length}
            </strong>
          </div>

        </div>

        <div className="payment-summary-card">

          <div className="summary-icon green">
            ✓
          </div>

          <div>
            <span>
              Élèves payés
            </span>

            <strong>
              {paidStudents.length}
            </strong>
          </div>

        </div>

        <div className="payment-summary-card">

          <div className="summary-icon orange">
            ⏳
          </div>

          <div>
            <span>
              Non payés
            </span>

            <strong>
              {unpaidStudents.length}
            </strong>
          </div>

        </div>

        <div className="payment-summary-card">

          <div className="summary-icon teal">
            💵
          </div>

          <div>
            <span>
              Montant encaissé
            </span>

            <strong>
              {totalCollected.toFixed(2)} DT
            </strong>
          </div>

        </div>

      </div>

      {/* =========================
          RECHERCHE
      ========================= */}

      <div className="students-toolbar">

        <div className="students-search">

          <span>
            🔎
          </span>

          <input
            type="text"
            placeholder="Rechercher un élève, téléphone ou groupe..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              className="clear-payment-search"
              onClick={() =>
                setSearch('')
              }
            >
              ×
            </button>
          )}

        </div>

        {search && (
          <div className="search-result-count">
            {filteredPaidStudents.length +
              filteredUnpaidStudents.length}{' '}
            résultat(s)
          </div>
        )}

      </div>

      {/* =========================
          ÉLÈVES AYANT PAYÉ
      ========================= */}

      <section className="payment-section">

        <div className="payment-section-header">

          <div className="section-title-wrapper">

            <div className="section-icon paid">
              ✓
            </div>

            <div>
              <h2>
                Élèves ayant payé
              </h2>

              <p>
                {paidStudents.length} élève(s)
                ont réglé ce livre
              </p>
            </div>

          </div>

          <span className="section-count paid-count">
            {paidStudents.length}
          </span>

        </div>

        {filteredPaidStudents.length === 0 ? (
          <div className="section-empty">

            <div>
              {search ? '🔎' : '💳'}
            </div>

            <p>
              {search
                ? 'Aucun élève payé ne correspond à votre recherche.'
                : 'Aucun paiement enregistré pour le moment.'}
            </p>

          </div>
        ) : (
          <div className="students-list">

            {filteredPaidStudents.map(
              (item) => {
                const student =
                  item.student;

                const payment =
                  item.payment;

                return (
                  <div
                    className="student-payment-row paid-row"
                    key={student._id}
                  >

                    <div className="student-main">

                      <div className="student-avatar paid-avatar">
                        {(
                          student.firstName?.[0] ||
                          ''
                        ).toUpperCase()}

                        {(
                          student.lastName?.[0] ||
                          ''
                        ).toUpperCase()}
                      </div>

                      <div className="student-info">

                        <h3>
                          {student.firstName}{' '}
                          {student.lastName}
                        </h3>

                        <div className="student-details">

                          <span>
                            📱{' '}
                            {student.phone ||
                              'Téléphone non renseigné'}
                          </span>

                          <span>
                            👥{' '}
                            {student.groupId?.name ||
                              'Groupe non renseigné'}
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="payment-row-right">

                      <div className="payment-amount">

                        <strong>
                          {Number(
                            payment?.amount || 0
                          ).toFixed(2)}{' '}
                          DT
                        </strong>

                        <span>
                          {formatDate(
                            payment?.paymentDate
                          )}
                        </span>

                      </div>

                      <span className="paid-badge">
                        ✓ Payé
                      </span>

                      <button
                        className="cancel-payment-button"
                        onClick={() =>
                          handleCancelPayment(
                            payment
                          )
                        }
                        disabled={deleting}
                        title="Annuler le paiement"
                      >
                        ↩
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* =========================
          ÉLÈVES NON PAYÉS
      ========================= */}

      <section className="payment-section">

        <div className="payment-section-header">

          <div className="section-title-wrapper">

            <div className="section-icon unpaid">
              !
            </div>

            <div>

              <h2>
                Élèves n'ayant pas payé
              </h2>

              <p>
                {unpaidStudents.length} élève(s)
                en attente de paiement
              </p>

            </div>

          </div>

          <span className="section-count unpaid-count">
            {unpaidStudents.length}
          </span>

        </div>

        {filteredUnpaidStudents.length === 0 ? (
          <div className="section-empty success-empty">

            <div>
              {search ? '🔎' : '🎉'}
            </div>

            <p>
              {search
                ? 'Aucun élève non payé ne correspond à votre recherche.'
                : 'Tous les élèves ont payé ce livre !'}
            </p>

          </div>
        ) : (
          <div className="students-list">

            {filteredUnpaidStudents.map(
              (item) => {
                const student =
                  item.student;

                return (
                  <div
                    className="student-payment-row unpaid-row"
                    key={student._id}
                  >

                    <div className="student-main">

                      <div className="student-avatar unpaid-avatar">
                        {(
                          student.firstName?.[0] ||
                          ''
                        ).toUpperCase()}

                        {(
                          student.lastName?.[0] ||
                          ''
                        ).toUpperCase()}
                      </div>

                      <div className="student-info">

                        <h3>
                          {student.firstName}{' '}
                          {student.lastName}
                        </h3>

                        <div className="student-details">

                          <span>
                            📱{' '}
                            {student.phone ||
                              'Téléphone non renseigné'}
                          </span>

                          <span>
                            👥{' '}
                            {student.groupId?.name ||
                              'Groupe non renseigné'}
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="payment-row-right">

                      <div className="payment-amount expected">

                        <strong>
                          {Number(
                            book.price
                          ).toFixed(2)}{' '}
                          DT
                        </strong>

                        <span>
                          À payer
                        </span>

                      </div>

                      <span className="unpaid-badge">
                        ⏳ Non payé
                      </span>

                      <button
                        className="record-payment-button"
                        onClick={() =>
                          openPaymentModal(
                            item
                          )
                        }
                      >
                        <span>
                          +
                        </span>

                        Enregistrer le paiement
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* =========================
          MODAL PAIEMENT
      ========================= */}

      {showPaymentModal &&
        selectedStudent && (
          <div className="payment-modal-overlay">

            <div className="payment-modal">

              <div className="payment-modal-header">

                <div className="modal-header-content">

                  <div className="modal-payment-icon">
                    💳
                  </div>

                  <div>

                    <h2>
                      Enregistrer le paiement
                    </h2>

                    <p>
                      Saisissez les informations
                      du paiement.
                    </p>

                  </div>

                </div>

                <button
                  className="payment-modal-close"
                  onClick={closePaymentModal}
                  disabled={saving}
                >
                  ×
                </button>

              </div>

              {/* ÉLÈVE */}

              <div className="payment-student-card">

                <div className="modal-student-avatar">

                  {(
                    selectedStudent
                      .firstName?.[0] || ''
                  ).toUpperCase()}

                  {(
                    selectedStudent
                      .lastName?.[0] || ''
                  ).toUpperCase()}

                </div>

                <div>

                  <span>
                    Élève
                  </span>

                  <strong>
                    {selectedStudent.firstName}{' '}
                    {selectedStudent.lastName}
                  </strong>

                  <small>
                    {selectedStudent.groupId?.name ||
                      'Groupe non renseigné'}
                  </small>

                </div>

              </div>

              <form
                onSubmit={
                  handleSavePayment
                }
              >

                <div className="payment-form-grid">

                  <div className="payment-form-group">

                    <label>
                      Livre
                    </label>

                    <div className="readonly-field">

                      <span>
                        📘
                      </span>

                      <strong>
                        {book.name}
                      </strong>

                    </div>

                  </div>

                  <div className="payment-form-group">

                    <label>
                      Prix du livre
                    </label>

                    <div className="readonly-price">
                      {Number(
                        book.price
                      ).toFixed(2)}{' '}
                      DT
                    </div>

                  </div>

                  <div className="payment-form-group">

                    <label>
                      Montant payé
                    </label>

                    <div className="modal-price-input">

                      <input
                        type="number"
                        name="amount"
                        value={
                          paymentForm.amount
                        }
                        onChange={
                          handlePaymentChange
                        }
                        min="0"
                        step="0.01"
                        required
                        autoFocus
                      />

                      <span>
                        DT
                      </span>

                    </div>

                  </div>

                  <div className="payment-form-group">

                    <label>
                      Date du paiement
                    </label>

                    <input
                      className="modal-date-input"
                      type="date"
                      name="paymentDate"
                      value={
                        paymentForm.paymentDate
                      }
                      onChange={
                        handlePaymentChange
                      }
                      required
                    />

                  </div>

                </div>

                {/* CONFIRMATION */}

                <div className="payment-confirmation">

                  <div className="confirmation-icon">
                    ✓
                  </div>

                  <div>

                    <strong>
                      Paiement de{' '}
                      {paymentForm.amount ||
                        '0'}{' '}
                      DT
                    </strong>

                    <span>
                      pour{' '}
                      {
                        selectedStudent.firstName
                      }{' '}
                      {
                        selectedStudent.lastName
                      }
                    </span>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="payment-modal-actions">

                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={
                      closePaymentModal
                    }
                    disabled={saving}
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="modal-save-button"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="button-spinner"></span>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        ✓ Enregistrer le paiement
                      </>
                    )}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </div>
  );
}

export default LivrePaiements;