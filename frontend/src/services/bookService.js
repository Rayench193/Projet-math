const API_URL =
  'http://localhost:5000/api/books';

export const getBooks = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ||
        'Erreur lors du chargement des livres'
    );
  }

  return response.json();
};

export const getBook = async (id) => {
  const response = await fetch(
    `${API_URL}/${id}`
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ||
        'Erreur lors du chargement du livre'
    );
  }

  return response.json();
};

export const createBook = async (data) => {
  const response = await fetch(API_URL, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ||
        'Erreur lors de la création du livre'
    );
  }

  return response.json();
};

export const updateBook = async (
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
        'Erreur lors de la modification du livre'
    );
  }

  return response.json();
};

export const deleteBook = async (id) => {
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
        'Erreur lors de la suppression du livre'
    );
  }

  return response.json();
};