import type { Metadata } from 'next';

import { Dashboard } from '@/components/motioncore/dashboard';
import { Navbar } from '@/components/site/navbar';
import { defaultLocale } from '@/i18n/config';
import { dictionaries } from '@/i18n/dictionaries';

const t = dictionaries[defaultLocale];

export const metadata: Metadata = {
  title: `${t.motioncore.meta.title} — ${t.motioncore.dashboard.title}`,
  description: t.motioncore.meta.description,
};

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <Dashboard />
    </>
  );
}
