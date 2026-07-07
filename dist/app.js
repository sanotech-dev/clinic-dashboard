// app.ts
import { fetchPatients, syncAddPatient, syncRemovePatient, syncUpdatePatient } from './api.js';
import { renderList, clearForm, updateStats, updateTodayStats, populateForm } from './ui.js';
import { getTodayPersian } from './dateHelper.js';
import { createPatient } from './patient.js';
import { validateForm, validateField, showError, clearError, clearAllErrors, } from './validation.js';
// ⭐ منتظر لود کامل DOM
document.addEventListener('DOMContentLoaded', () => {
    let patients = [];
    let editingPatientId = null;
    const form = document.getElementById('patientForm');
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const nameInput = document.getElementById('name');
    const ageInput = document.getElementById('age');
    const phoneInput = document.getElementById('phone');
    const searchInput = document.getElementById('searchInput');
    const patientsList = document.getElementById('patientsList');
    // ─── تبدیل اعداد فارسی به انگلیسی ───
    function toEnglishDigits(str) {
        return str.replace(/[\u06F0-\u06F9]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x06f0 + 0x0030));
    }
    [ageInput, phoneInput].forEach((input) => {
        input?.addEventListener('input', (e) => {
            const target = e.target;
            target.value = toEnglishDigits(target.value);
        });
    });
    // ─── اعتبارسنجی real-time روی blur/input ───
    ['name', 'age', 'phone'].forEach((fieldId) => {
        const input = document.getElementById(fieldId);
        if (!input)
            return;
        input.addEventListener('blur', () => {
            const error = validateField(fieldId, input.value);
            if (error)
                showError(fieldId, error);
            else
                clearError(fieldId);
        });
        input.addEventListener('input', () => {
            clearError(fieldId);
        });
    });
    // ─── به‌روزرسانی لیست و آمار محلی ───
    function refreshUI() {
        renderList(patients);
        updateStats(patients);
        updateTodayStats(patients);
    }
    // ─── مدیریت حالت ویرایش در UI ───
    function enterEditMode(patient) {
        editingPatientId = patient.id ?? null;
        if (formTitle)
            formTitle.textContent = '✏️ ویرایش بیمار';
        if (submitBtn) {
            submitBtn.textContent = '💾 به‌روزرسانی بیمار';
            submitBtn.classList.add('btn-edit');
        }
        cancelBtn?.classList.remove('hidden');
        populateForm(patient);
        form?.scrollIntoView({ behavior: 'smooth' });
        nameInput?.focus();
    }
    function exitEditMode() {
        editingPatientId = null;
        if (formTitle)
            formTitle.textContent = '📝 ثبت بیمار جدید';
        if (submitBtn) {
            submitBtn.textContent = '➕ ثبت بیمار';
            submitBtn.classList.remove('btn-edit');
        }
        cancelBtn?.classList.add('hidden');
        clearForm();
    }
    // ─── Submit (افزودن یا ویرایش) ───
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors();
        const formData = {
            name: nameInput?.value ?? '',
            age: ageInput?.value ?? '',
            phone: phoneInput?.value ?? '',
        };
        const { isValid, errors } = validateForm(formData);
        if (!isValid) {
            Object.keys(errors).forEach((fieldId) => {
                const msg = errors[fieldId];
                if (msg)
                    showError(fieldId, msg);
            });
            const firstErrorField = Object.keys(errors)[0];
            document.getElementById(firstErrorField)?.focus();
            return;
        }
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
                if (index !== -1)
                    patients[index] = updated;
                exitEditMode();
            }
            else {
                const newPatient = createPatient(patientData.name, patientData.age, patientData.phone);
                const saved = await syncAddPatient(newPatient);
                patients.push(saved);
                clearForm();
            }
            refreshUI();
        }
        catch (err) {
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
    patientsList?.addEventListener('click', async (e) => {
        const target = e.target;
        const deleteBtn = target.closest('.delete-btn');
        if (!deleteBtn)
            return;
        const card = deleteBtn.closest('.patient-card');
        const id = card?.dataset.id;
        if (!id)
            return;
        if (confirm('آیا از حذف این بیمار مطمئن هستید؟')) {
            try {
                await syncRemovePatient(id);
                patients = patients.filter((p) => p.id !== id);
                if (editingPatientId === id) {
                    exitEditMode();
                }
                refreshUI();
            }
            catch (err) {
                console.error('❌ خطا در حذف بیمار:', err);
                alert('❌ خطا در حذف بیمار');
            }
        }
    });
    // ─── Edit (Event Delegation) ───
    patientsList?.addEventListener('click', (e) => {
        const target = e.target;
        const editBtn = target.closest('.edit-btn');
        if (!editBtn)
            return;
        const card = editBtn.closest('.patient-card');
        const id = card?.dataset.id;
        if (!id)
            return;
        const patient = patients.find((p) => p.id === id);
        if (!patient)
            return;
        enterEditMode(patient);
    });
    // ─── لغو ویرایش با Escape ───
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && editingPatientId) {
            exitEditMode();
            refreshUI();
        }
    });
    // ─── Search ───
    searchInput?.addEventListener('input', (e) => {
        const term = e.target.value.trim();
        const filtered = term ? patients.filter((p) => p.name.includes(term)) : patients;
        renderList(filtered);
        updateStats(patients);
        updateTodayStats(patients);
    });
    // ─── راه‌اندازی ───
    async function init() {
        try {
            patients = await fetchPatients();
            refreshUI();
            exitEditMode(); // ⭐ مطمئن می‌شه دکمه لغو مخفیه
        }
        catch (err) {
            console.error('❌ خطا در بارگذاری:', err);
        }
    }
    init();
}); // پایان DOMContentLoaded
