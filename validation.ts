// validation.ts

import { toLatinDigits } from './dateHelper.js';

// ─── قوانین Regex (همیشه با اعداد لاتین کار می‌کنند) ───
const patterns = {
  // حروف فارسی، انگلیسی و فاصله؛ حداقل ۲ کاراکتر
  name: /^[\u0600-\u06FFa-zA-Z\s]{2,}$/,
  // شماره موبایل ایرانی: ۰۹ و ۹ رقم بعدی (مجموع ۱۱ رقم)
  phone: /^09\d{9}$/
};

// ─── تایپ فیلدهای قابل ولیدیشن ───
type FieldId = 'name' | 'age' | 'phone';

// ─── اعتبارسنجی تک‌فیلد ───
export function validateField(fieldId: FieldId, value: unknown): string | null {
  const v = typeof value === 'string' ? value.trim() : value;

  switch (fieldId) {
    case 'name': {
      if (!v) return "نام و نام خانوادگی الزامی است.";
      if (typeof v !== 'string') return "نام باید متن باشد.";
      if (v.length < 2) return "نام باید حداقل ۲ حرف باشد.";
      if (!patterns.name.test(v)) return "نام فقط باید شامل حروف باشد.";
      return null;
    }
    case 'age': {
      if (v === "" || v === null || v === undefined) return "سن الزامی است.";
      // تبدیل اعداد فارسی به لاتین برای اعتبارسنجی
      const latinValue = typeof v === 'string' ? toLatinDigits(v) : String(v);
      const num = Number(latinValue);
      if (!Number.isFinite(num)) return "سن باید یک عدد معتبر باشد.";
      if (num < 1 || num > 120) return "سن باید بین ۱ تا ۱۲۰ سال باشد.";
      return null;
    }
    case 'phone': {
      if (!v) return "شماره تماس الزامی است.";
      // تبدیل اعداد فارسی به لاتین برای اعتبارسنجی
      const phoneStr = toLatinDigits(String(v).trim());
      if (!patterns.phone.test(phoneStr)) return "فرمت شماره صحیح نیست (مثال: 09123456789).";
      return null;
    }
    default:
      return null;
  }
}

// ─── اعتبارسنجی کل فرم ───
interface ValidationResult {
  isValid: boolean;
  errors: Record<FieldId, string | null>;
}

export function validateForm(formData: Record<FieldId, unknown>): ValidationResult {
  const errors: Record<FieldId, string | null> = {
    name: null,
    age: null,
    phone: null
  };
  let isValid = true;

  for (const [key, value] of Object.entries(formData) as [FieldId, unknown][]) {
    const error = validateField(key, value);
    if (error) {
      errors[key] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

// ─── نمایش خطا در UI ───
export function showError(fieldId: FieldId, message: string): void {
  const input = document.getElementById(fieldId) as HTMLInputElement | null;
  const errorSpan = document.getElementById(`${fieldId}Error`) as HTMLElement | null;

  if (input) input.classList.add('error');
  if (errorSpan) {
    errorSpan.textContent = message;
    errorSpan.classList.add('visible');
  }
}

// ─── پاک کردن خطای یک فیلد ───
export function clearError(fieldId: FieldId): void {
  const input = document.getElementById(fieldId) as HTMLInputElement | null;
  const errorSpan = document.getElementById(`${fieldId}Error`) as HTMLElement | null;

  if (input) input.classList.remove('error');
  if (errorSpan) {
    errorSpan.textContent = '';
    errorSpan.classList.remove('visible');
  }
}

// ─── پاک کردن تمام خطاها ───
export function clearAllErrors(): void {
  (['name', 'age', 'phone'] as FieldId[]).forEach(clearError);
}
