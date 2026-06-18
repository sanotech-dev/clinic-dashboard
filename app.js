import { createPatient, removePatient } from './patient.js';
import { loadPatients, savePatients } from './storage.js'; // فعلاً غیرفعالشان می‌کنیم یا حذف
import { renderList, getFormData, clearForm, updateStats } from './ui.js';
import { fetchPatients, syncAddPatient, syncRemovePatient } from './api.js';

// ─── ۱. راه‌اندازی اولیه ───
const init = async () => {
  try {
    const patients = await fetchPatients();
    renderList(patients);
    updateStats(patients);

    // ذخیره در متغیر سراسری یا return کردن
    return patients;
  } catch (err) {
    console.error(err);
    alert('❌ خطا در بارگذاری داده‌ها از سرور');
    return [];
  }
};

let patients = await init();  // Top-level await (چون module هستیم)

// ─── ۲. ثبت بیمار جدید ───
document.getElementById('patientForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = getFormData();

  if (!data.name || !data.age || !data.phone) {
    alert('همهٔ فیلدها را پر کن');
    return;
  }

  const newPatient = createPatient(data.name, data.age, data.phone);

  try {
    await syncAddPatient(newPatient);

    // دوباره لود کن تا مطمئن شوی با سرور همگام است
    patients = await fetchPatients();
    renderList(patients);
    updateStats(patients);
    clearForm();
  } catch (err) {
    console.error(err);
    alert('❌ خطا در ثبت بیمار');
  }
});

// ─── ۳. حذف بیمار ───
document.getElementById('patientsList').addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = Number(e.target.closest('.card').dataset.id);

    try {
      await syncRemovePatient(id);

      patients = await fetchPatients();
      renderList(patients);
      updateStats(patients);
    } catch (err) {
      console.error(err);
      alert('❌ خطا در حذف بیمار');
    }
  }
});

// ─── ۴. جستج لحظه‌ای ───
document.getElementById('searchInput').addEventListener('input', (e) => {
  const term = e.target.value.trim();
  const filtered = term
    ? patients.filter(p => p.name.includes(term))
    : patients;
  renderList(filtered);
});
