'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { setSiteLanguage } from '@/lib/analytics';
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

  // The paint-gate (inline script in the root layout) hides the page for
  // returning visitors whose saved locale differs from the build-time default,
  // so it never paints the default locale and then re-flows. We must reveal it
  // again exactly once — after the restored locale has been applied — otherwise
  // those visitors would either see the default-locale flash (revealed too
  // early) or a blank page (never revealed). `revealedRef` guards the first
  // run of the [locale] effect (still the default locale) from revealing.
  const revealedRef = useRef(false);
  const hasMountedRef = useRef(false);

  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    document.documentElement.removeAttribute('data-locale-pending');
  }, []);

  // The static export renders with the default locale, so restore the visitor's
  // saved choice once on the client after hydration.
  useEffect(() => {
    const stored = readStoredLocale();
    if (stored && stored !== locale) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe one-time restore
      setLocaleState(stored);
      // Reveal is deferred to the [locale] effect below, which re-runs once the
      // switched-locale render has committed — so the restored language paints
      // first and the gate is lifted without a default-locale flash.
    } else {
      // Nothing to restore: reveal immediately (the gate may not even be set).
      reveal();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentionally run once on mount

  // Keep <html lang/dir> in sync with the active locale (initial paint uses the
  // default; this also covers runtime language toggles and the restore above).
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = getDirection(locale);
    // Report the language actually being read (covers the restore above and
    // runtime toggles), so Arabic vs English can be compared in GA4.
    setSiteLanguage(locale);
    // Skip the initial run (still the default locale); reveal only once a
    // restore has landed us on the final locale. Runtime toggles are no-ops
    // here because the gate was already lifted on mount.
    if (revealedRef.current) return;
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    reveal();
  }, [locale, reveal]);

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

  // Feed the active reading direction into Base UI so its directional
  // components (e.g. the FAQ accordion) don't fall back to their `ltr` default
  // and scramble mixed Arabic/Latin text. Stays in sync with language toggles.
  return (
    <LanguageContext.Provider value={value}>
      <DirectionProvider direction={value.dir}>{children}</DirectionProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
