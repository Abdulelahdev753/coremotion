'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Shared page chrome for MotionCore routes: navbar offset plus a quiet
 * lime-tinted backdrop (no Silk here — these pages are data-dense and
 * should stay light).
 */
export function MotionCoreShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className="relative isolate min-h-[100svh] overflow-hidden px-4 pb-24 pt-32 sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_-5%,rgba(214,236,27,0.09),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_85%_110%,rgba(214,236,27,0.05),transparent_70%)]" />
      </div>
      <div className={cn('mx-auto w-full max-w-6xl', className)}>{children}</div>
    </main>
  );
}
