const API_URL =
  'http://localhost:5000/api/book-payments';

export const getBookPayments = async (
  bookId
) => {
  if (!bookId) {
    throw new Error(
      'ID du livre manquant'
    );
  }

  const response = await fetch(
    `${API_URL}/book/${bookId}`
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ||
        'Erreur lors du chargement des paiements'
    );
  }

  return response.json();
};

export const createBookPayment = async (
  data
) => {
  const response = await fetch(API_URL, {
    method: 'POST',

    headers: {
      'Content-Type':
        'application/json',
    },

    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ||
        'Erreur lors de l’enregistrement du paiement'
    );
  }

  return response.json();
};

export const updateBookPayment = async (
  id,
  data
) => {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: 'PUT',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ||
        'Erreur lors de la modification du paiement'
    );
  }

  return response.json();
};

export const deleteBookPayment = async (
  id
) => {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ||
        'Erreur lors de la suppression du paiement'
    );
  }

  return response.json();
};