import { getTodayPersian, normalizePersianDate } from './dateHelper.js';
export function renderList(patients) {
    const listElement = document.getElementById('patientsList');
    if (!listElement)
        return;
    listElement.innerHTML = '';
    if (patients.length === 0) {
        listElement.innerHTML = '<p class="empty-state">هنوز بیماری ثبت نشده...</p>';
        return;
    }
    const fragment = document.createDocumentFragment();
    patients.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'patient-card';
        if (p.id) {
            card.dataset.id = p.id;
        }
        card.innerHTML = `
  <div class="card-header">
    <h3>${p.name}</h3>
    <div class="card-actions">
      <button class="edit-btn" title="ویرایش">✎</button>
      <button class="delete-btn" title="حذف">×</button>
    </div>
  </div>
  <div class="patient-info">
    <p><span>سن:</span> ${p.age}</p>
    <p><span>تلفن:</span> ${p.phone}</p>
    ${p.date ? `<p><span>تاریخ مراجعه:</span> ${p.date}</p>` : ''}
    ${p.lastEdited ? `<p><span>آخرین ویرایش:</span> ${p.lastEdited}</p>` : ''}
  </div>
`;
        fragment.appendChild(card);
    });
    listElement.appendChild(fragment);
}
export function clearForm() {
    ['name', 'age', 'phone'].forEach((id) => {
        const input = document.getElementById(id);
        if (input)
            input.value = '';
    });
}
export function updateStats(patients) {
    const countElement = document.getElementById('totalPatients');
    if (countElement) {
        countElement.textContent = String(patients.length);
    }
}
export function updateTodayStats(patients) {
    const el = document.getElementById('newPatients');
    if (!el)
        return;
    const today = getTodayPersian();
    const count = patients.filter(p => {
        if (!p.date)
            return false;
        return normalizePersianDate(p.date) === today;
    }).length;
    el.textContent = String(count);
}
export function populateForm(patient) {
    const nameInput = document.getElementById('name');
    const ageInput = document.getElementById('age');
    const phoneInput = document.getElementById('phone');
    if (nameInput)
        nameInput.value = patient.name;
    if (ageInput)
        ageInput.value = String(patient.age);
    if (phoneInput)
        phoneInput.value = patient.phone;
}
