// === api.js ===
// لایهٔ ارتباط با سرور (Data Layer)

const API_URL = 'https://jsonplaceholder.typicode.com/users';

/** شبیه‌سازی تأخیر شبکه (300 میلی‌ثانیه) */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * دریافت لیست اولیه بیماران.
 * اگر localStorage خالی باشد، از API می‌گیرد و فرمت می‌کند.
 * اگر دادهٔ محلی داشته باشیم، همان را برمی‌گرداند.
 */
export const fetchPatients = async () => {
  const localData = localStorage.getItem('clinic_patients');

  if (localData) {
    const parsed = JSON.parse(localData);
    if (parsed.length > 0) return parsed;
  }

  // درخواست واقعی به سرور
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error(`خطا در دریافت داده: ${res.status}`);
  }

  const users = await res.json();

  // تبدیل ساختار کاربران JSONPlaceholder به بیمار ما
  const patients = users.slice(0, 5).map(u => ({
    id: u.id,
    name: u.name,
    age: Math.floor(Math.random() * 40) + 20, // سن تصادفی بین ۲۰ تا ۶۰
    phone: u.phone?.split(' ')[0] || '09000000000',
    date: new Date().toLocaleDateString('fa-IR')
  }));

  // ذخیره در LocalStorage برای دفعهٔ بعد
  localStorage.setItem('clinic_patients', JSON.stringify(patients));
  return patients;
};

/**
 * ثبت بیمار جدید — شبیه‌سازی شده
 * در آینده اینجا fetch با method: 'POST' خواهد بود
 */
export const syncAddPatient = async (patient) => {
  await delay(300); // شبیه‌سازی زمان انتظار سرور

  const current = JSON.parse(localStorage.getItem('clinic_patients') || '[]');
  current.push(patient);
  localStorage.setItem('clinic_patients', JSON.stringify(current));

  return patient;
};

/**
 * حذف بیمار — شبیه‌سازی شده
 */
export const syncRemovePatient = async (id) => {
  await delay(300);

  let current = JSON.parse(localStorage.getItem('clinic_patients') || '[]');
  current = current.filter(p => p.id !== id);

  localStorage.setItem('clinic_patients', JSON.stringify(current));
  return id;
};
