import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";

import { LanguageProvider } from "@/components/providers/language-provider";
import { defaultLocale, getDirection } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// A static export can't read the locale cookie at request time, so metadata and
// the initial <html> use the default locale; the LanguageProvider restores the
// visitor's saved choice on the client after hydration.
const t = dictionaries[defaultLocale];

export const metadata: Metadata = {
  title: `${t.brand} — ${t.hero.headlineLead} ${t.hero.headlineAccent}`,
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
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
