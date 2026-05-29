'use client';

import { Languages } from 'lucide-react';

import { useLanguage } from '@/components/providers/language-provider';
import { cn } from '@/lib/utils';

export function LanguageToggle({ className }: { className?: string }) {
  const { t, toggleLocale } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={t.actions.switchLanguage}
      title={t.actions.switchLanguage}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5',
        'text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70',
        className,
      )}
    >
      <Languages aria-hidden className="size-4" />
      <span>{t.actions.otherLanguageShort}</span>
    </button>
  );
}
