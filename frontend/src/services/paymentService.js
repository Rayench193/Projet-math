const API_URL = 'http://localhost:5000/api/payments';

// ==========================================
// GET — Tous les paiements
// ==========================================

export const getPayments = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des paiements');
  }

  return response.json();
};


// ==========================================
// POST — Créer un paiement
// ==========================================

export const createPayment = async (payment) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payment),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Erreur lors de la création du paiement'
    );
  }

  return data;
};


// ==========================================
// PUT — Modifier un paiement
// ==========================================

export const updatePayment = async (id, payment) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payment),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Erreur lors de la modification du paiement'
    );
  }

  return data;
};


// ==========================================
// DELETE — Supprimer un paiement
// ==========================================

export const deletePayment = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Erreur lors de la suppression du paiement'
    );
  }

  return data;
};