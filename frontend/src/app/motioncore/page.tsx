import type { Metadata } from 'next';

import { MotionCoreLanding } from '@/components/motioncore/landing';
import { Navbar } from '@/components/site/navbar';
import { defaultLocale } from '@/i18n/config';
import { dictionaries } from '@/i18n/dictionaries';

// Static export renders with the default locale; the LanguageProvider restores
// the visitor's saved choice on the client (same pattern as the root layout).
const t = dictionaries[defaultLocale];

export const metadata: Metadata = {
  title: t.motioncore.meta.title,
  description: t.motioncore.meta.description,
};

export default function MotionCorePage() {
  return (
    <>
      <Navbar />
      <MotionCoreLanding />
    </>
  );
}
