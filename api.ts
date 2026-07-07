// api.ts
import type { Patient } from './patient.js';

const API_URL = 'http://localhost:3000/patients';

export async function fetchPatients(): Promise<Patient[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('خطا در دریافت لیست بیماران');
  return res.json();
}

export async function syncAddPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patient),
  });
  if (!res.ok) throw new Error('خطا در ثبت بیمار');
  return res.json();
}

export async function syncRemovePatient(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('خطا در حذف بیمار');
}


//   تابع به‌روزرسانی
export async function syncUpdatePatient(
  id: string,
  data: Partial<Omit<Patient, 'id'>>
): Promise<Patient> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update patient ${id}`);
  return res.json();
}
