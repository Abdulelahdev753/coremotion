'use client';

import { useLanguage } from '@/components/providers/language-provider';

/**
 * Lightweight scroll targets for the navbar anchors. The first real build is
 * "hero + glass navbar only", so these stay intentionally minimal — just enough
 * that the Products / Use Cases / About links land on a labelled section.
 */
export function PlaceholderSections() {
  const { t } = useLanguage();

  // "products" now resolves to the real pricing section (see <PricingCards />)
  // and "what-you-get" to the package showcase (see <WhatYouGet />), so neither
  // is a placeholder anymore.
  const sections = [
    { id: 'about', title: t.nav.about },
    { id: 'get-the-guide', title: t.hero.cta },
  ];

  return (
    <>
      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="scroll-mt-28 border-t border-white/[0.06] px-6 py-24"
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">{section.title}</h2>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/35 rtl:tracking-normal">
              {t.sections.comingSoon}
            </p>
          </div>
        </section>
      ))}
    </>
  );
}
