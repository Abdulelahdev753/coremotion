export const locales = ['ar', 'en'] as const;

export type Locale = (typeof locales)[number];

export type Direction = 'rtl' | 'ltr';

/** Arabic is the primary language for MotionCore. */
export const defaultLocale: Locale = 'ar';

/** Cookie that persists the visitor's language choice across visits. */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function getDirection(locale: Locale): Direction {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function isLocale(value: unknown): value is Locale {
  return value === 'ar' || value === 'en';
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}
