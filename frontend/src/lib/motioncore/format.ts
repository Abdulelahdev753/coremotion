import type { Locale } from '@/i18n/config';

// Western (latn) digits in both locales: they match the metric units and the
// rest of the site, and behave predictably inside dir="ltr" numeric inputs.
// ar-SA additionally defaults to the Umm al-Qura (Hijri) calendar, so dates
// must pin the Gregorian calendar explicitly or they render as 1447 AH.
const NUMBER_LOCALE: Record<Locale, string> = {
  ar: 'ar-SA-u-nu-latn',
  en: 'en-US',
};

const DATE_LOCALE: Record<Locale, string> = {
  ar: 'ar-SA-u-ca-gregory-nu-latn',
  en: 'en-US',
};

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale], options).format(value);
}

export function formatDate(
  isoDate: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], options).format(
    new Date(`${isoDate}T00:00:00`),
  );
}

/** Replaces {name} placeholders in dictionary template strings. */
export function fillTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** Local (not UTC) calendar date as YYYY-MM-DD, for weight-log keys. */
export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
