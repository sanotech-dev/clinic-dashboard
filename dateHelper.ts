// dateHelper.ts
// ═══════════════════════════════════════════
// تبدیل اعداد فارسی/عربی/لاتین
// ═══════════════════════════════════════════

const ARABIC_TO_FARSI: Record<string, string> = {
  '٠': '۰', '١': '۱', '٢': '۲', '٣': '۳', '٤': '۴',
  '٥': '۵', '٦': '۶', '٧': '۷', '٨': '۸', '٩': '۹'
};

const LATIN_TO_FARSI: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
};

const FARSI_TO_LATIN: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
};

/** تبدیل اعداد عربی و لاتین به فارسی (برای نمایش) */
export function toFarsiDigits(str: string): string {
  return str
    .replace(/[٠-٩]/g, ch => ARABIC_TO_FARSI[ch] ?? ch)
    .replace(/[0-9]/g, ch => LATIN_TO_FARSI[ch] ?? ch);
}

/** تبدیل اعداد فارسی و عربی به لاتین (برای ذخیره‌سازی و اعتبارسنجی) */
export function toLatinDigits(str: string): string {
  return str.replace(/[۰-۹٠-٩]/g, ch => {
    const code = ch.charCodeAt(0);
    if (code >= 0x06F0 && code <= 0x06F9) return String.fromCharCode(code - 0x06F0 + 0x0030); // فارسی
    if (code >= 0x0660 && code <= 0x0669) return String.fromCharCode(code - 0x0660 + 0x0030); // عربی
    return ch;
  });
}

/** تبدیل اعداد فارسی به لاتین (برای ذخیره‌سازی) */
export function farsiToLatin(str: string): string {
  return str.replace(/[۰-۹]/g, ch => FARSI_TO_LATIN[ch] ?? ch);
}

// ═══════════════════════════════════════════
// توابع تاریخ
// ═══════════════════════════════════════════

/** نرمال‌سازی تاریخ - همیشه خروجی فارسی استاندارد */
export function normalizePersianDate(dateStr: string): string {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;

  const [y, m, d] = parts.map(toLatinDigits).map(Number);

  // ساخت تاریخ با اعداد فارسی استاندارد
  const yFa = toFarsiDigits(String(y).padStart(4, '0'));
  const mFa = toFarsiDigits(String(m).padStart(2, '0'));
  const dFa = toFarsiDigits(String(d).padStart(2, '0'));

  return `${yFa}/${mFa}/${dFa}`;
}

/** گرفتن تاریخ امروز به فرمت فارسی استاندارد */
export function getTodayPersian(): string {
  const d = new Date();
  // استفاده از nu-latn برای گرفتن اعداد لاتین، سپس تبدیل به فارسی
  const fmt = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = fmt.formatToParts(d);
  const y = parts.find(p => p.type === 'year')?.value ?? '';
  const m = parts.find(p => p.type === 'month')?.value ?? '';
  const day = parts.find(p => p.type === 'day')?.value ?? '';

  // تبدیل اعداد لاتین به فارسی استاندارد
  return toFarsiDigits(`${y}/${m}/${day}`);
}
