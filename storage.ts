// storage.ts

const KEY = 'clinic_patients';

export const loadPatients = (): unknown[] => {
  const data = localStorage.getItem(KEY);
  return data ? (JSON.parse(data) as unknown[]) : [];
};

export const savePatients = (patients: unknown[]): void => {
  localStorage.setItem(KEY, JSON.stringify(patients));
};
