// === api.js ===
// لایهٔ ارتباط با سرور محلی (Local REST API)

const API_URL = 'http://localhost:3000/patients';

/**
 * دریافت لیست بیماران از سرور محلی
 */
export const fetchPatients = async () => {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error(`خطا در دریافت داده‌ها: ${res.status}`);
  }

  return await res.json();
};

/**
 * ثبت بیمار جدید در سرور
 */
export const syncAddPatient = async (patient) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patient)
  });

  if (!res.ok) {
    throw new Error(`خطا در ثبت بیمار: ${res.status}`);
  }

  return await res.json();
};

/**
 * حذف بیمار از سرور
 */
export const syncRemovePatient = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    throw new Error(`خطا در حذف بیمار: ${res.status}`);
  }

  return id;
};
