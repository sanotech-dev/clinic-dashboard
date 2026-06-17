// ═══════════════════════════════════════════════════════════
// داشبورد مدیریت بیماران — درس ۳: حذف، جستجو و LocalStorage
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// بخش ۱: متغیرها و داده‌ها
// ═══════════════════════════════════════════════════════════

let patients = [];
let totalPatients = 0;
let newPatientsToday = 0;

// ═══════════════════════════════════════════════════════════
// بخش ۲: گرفتن المان‌های DOM
// ═══════════════════════════════════════════════════════════
// همهٔ المان‌ها در ابتدا و یک‌جا گرفته می‌شن تا خطای
// "قبل از تعریف استفاده شده" پیش نیاد.

const patientForm   = document.getElementById('patientForm');
const nameInput     = document.getElementById('name');
const ageInput      = document.getElementById('age');
const phoneInput    = document.getElementById('phone');
const searchInput   = document.getElementById('searchInput'); // ← همین‌جا تعریف شد

const totalEl       = document.getElementById('totalPatients');
const newEl         = document.getElementById('newPatients');
const listEl        = document.getElementById('patientsList');

// ═══════════════════════════════════════════════════════════
// بخش ۳: توابع کمکی (Utility Functions)
// ═══════════════════════════════════════════════════════════

/** بروزرسانی نمایش آمار روی صفحه **/
function updateStats() {
    totalEl.textContent = totalPatients;
    newEl.textContent   = newPatientsToday;
}

/**
 * ساخت کارت HTML برای یک بیمار
 * data-id برای شناسایی هنگام حذف استفاده می‌شه.
 */
function createPatientCard(patient) {
    return `
        <article class="patient-card" data-id="${patient.id}">
            <div class="card-header">
                <h3>${patient.name}</h3>
                <button class="delete-btn" title="حذف بیمار">×</button>
            </div>
            <p class="patient-info"><span>سن:</span> ${patient.age} سال</p>
            <p class="patient-info"><span>تلفن:</span> ${patient.phone}</p>
            <p class="patient-info"><span>تاریخ ثبت:</span> ${patient.date}</p>
        </article>
    `;
}

/** ذخیرهٔ آرایه بیماران در LocalStorage (تبدیل به رشتهٔ JSON) **/
function savePatients() {
    localStorage.setItem('clinicPatients', JSON.stringify(patients));
}

/**
 * بارگذاری بیماران از LocalStorage هنگام باز شدن صفحه
 * اگه داده‌ای نباشه، هیچ‌کاری نمی‌کنه.
 */
function loadPatients() {
    const stored = localStorage.getItem('clinicPatients');
    if (stored) {
        patients = JSON.parse(stored);
        totalPatients = patients.length;

        const today = new Date().toLocaleDateString('fa-IR');
        newPatientsToday = patients.filter(p => p.date === today).length;

        updateStats();
        renderPatients();
    }
}

/**
 * حذف بیمار بر اساس شناسه (id)
 * بعد از حذف، آمار از نو محاسبه و UI بروز می‌شه.
 */
function deletePatient(id) {
    // فقط بیمارانی که idشان برابر نیست را نگه می‌داریم
    patients = patients.filter(p => p.id !== id);

    totalPatients = patients.length;
    const today = new Date().toLocaleDateString('fa-IR');
    newPatientsToday = patients.filter(p => p.date === today).length;

    updateStats();
    renderPatients();
    savePatients();
}

/**
 * نمایش لیست بیماران
 * @param {Array} list — آرایه‌ای که باید نمایش داده شود (پیش‌فرض: patients)
 *
 * نکتهٔ مهم: حتماً از همان پارامتر 'list' برای .map استفاده کن،
 * نه متغیر سراسری 'patients'، وگرArgs جستجو کار نمی‌کنه.
 */
function renderPatients(list = patients) {
    if (list.length === 0) {
        listEl.innerHTML = '<p class="empty-state">موردی یافت نشد</p>';
        return;
    }
    listEl.innerHTML = list.map(createPatientCard).join('');
}

// ═══════════════════════════════════════════════════════════
// بخش ۴: مدیریت رویدادها (Event Handlers)
// ═══════════════════════════════════════════════════════════
// ترتیب: فرم → حذف → جستجو

// ─── ۴-۱ ثبت بیمار جدید ───
patientForm.addEventListener('submit', function(event) {
    event.preventDefault(); // جلوگیری از رفرش صفحه

    const nameValue  = nameInput.value.trim();
    const ageValue   = parseInt(ageInput.value);
    const phoneValue = phoneInput.value.trim();

    // اعتبارسنجی ساده
    if (!nameValue || !ageValue || !phoneValue) {
        alert('لطفاً همه فیلدها رو پر کنید!');
        return;
    }

    const newPatient = {
        id: Date.now(), // شناسهٔ یکتا بر اساس زمان فعلی
        name: nameValue,
        age: ageValue,
        phone: phoneValue,
        date: new Date().toLocaleDateString('fa-IR')
    };

    patients.push(newPatient);
    totalPatients++;
    newPatientsToday++;

    updateStats();
    renderPatients();
    savePatients();

    patientForm.reset();
    nameInput.focus();

    console.log('✅ بیمار جدید ثبت شد:', newPatient);
});

// ─── ۴-۲ حذف بیمار با Event Delegation ───
// یک Listener روی کل لیست می‌ذاریم، نه روی هر دکمه به‌تنهایی.
listEl.addEventListener('click', function(e) {
    const deleteBtn = e.target.closest('.delete-btn');
    if (!deleteBtn) return; // اگه روی دکمهٔ حذف کلیک نشده، کاری نکن

    const card = deleteBtn.closest('.patient-card');
    const id   = parseInt(card.dataset.id); // dataset.id = مقدار data-id

    if (confirm('آیا از حذف این بیمار مطمئنید؟')) {
        deletePatient(id);
    }
});

// ─── ۴-۳ جستجوی زنده (Live Search) ───
searchInput.addEventListener('input', function(e) {
    const term = e.target.value.trim();

    if (term === '') {
        renderPatients(); // نمایش همه
        return;
    }

    // filter: فقط بیمارانی که نامشان شامل متن جستجو است
    const filtered = patients.filter(p => p.name.includes(term));
    renderPatients(filtered);
});

// ═══════════════════════════════════════════════════════════
// بخش ۵: اجرای اولیه
// ═══════════════════════════════════════════════════════════

console.log('🏥 داشبورد کلینیک بارگذاری شد!');

// بارگذاری داده‌های قبلی از حافظهٔ مرورگر
loadPatients();
