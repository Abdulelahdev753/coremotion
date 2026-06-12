import type { Metadata } from 'next';

import { AssessmentFlow } from '@/components/motioncore/assessment-flow';
import { Navbar } from '@/components/site/navbar';
import { defaultLocale } from '@/i18n/config';
import { dictionaries } from '@/i18n/dictionaries';

const t = dictionaries[defaultLocale];

export const metadata: Metadata = {
  title: `${t.motioncore.meta.title} — ${t.motioncore.assessment.title}`,
  description: t.motioncore.meta.description,
};

export default function AssessmentPage() {
  return (
    <>
      <Navbar />
      <AssessmentFlow />
    </>
  );
}
