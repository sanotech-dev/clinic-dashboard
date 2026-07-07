// dateHelper.ts
const ARABIC_TO_FARSI = {
    '٠': '۰', '١': '۱', '٢': '۲', '٣': '۳', '٤': '۴',
    '٥': '۵', '٦': '۶', '٧': '۷', '٨': '۸', '٩': '۹'
};
const LATIN_TO_FARSI = {
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
    '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
};
/** تبدیل هر سه نوع عدد (عربی، لاتین) به فارسی */
export function toFarsiDigits(str) {
    return str
        .replace(/[٠-٩]/g, ch => ARABIC_TO_FARSI[ch] ?? ch)
        .replace(/[0-9]/g, ch => LATIN_TO_FARSI[ch] ?? ch);
}
/** تبدیل اعداد فارسی/عربی به لاتین (برای مقایسه) */
export function toLatinDigits(str) {
    return str.replace(/[۰-۹٠-٩]/g, ch => {
        const code = ch.charCodeAt(0);
        if (code >= 0x06F0 && code <= 0x06F9)
            return String(code - 0x06F0); // فارسی
        if (code >= 0x0660 && code <= 0x0669)
            return String(code - 0x0660); // عربی
        return ch;
    });
}
/** نرمال‌سازی تاریخ - همیشه خروجی فارسی استاندارد */
export function normalizePersianDate(dateStr) {
    const parts = dateStr.split('/');
    if (parts.length !== 3)
        return dateStr;
    const [y, m, d] = parts.map(toLatinDigits).map(Number);
    // ساخت تاریخ با اعداد فارسی استاندارد
    const yFa = toFarsiDigits(String(y).padStart(4, '0'));
    const mFa = toFarsiDigits(String(m).padStart(2, '0'));
    const dFa = toFarsiDigits(String(d).padStart(2, '0'));
    return `${yFa}/${mFa}/${dFa}`;
}
export function getTodayPersian() {
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
