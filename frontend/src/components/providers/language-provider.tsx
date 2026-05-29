'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  defaultLocale,
  getDirection,
  isLocale,
  LOCALE_COOKIE,
  type Direction,
  type Locale,
} from '@/i18n/config';
import { dictionaries, type Dictionary } from '@/i18n/dictionaries';

type LanguageContextValue = {
  locale: Locale;
  dir: Direction;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Read the persisted language choice on the client (localStorage, then cookie). */
function readStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromStorage = window.localStorage.getItem(LOCALE_COOKIE);
    if (isLocale(fromStorage)) return fromStorage;
  } catch {
    /* storage may be unavailable (private mode) — fall back to the cookie */
  }
  const fromCookie = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/)?.[1];
  return isLocale(fromCookie) ? fromCookie : null;
}

function persistLocale(locale: Locale) {
  if (typeof document !== 'undefined') {
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${ONE_YEAR_SECONDS};samesite=lax`;
  }
  try {
    window.localStorage.setItem(LOCALE_COOKIE, locale);
  } catch {
    /* storage may be unavailable (private mode) — cookie is the source of truth */
  }
}

export function LanguageProvider({
  initialLocale = defaultLocale,
  children,
}: {
  initialLocale?: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => {
      const next: Locale = current === 'ar' ? 'en' : 'ar';
      persistLocale(next);
      return next;
    });
  }, []);

  // The static export renders with the default locale, so restore the visitor's
  // saved choice once on the client after hydration.
  useEffect(() => {
    const stored = readStoredLocale();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe one-time restore
    if (stored && stored !== locale) setLocaleState(stored);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentionally run once on mount

  // Keep <html lang/dir> in sync with the active locale (initial paint uses the
  // default; this also covers runtime language toggles and the restore above).
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = getDirection(locale);
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dir: getDirection(locale),
      t: dictionaries[locale],
      setLocale,
      toggleLocale,
    }),
    [locale, setLocale, toggleLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
