const KEY = 'clinic_patients';

export const loadPatients = () => {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

export const savePatients = (patients) => {
  localStorage.setItem(KEY, JSON.stringify(patients));
};
