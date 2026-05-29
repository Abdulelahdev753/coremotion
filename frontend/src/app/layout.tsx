import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import { cookies } from "next/headers";

import { LanguageProvider } from "@/components/providers/language-provider";
import { getDirection, LOCALE_COOKIE, resolveLocale } from "@/i18n/config";
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

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const t = dictionaries[locale];

  return {
    title: `${t.brand} — ${t.hero.headlineLead} ${t.hero.headlineAccent}`,
    description: t.hero.subheadline,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);

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
