import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
} from '../../services/bookService';

import './Livres.css';

function Livres() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [bookToDelete, setBookToDelete] =
    useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* =========================
     CHARGER LES LIVRES
  ========================= */

  const loadBooks = async () => {
    try {
      setLoading(true);

      const data = await getBooks();

      setBooks(data);
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          'Erreur lors du chargement des livres'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  /* =========================
     RECHERCHE
  ========================= */

  const filteredBooks = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return books;
    }

    return books.filter((book) =>
      book.name.toLowerCase().includes(value)
    );
  }, [books, search]);

  /* =========================
     FORMULAIRE
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingBook(null);

    setFormData({
      name: '',
      price: '',
    });

    setShowForm(true);
  };

  const openEditForm = (book) => {
    setEditingBook(book);

    setFormData({
      name: book.name,
      price: book.price,
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingBook(null);

    setFormData({
      name: '',
      price: '',
    });
  };

  /* =========================
     AJOUT / MODIFICATION
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const price = Number(formData.price);

    if (!name) {
      alert('Veuillez saisir le nom du livre.');
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      alert('Veuillez saisir un prix valide.');
      return;
    }

    try {
      setSaving(true);

      const data = {
        name,
        price,
      };

      if (editingBook) {
        const updatedBook = await updateBook(
          editingBook._id,
          data
        );

        setBooks((prev) =>
          prev.map((book) =>
            book._id === editingBook._id
              ? updatedBook
              : book
          )
        );
      } else {
        const newBook = await createBook(data);

        setBooks((prev) => [
          newBook,
          ...prev,
        ]);
      }

      closeForm();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          'Erreur lors de l’enregistrement du livre'
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     SUPPRESSION
  ========================= */

  const openDeleteModal = (book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setBookToDelete(null);
  };

  const handleDelete = async () => {
    if (!bookToDelete) return;

    try {
      setDeleting(true);

      await deleteBook(bookToDelete._id);

      setBooks((prev) =>
        prev.filter(
          (book) =>
            book._id !== bookToDelete._id
        )
      );

      closeDeleteModal();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          'Erreur lors de la suppression du livre'
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =========================
     AFFICHAGE
  ========================= */

  return (
    <div className="livres-page">

      {/* ================= HEADER ================= */}

      <div className="livres-header">

        <div className="livres-title">

          <div className="livres-title-icon">
            📚
          </div>

          <div>
            <h1>Livres</h1>

            <p>
              Gestion des livres et des paiements
            </p>
          </div>

        </div>

        <button
          className="btn-add-book"
          onClick={openAddForm}
        >
          <span>＋</span>
          Ajouter un livre
        </button>

      </div>

      {/* ================= STATISTIQUES ================= */}

      <div className="books-stats">

        <div className="book-stat-card">

          <div className="book-stat-icon blue">
            📚
          </div>

          <div>
            <span>Total livres</span>
            <strong>{books.length}</strong>
          </div>

        </div>

        <div className="book-stat-card">

          <div className="book-stat-icon green">
            💰
          </div>

          <div>
            <span>Prix moyen</span>

            <strong>
              {books.length > 0
                ? (
                    books.reduce(
                      (total, book) =>
                        total + Number(book.price || 0),
                      0
                    ) / books.length
                  ).toFixed(2)
                : '0.00'}{' '}
              DT
            </strong>
          </div>

        </div>

      </div>

      {/* ================= RECHERCHE ================= */}

      <div className="books-toolbar">

        <div className="books-search">

          <span>🔎</span>

          <input
            type="text"
            placeholder="Rechercher un livre..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch('')}
            >
              ×
            </button>
          )}

        </div>

        <div className="books-count">
          {filteredBooks.length}{' '}
          {filteredBooks.length <= 1
            ? 'livre'
            : 'livres'}
        </div>

      </div>

      {/* ================= FORMULAIRE ================= */}

      {showForm && (
        <div className="book-form-card">

          <div className="form-card-header">

            <div>
              <h2>
                {editingBook
                  ? 'Modifier le livre'
                  : 'Ajouter un livre'}
              </h2>

              <p>
                {editingBook
                  ? 'Modifiez les informations du livre.'
                  : 'Ajoutez un nouveau livre à votre liste.'}
              </p>
            </div>

            <button
              className="form-close"
              onClick={closeForm}
              disabled={saving}
            >
              ×
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Nom du livre
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex : Limite et continuité"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Prix du livre
                </label>

                <div className="price-input">

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="10"
                    required
                  />

                  <span>DT</span>

                </div>

              </div>

            </div>

            <div className="book-form-actions">

              <button
                type="button"
                className="btn-form-cancel"
                onClick={closeForm}
                disabled={saving}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="btn-form-save"
                disabled={saving}
              >
                {saving
                  ? 'Enregistrement...'
                  : editingBook
                  ? 'Enregistrer les modifications'
                  : 'Ajouter le livre'}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* ================= CONTENU ================= */}

      {loading ? (
        <div className="livres-state">

          <div className="loading-spinner"></div>

          <h3>Chargement des livres...</h3>

          <p>
            Veuillez patienter.
          </p>

        </div>
      ) : filteredBooks.length === 0 ? (

        <div className="livres-state">

          <div className="empty-book-icon">
            {search ? '🔎' : '📚'}
          </div>

          <h3>
            {search
              ? 'Aucun livre trouvé'
              : 'Aucun livre'}
          </h3>

          <p>
            {search
              ? 'Aucun livre ne correspond à votre recherche.'
              : 'Commencez par ajouter votre premier livre.'}
          </p>

          {!search && (
            <button
              className="empty-add-button"
              onClick={openAddForm}
            >
              ＋ Ajouter un livre
            </button>
          )}

        </div>

      ) : (

        <div className="books-grid">

          {filteredBooks.map((book) => (

            <div
              className="book-card"
              key={book._id}
            >

              <div className="book-card-top">

                <div className="book-cover">
                  📘
                </div>

                <div className="book-menu">
                  <button
                    onClick={() =>
                      openEditForm(book)
                    }
                    title="Modifier"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() =>
                      openDeleteModal(book)
                    }
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>

              </div>

              <div className="book-card-content">

                <span className="book-label">
                  LIVRE
                </span>

                <h2>
                  {book.name}
                </h2>

                <div className="book-price-display">
                  <strong>
                    {Number(book.price).toFixed(2)}
                  </strong>

                  <span>DT</span>
                </div>

              </div>

              <div className="book-card-footer">

                <button
                  className="btn-book-payments"
                  onClick={() =>
                    navigate(
                      `/livres/${book._id}/paiements`
                    )
                  }
                >
                  <span>👥</span>
                  Gérer les paiements
                  <span className="arrow">
                    →
                  </span>
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

      {/* ================= MODAL SUPPRESSION ================= */}

      {showDeleteModal && bookToDelete && (

        <div className="modal-overlay">

          <div className="delete-modal">

            <div className="delete-modal-icon">
              🗑️
            </div>

            <h2>
              Supprimer le livre ?
            </h2>

            <p>
              Voulez-vous vraiment supprimer
              <strong>
                {' '}
                « {bookToDelete.name} »
              </strong>
              ?
            </p>

            <span className="delete-warning">
              Cette action est irréversible.
            </span>

            <div className="delete-modal-actions">

              <button
                className="delete-cancel"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Annuler
              </button>

              <button
                className="delete-confirm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? 'Suppression...'
                  : 'Oui, supprimer'}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Livres;