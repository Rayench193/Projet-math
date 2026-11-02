const API_URL = 'http://localhost:5000/api/sessions';

// Récupérer toutes les séances
export const getSessions = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des séances');
  }

  return response.json();
};

// Ajouter une séance
export const createSession = async (session) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(session),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la création de la séance');
  }

  return response.json();
};

// Modifier une séance
export const updateSession = async (id, session) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(session),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la modification de la séance');
  }

  return response.json();
};

// Supprimer une séance
export const deleteSession = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la suppression de la séance');
  }

  return response.json();
};