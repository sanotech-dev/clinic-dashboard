// patient.ts
export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  date: string;           // تاریخ ثبت/مراجعه
  lastEdited?: string;    // تاریخ آخرین ویرایش
}

import { getTodayPersian } from './dateHelper.js';

export function createPatient(
  name: string,
  age: number,
  phone: string
): Omit<Patient, 'id'> {
  return {
    name,
    age,
    phone,
    date: getTodayPersian(),
  };
}
