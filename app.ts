// app.ts
import { fetchPatients, syncAddPatient, syncRemovePatient, syncUpdatePatient } from './api.js';
import { renderList, clearForm, updateStats, updateTodayStats, populateForm } from './ui.js';
import { getTodayPersian, toFarsiDigits, toLatinDigits } from './dateHelper.js';
import { createPatient, type Patient } from './patient.js';
import {
  validateForm,
  validateField,
  showError,
  clearError,
  clearAllErrors
} from './validation.js';

// ⭐ منتظر لود کامل DOM
document.addEventListener('DOMContentLoaded', () => {

  let patients: Patient[] = [];
  let editingPatientId: string | null = null;

  const form = document.getElementById('patientForm') as HTMLFormElement | null;
  const formTitle = document.getElementById('formTitle') as HTMLHeadingElement | null;
  const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;
  const cancelBtn = document.getElementById('cancelBtn') as HTMLButtonElement | null;
  const nameInput = document.getElementById('name') as HTMLInputElement | null;
  const ageInput = document.getElementById('age') as HTMLInputElement | null;
  const phoneInput = document.getElementById('phone') as HTMLInputElement | null;
  const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
  const patientsList = document.getElementById('patientsList') as HTMLElement | null;

  // ─── تبدیل اعداد فارسی به لاتین (استفاده از تابع مرکزی) ───
  function normalizeToLatin(str: string): string {
    return toLatinDigits(str);
  }

  // ─── اعتبارسنجی real-time روی blur/input ───
  (['name', 'age', 'phone'] as const).forEach((fieldId) => {
    const input = document.getElementById(fieldId) as HTMLInputElement | null;
    if (!input) return;

    input.addEventListener('blur', () => {
      const error = validateField(fieldId, input.value);
      if (error) showError(fieldId, error);
      else clearError(fieldId);
    });

    input.addEventListener('input', () => {
      clearError(fieldId);
    });
  });

  // ─── به‌روزرسانی لیست و آمار محلی ───
  function refreshUI(): void {
    renderList(patients);
    updateStats(patients);
    updateTodayStats(patients);
  }

  // ─── مدیریت حالت ویرایش در UI ───
  function enterEditMode(patient: Patient): void {
    editingPatientId = patient.id ?? null;

    if (formTitle) formTitle.textContent = '✏️ ویرایش بیمار';

    if (submitBtn) {
      submitBtn.textContent = '💾 به‌روزرسانی بیمار';
      submitBtn.classList.add('btn-edit');
    }

    cancelBtn?.classList.remove('hidden');

    populateForm(patient);
    form?.scrollIntoView({ behavior: 'smooth' });
    nameInput?.focus();
  }

  function exitEditMode(): void {
    editingPatientId = null;

    if (formTitle) formTitle.textContent = '📝 ثبت بیمار جدید';

    if (submitBtn) {
      submitBtn.textContent = '➕ ثبت بیمار';
      submitBtn.classList.remove('btn-edit');
    }

    cancelBtn?.classList.add('hidden');

    clearForm();
  }

  // ─── Submit (افزودن یا ویرایش) ───
  form?.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();
    clearAllErrors();

    // ⭐ تبدیل اعداد فارسی به لاتین قبل از اعتبارسنجی و ذخیره‌سازی
    const formData = {
      name: nameInput?.value ?? '',
      age: normalizeToLatin(ageInput?.value ?? ''),
      phone: normalizeToLatin(phoneInput?.value ?? ''),
    };

    const { isValid, errors } = validateForm(formData);

    if (!isValid) {
      (Object.keys(errors) as Array<keyof typeof errors>).forEach((fieldId) => {
        const msg = errors[fieldId];
        if (msg) showError(fieldId as 'name' | 'age' | 'phone', msg);
      });
      const firstErrorField = Object.keys(errors)[0] as 'name' | 'age' | 'phone';
      document.getElementById(firstErrorField)?.focus();
      return;
    }

    // داده‌های نهایی با اعداد لاتین برای ذخیره‌سازی
    const patientData = {
      name: String(formData.name).trim(),
      age: Number(formData.age),
      phone: String(formData.phone).trim(),
    };

    try {
      if (editingPatientId) {
        const existingPatient = patients.find((p) => p.id === editingPatientId);
        const updatedData = {
          ...patientData,
          date: existingPatient?.date ?? getTodayPersian(),
          lastEdited: getTodayPersian(),
        };
        const updated = await syncUpdatePatient(editingPatientId, updatedData);
        const index = patients.findIndex((p) => p.id === editingPatientId);
        if (index !== -1) patients[index] = updated;

        exitEditMode();
      } else {
        const newPatient = createPatient(
          patientData.name,
          patientData.age,
          patientData.phone
        );
        const saved = await syncAddPatient(newPatient);
        patients.push(saved);
        clearForm();
      }

      refreshUI();
    } catch (err) {
      console.error('❌ خطا:', err);
      alert('❌ خطا در عملیات');
    }
  });

  // ─── لغو ویرایش با کلیک ───
  cancelBtn?.addEventListener('click', () => {
    exitEditMode();
    refreshUI();
  });

  // ─── Delete (Event Delegation) ───
  patientsList?.addEventListener('click', async (e: Event) => {
    const target = e.target as HTMLElement;
    const deleteBtn = target.closest('.delete-btn') as HTMLElement | null;
    if (!deleteBtn) return;

    const card = deleteBtn.closest('.patient-card') as HTMLElement | null;
    const id = card?.dataset.id;
    if (!id) return;

    if (confirm('آیا از حذف این بیمار مطمئن هستید؟')) {
      try {
        await syncRemovePatient(id);
        patients = patients.filter((p) => p.id !== id);

        if (editingPatientId === id) {
          exitEditMode();
        }

        refreshUI();
      } catch (err) {
        console.error('❌ خطا در حذف بیمار:', err);
        alert('❌ خطا در حذف بیمار');
      }
    }
  });

  // ─── Edit (Event Delegation) ───
  patientsList?.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    const editBtn = target.closest('.edit-btn') as HTMLElement | null;
    if (!editBtn) return;

    const card = editBtn.closest('.patient-card') as HTMLElement | null;
    const id = card?.dataset.id;
    if (!id) return;

    const patient = patients.find((p) => p.id === id);
    if (!patient) return;

    enterEditMode(patient);
  });

  // ─── لغو ویرایش با Escape ───
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && editingPatientId) {
      exitEditMode();
      refreshUI();
    }
  });

// ─── Search ───
searchInput?.addEventListener('input', (e: Event) => {
  const rawTerm = (e.target as HTMLInputElement).value.trim();
  const term = normalizeToLatin(rawTerm); // ⭐ تبدیل ورودی جستجو به لاتین

  const filtered = term
    ? patients.filter((p) => normalizeToLatin(p.name).includes(term)) // ⭐ تبدیل نام بیمار هم به لاتین
    : patients;

  renderList(filtered);
  updateStats(patients);
  updateTodayStats(patients);
});

  // ─── راه‌اندازی ───
  async function init(): Promise<void> {
    try {
      patients = await fetchPatients();
      refreshUI();
      exitEditMode(); // ⭐ مطمئن می‌شه دکمه لغو مخفیه
    } catch (err) {
      console.error('❌ خطا در بارگذاری:', err);
    }
  }

  init();

}); // پایان DOMContentLoaded
