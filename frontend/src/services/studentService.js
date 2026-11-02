const API_URL = 'http://localhost:5000/api/students';

export const getStudents = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des élèves');
  }

  return response.json();
};

export const createStudent = async (student) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(student),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la création de l'élève");
  }

  return response.json();
};

export const updateStudent = async (id, student) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(student),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la modification de l'élève");
  }

  return response.json();
};

export const deleteStudent = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la suppression de l'élève");
  }

  return response.json();
};