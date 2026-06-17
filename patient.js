export const createPatient = (name, age, phone) => {
  return {
    id: Date.now(),
    name: name,
    age: Number(age),
    phone: phone,
    date: new Date().toLocaleDateString('fa-IR')
  };
};

export const removePatient = (patients, id) => {
  return patients.filter(p => p.id !== id);
};
