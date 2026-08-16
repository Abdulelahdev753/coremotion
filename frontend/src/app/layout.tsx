import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";

import { LanguageProvider } from "@/components/providers/language-provider";
import { WhatsappFab } from "@/components/site/whatsapp-fab";
import { defaultLocale, getDirection } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";

import "./globals.css";

// Keep fonts inside the app so builds never wait on Google Fonts. The files
// are variable fonts, so one local asset covers every weight used by the UI.
// display: "optional" — the browser uses the metric-adjusted fallback if the
// web font isn't ready within the ~100ms block window and then never swaps, so
// text can't reflow after first paint. This eliminates the font-swap layout
// shift (the real cause of the hero CLS), which "swap" could not: the site
// defaults to Arabic, and no size-adjust fallback perfectly matches Cairo's
// Arabic glyph advances, so a swap re-wrapped body copy and shoved the page.
// The fonts are small local woff2, so most visitors still load them in-window.
const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
  display: "optional",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  display: "optional",
  weight: "100 900",
});

const cairo = localFont({
  src: "./fonts/cairo-arabic.woff2",
  variable: "--font-cairo",
  display: "optional",
  weight: "400 800",
});

// A static export can't read the locale cookie at request time, so metadata and
// the initial <html> use the default locale; the LanguageProvider restores the
// visitor's saved choice on the client after hydration.
const t = dictionaries[defaultLocale];

const GA_MEASUREMENT_ID = "G-KGML0KGS03";

// Consent Mode v2 is scoped to the regions that actually require prior consent
// (EEA + UK). A blanket `denied` default would also gag the site's primary
// audience in Saudi Arabia, where no such requirement applies — visitors there
// would silently stop being measured. Region-scoped defaults keep SA fully
// measured while EEA/UK visitors get cookieless pings until consent is granted.
// If a consent banner is ever added, it should call
// gtag('consent', 'update', {...}) once the visitor chooses.
const EEA_UK_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO", "GB",
];

export const metadata: Metadata = {
  title: `${t.brand} — ${t.hero.headlineLead} ${t.hero.headlineAccent} ${t.hero.headlineContrast}`,
  description: t.hero.subheadline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = defaultLocale;

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full antialiased`}
      // The paint-gate script below stamps data-locale-pending on this element
      // before React hydrates, so the DOM legitimately carries an attribute the
      // server HTML doesn't — a hydration mismatch React would otherwise log.
      // This is shallow: it only covers <html>'s own attributes, never content.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Locale paint-gate: runs before the body content paints. If the visitor
            previously chose a non-default language, hide the page until
            LanguageProvider restores it after hydration, so the default-locale
            content never paints-then-reflows (the returning-visitor CLS jump).
            The 1.5s timeout is a failsafe against hydration never completing. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var k='NEXT_LOCALE',d='ar',s=null;try{s=localStorage.getItem(k)}catch(e){}if(!s){var m=document.cookie.match(/(?:^|;\\s*)NEXT_LOCALE=([^;]+)/);s=m?m[1]:null}if(s&&s!==d&&(s==='ar'||s==='en')){var el=document.documentElement;el.setAttribute('data-locale-pending','');setTimeout(function(){el.removeAttribute('data-locale-pending')},1500)}}catch(e){}})();",
          }}
        />
        {/* The support button lives inside the provider (it reads the locale for
            its label and prefilled message) and after {children} so it comes
            last in reading order rather than ahead of the page content. */}
        <LanguageProvider initialLocale={locale}>
          {children}
          <WhatsappFab />
        </LanguageProvider>
        {/* Google Analytics (gtag.js). afterInteractive keeps the tag off the
            critical path so it can't delay hydration or first paint. GA4's
            enhanced measurement tracks History API changes, so client-side
            route changes are counted without an extra page_view hook. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  region: [${EEA_UK_REGIONS.map((r) => `'${r}'`).join(',')}]
});
gtag('consent', 'default', {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted'
});
gtag('js', new Date());
// Resolve the visitor's saved language the same way the paint-gate above does,
// and attach it before config so it rides along with the very first page_view.
// The provider also calls setSiteLanguage on locale changes, but its mount
// effect runs before this afterInteractive script defines gtag — so without
// this, every visitor who never toggles the language would go unlabelled.
var __siteLang = '${defaultLocale}';
try {
  var __s = null;
  try { __s = localStorage.getItem('NEXT_LOCALE'); } catch (e) {}
  if (!__s) {
    var __m = document.cookie.match(/(?:^|;\\s*)NEXT_LOCALE=([^;]+)/);
    __s = __m ? __m[1] : null;
  }
  if (__s === 'ar' || __s === 'en') __siteLang = __s;
} catch (e) {}
gtag('set', 'user_properties', { site_language: __siteLang });
gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
      </body>
    </html>
  );
}
