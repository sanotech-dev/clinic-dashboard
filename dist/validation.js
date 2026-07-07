// validation.ts
// ─── قوانین Regex ───
const patterns = {
    // حروف فارسی، انگلیسی و فاصله؛ حداقل ۲ کاراکتر
    name: /^[\u0600-\u06FFa-zA-Z\s]{2,}$/,
    // شماره موبایل ایرانی: ۰۹ و ۹ رقم بعدی (مجموع ۱۱ رقم)
    phone: /^09\d{9}$/
};
// ─── اعتبارسنجی تک‌فیلد ───
export function validateField(fieldId, value) {
    const v = typeof value === 'string' ? value.trim() : value;
    switch (fieldId) {
        case 'name': {
            if (!v)
                return "نام و نام خانوادگی الزامی است.";
            if (typeof v !== 'string')
                return "نام باید متن باشد.";
            if (v.length < 2)
                return "نام باید حداقل ۲ حرف باشد.";
            if (!patterns.name.test(v))
                return "نام فقط باید شامل حروف باشد.";
            return null;
        }
        case 'age': {
            if (v === "" || v === null || v === undefined)
                return "سن الزامی است.";
            const num = Number(v);
            if (!Number.isFinite(num))
                return "سن باید یک عدد معتبر باشد.";
            if (num < 1 || num > 120)
                return "سن باید بین ۱ تا ۱۲۰ سال باشد.";
            return null;
        }
        case 'phone': {
            if (!v)
                return "شماره تماس الزامی است.";
            const phoneStr = String(v).trim();
            if (!patterns.phone.test(phoneStr))
                return "فرمت شماره صحیح نیست (مثال: 09123456789).";
            return null;
        }
        default:
            return null;
    }
}
export function validateForm(formData) {
    const errors = {
        name: null,
        age: null,
        phone: null
    };
    let isValid = true;
    for (const [key, value] of Object.entries(formData)) {
        const error = validateField(key, value);
        if (error) {
            errors[key] = error;
            isValid = false;
        }
    }
    return { isValid, errors };
}
// ─── نمایش خطا در UI ───
export function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(`${fieldId}Error`);
    if (input)
        input.classList.add('error');
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.classList.add('visible');
    }
}
// ─── پاک کردن خطای یک فیلد ───
export function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(`${fieldId}Error`);
    if (input)
        input.classList.remove('error');
    if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.classList.remove('visible');
    }
}
// ─── پاک کردن تمام خطاها ───
export function clearAllErrors() {
    ['name', 'age', 'phone'].forEach(clearError);
}
