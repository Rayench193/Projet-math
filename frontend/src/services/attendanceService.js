const API_URL = 'http://localhost:5000/api/attendances';

export const getAttendances = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des présences');
  }

  return response.json();
};

export const createAttendance = async (attendance) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attendance),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Erreur lors de la création de la présence'
    );
  }

  return data;
};

export const updateAttendance = async (id, attendance) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attendance),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Erreur lors de la modification de la présence'
    );
  }

  return data;
};

export const deleteAttendance = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Erreur lors de la suppression de la présence'
    );
  }

  return data;
};