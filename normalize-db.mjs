// normalize-db.mjs
// نحو اجرا
// cd clinic-dashboard
// node normalize-db.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════════
// توابع تبدیل اعداد
// ═══════════════════════════════════════════

const ARABIC_TO_FARSI = {
  '٠': '۰', '١': '۱', '٢': '۲', '٣': '۳', '٤': '۴',
  '٥': '۵', '٦': '۶', '٧': '۷', '٨': '۸', '٩': '۹',
};

const LATIN_TO_FARSI = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
};

/** تبدیل اعداد عربی و لاتین به فارسی (برای نمایش) */
function toFarsiDigits(str) {
  return str
    .replace(/[٠-٩]/g, (ch) => ARABIC_TO_FARSI[ch] ?? ch)
    .replace(/[0-9]/g, (ch) => LATIN_TO_FARSI[ch] ?? ch);
}

/** تبدیل اعداد فارسی و عربی به لاتین (برای ذخیره‌سازی استاندارد) */
function toLatinDigits(str) {
  return str.replace(/[۰-۹٠-٩]/g, (ch) => {
    const code = ch.charCodeAt(0);
    if (code >= 0x06F0 && code <= 0x06F9) return String(code - 0x06F0); // فارسی
    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660); // عربی
    return ch;
  });
}

// ═══════════════════════════════════════════
// توابع نرمال‌سازی
// ═══════════════════════════════════════════

/** نرمال‌سازی تاریخ: همیشه فرمت YYYY/MM/DD با اعداد فارسی */
function normalizePersianDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return dateStr;

  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;

  const [y, m, d] = parts.map(toLatinDigits).map(Number);

  // اعتبارسنجی اعداد
  if (isNaN(y) || isNaN(m) || isNaN(d)) return dateStr;

  const yFa = toFarsiDigits(String(y).padStart(4, '0'));
  const mFa = toFarsiDigits(String(m).padStart(2, '0'));
  const dFa = toFarsiDigits(String(d).padStart(2, '0'));

  return `${yFa}/${mFa}/${dFa}`;
}

/** نرمال‌سازی شماره تلفن: همیشه لاتین و استاندارد */
function normalizePhone(phoneStr) {
  if (!phoneStr || typeof phoneStr !== 'string') return phoneStr;

  // تبدیل به لاتین و حذف فاصله‌ها و خط تیره
  return toLatinDigits(phoneStr).replace(/[\s\-]/g, '');
}

// ═══════════════════════════════════════════
// اجرای اصلی
// ═══════════════════════════════════════════

const DB_PATH = './db.json';
const BACKUP_DIR = './backups';

try {
  // بررسی وجود فایل
  if (!existsSync(DB_PATH)) {
    console.error(`❌ فایل ${DB_PATH} یافت نشد!`);
    process.exit(1);
  }

  // ساخت پوشه بک‌آپ
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // بک‌آپ قبل از تغییر
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = join(BACKUP_DIR, `db-backup-${timestamp}.json`);
  const dbRaw = readFileSync(DB_PATH, 'utf-8');
  writeFileSync(backupPath, dbRaw);
  console.log(`💾 بک‌آپ گرفته شد: ${backupPath}`);

  // نرمال‌سازی
  const db = JSON.parse(dbRaw);

  if (!db.patients || !Array.isArray(db.patients)) {
    console.error('❌ ساختار db.json نامعتبر است!');
    process.exit(1);
  }

  const beforeCount = db.patients.length;

  db.patients = db.patients.map((p, index) => {
    console.log(`🔄 پردازش رکورد ${index + 1}/${beforeCount}: ${p.name || 'بدون نام'}`);

    return {
      ...p,
      date: normalizePersianDate(p.date),
      lastEdited: p.lastEdited ? normalizePersianDate(p.lastEdited) : undefined,
      phone: normalizePhone(p.phone)
    };
  });

  // ذخیره با فرمت زیبا
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');

  console.log('');
  console.log('✅ نرمال‌سازی با موفقیت انجام شد:');
  console.log(`   • ${beforeCount} رکورد پردازش شد`);
  console.log(`   • تاریخ‌ها به فرمت فارسی استاندارد (YYYY/MM/DD)`);
  console.log(`   • شماره تلفن‌ها به فرمت لاتین استاندارد`);
  console.log(`📁 فایل اصلی به‌روزرسانی شد: ${DB_PATH}`);

} catch (error) {
  console.error('❌ خطا در اجرای اسکریپت:', error.message);
  process.exit(1);
}
