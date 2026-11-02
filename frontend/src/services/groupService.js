const API_URL = 'http://localhost:5000/api/groups';

export const getGroups = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(
      'Erreur lors de la récupération des groupes'
    );
  }

  return response.json();
};

export const createGroup = async (group) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(group),
  });

  if (!response.ok) {
    throw new Error(
      'Erreur lors de la création du groupe'
    );
  }

  return response.json();
};

export const updateGroup = async (id, group) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(group),
  });

  if (!response.ok) {
    throw new Error(
      'Erreur lors de la modification du groupe'
    );
  }

  return response.json();
};

export const deleteGroup = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(
      'Erreur lors de la suppression du groupe'
    );
  }

  return response.json();
};