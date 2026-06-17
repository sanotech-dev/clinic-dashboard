import { createPatient, removePatient } from './patient.js';
import { loadPatients, savePatients } from './storage.js';
import { renderList, getFormData, clearForm, updateStats } from './ui.js';

// ۱. بارگذاری اولیه
let patients = loadPatients();
renderList(patients);
updateStats(patients);

// ۲. گوش دادن به submit فرم (نه کلیک دکمه)
document.getElementById('patientForm').addEventListener('submit', (e) => {
  e.preventDefault(); // ← جلوی رفرش صفحه را می‌گیرد

  const data = getFormData();

  if (!data.name || !data.age || !data.phone) {
    alert('همهٔ فیلدها را پر کن');
    return;
  }

  const newPatient = createPatient(data.name, data.age, data.phone);
  patients = [...patients, newPatient];

  savePatients(patients);
  renderList(patients);
  updateStats(patients);
  clearForm();
});

// ۳. حذف بیمار
document.getElementById('patientsList').addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = Number(e.target.closest('.card').dataset.id);
    patients = removePatient(patients, id);
    savePatients(patients);
    renderList(patients);
    updateStats(patients);
  }
});
// ۴. جستج لحظه‌ای (هر بار کاربر تایپ می‌کند)
document.getElementById('searchInput').addEventListener('input', (e) => {
  const term = e.target.value.trim();  // مقدار داخل جستجو

  // اگه چیزی ننوشته، همه را نشان بده
  // اگه چیزی نوشته، فقط بیمارانی که اسمشان شامل آن عبارت است
  const filtered = term
    ? patients.filter(p => p.name.includes(term))
    : patients;

  renderList(filtered);
});
