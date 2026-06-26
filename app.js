// ═══════════════════════════════════════
// app.js — هماهنگ‌کنندهٔ اصلی (Controller)
// ═══════════════════════════════════════

// ─── ۰. وارد کردن ماژول‌ها ───
import {
  validateForm,
  validateField,
  showError,
  clearError,
  clearAllErrors
} from './validation.js';

import { createPatient } from './patient.js';
import { renderList, clearForm, updateStats } from './ui.js';
import { fetchPatients, syncAddPatient, syncRemovePatient } from './api.js';


// ═══════════════════════════════════════
// ۱. راه‌اندازی اولیه (Initialization)
// ═══════════════════════════════════════

const init = async () => {
  try {
    // دریافت لیست اولیه از سرور Mock
    const patients = await fetchPatients();

    // رندر لیست و به‌روزرسانی آمار
    renderList(patients);
    updateStats(patients);

    return patients;
  } catch (err) {
    console.error('❌ خطا در راه‌اندازی اولیه:', err);
    alert('❌ خطا در بارگذاری داده‌ها از سرور');
    return [];
  }
};

// چون script type="module" است، Top-level await مجاز است.
// patients متغیر سراسری ما است که در طول جلسه بروز نگه می‌داریم.
let patients = await init();


// ═══════════════════════════════════════
// ۲. اعتبارسنجی لحظه‌ای (Real-time)
// ═══════════════════════════════════════

['name', 'age', 'phone'].forEach(fieldId => {
  const input = document.getElementById(fieldId);
  if (!input) return; // اگر المان وجود نداشت، رد شو

  // هنگام خروج از فیلد (blur) اعتبارسنجی کن
  input.addEventListener('blur', () => {
    const error = validateField(fieldId, input.value);
    if (error) {
      showError(fieldId, error);
    } else {
      clearError(fieldId);
    }
  });

  // هنگام تایپ، خطای قبلی را پاک کن
  // این کار تجربهٔ کاربری را بهتر می‌کند
  input.addEventListener('input', () => {
    clearError(fieldId);
  });
});


// ═══════════════════════════════════════
// ۳. ثبت بیمار جدید
// ═══════════════════════════════════════

document.getElementById('patientForm').addEventListener('submit', async (e) => {
  // ۳.۱ جلوگیری از رفرش صفحه (رفتار پیش‌فرض form)
  e.preventDefault();

  // ۳.۲ پاک کردن خطاهای قبلی از UI
  clearAllErrors();

  // ۳.۳ خواندن مقادیر فرم
  const formData = {
    name: document.getElementById('name').value,
    age: document.getElementById('age').value,
    phone: document.getElementById('phone').value
  };

  // ۳.۴ اعتبارسنجی
  const { isValid, errors } = validateForm(formData);

  if (!isValid) {
    // نمایش خطاها در UI
    Object.entries(errors).forEach(([fieldId, msg]) => showError(fieldId, msg));

    // فوکوس روی اولین فیلد خطادار (Accessibility)
    const firstErrorField = Object.keys(errors)[0];
    document.getElementById(firstErrorField)?.focus();

    return; // ⛔ خروج زودهنگام: اجازهٔ ثبت نده
  }

  // ۳.۵ ساخت آبجکت بیمار
  // توجه: age را با Number() تبدیل می‌کنیم چون input.value همیشه رشته است.
  const newPatient = createPatient(formData.name, Number(formData.age), formData.phone);

  try {
    // ارسال به سرور (json-server)
    await syncAddPatient(newPatient);

    // ۳.۶ همگام‌سازی مجدد با سرور
    patients = await fetchPatients();
    renderList(patients);
    updateStats(patients);

    // ۳.۷ پاک کردن فرم پس از ثبت موفق
    clearForm();

  } catch (err) {
    console.error('❌ خطا در ثبت بیمار:', err);
    alert('❌ خطا در ثبت بیمار');
  }
});


// ═══════════════════════════════════════
// ۴. حذف بیمار (Event Delegation)
// ═══════════════════════════════════════

document.getElementById('patientsList').addEventListener('click', async (e) => {
  // فقط اگر روی دکمهٔ حذف کلیک شد
  if (!e.target.classList.contains('delete-btn')) return;

  const card = e.target.closest('.card');
  if (!card) return;

  const id = Number(card.dataset.id);

  try {
    await syncRemovePatient(id);

    // به‌روزرسانی لیست پس از حذف
    patients = await fetchPatients();
    renderList(patients);
    updateStats(patients);
  } catch (err) {
    console.error('❌ خطا در حذف بیمار:', err);
    alert('❌ خطا در حذف بیمار');
  }
});

// ═══════════════════════════════════════
// ۵. جستجوی لحظه‌ای (Live Search)
// ═══════════════════════════════════════

document.getElementById('searchInput').addEventListener('input', (e) => {
  const term = e.target.value.trim();

  // اگر جستجو خالی بود، کل لیست را نشان بده؛
  // در غیر این صورت، فیلتر کن.
  const filtered = term
    ? patients.filter(p => p.name.includes(term))
    : patients;

  renderList(filtered);
});
