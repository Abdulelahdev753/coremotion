import type { Metadata } from 'next';

import { LegalDocument } from '@/components/site/legal-document';
import { Navbar } from '@/components/site/navbar';
import { SiteFooter } from '@/components/site/site-footer';
import { defaultLocale } from '@/i18n/config';
import { legalDocuments } from '@/i18n/legal';

// Static export renders with the default locale; the LanguageProvider restores
// the visitor's saved choice on the client (same pattern as the root layout).
const meta = legalDocuments.terms[defaultLocale].meta;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <LegalDocument doc="terms" />
      <SiteFooter />
    </>
  );
}
