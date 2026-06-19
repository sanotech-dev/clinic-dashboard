// === patient.js ===

export const createPatient = (name, age, phone) => ({
  name,
  age: Number(age),
  phone,
  date: new Date().toLocaleDateString('fa-IR')
});

export const removePatient = (patients, id) => {
  return patients.filter(p => p.id !== id);
};
