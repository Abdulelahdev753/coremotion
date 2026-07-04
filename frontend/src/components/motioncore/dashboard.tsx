'use client';

import { Droplets, Flame, Footprints, Pencil, TriangleAlert, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { MacroDonut } from '@/components/motioncore/macro-donut';
import { MotionCoreShell } from '@/components/motioncore/motioncore-shell';
import { useMotionCoreStore } from '@/components/motioncore/use-motioncore-store';
import { useLanguage } from '@/components/providers/language-provider';
import { buildPlan } from '@/lib/motioncore/engine';
import { fillTemplate, formatNumber } from '@/lib/motioncore/format';
import { cn } from '@/lib/utils';

const CARD = 'rounded-2xl border border-white/10 bg-white/5';

export function Dashboard() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const { status, profile } = useMotionCoreStore();
  const td = t.motioncore.dashboard;
  const units = t.motioncore.units;

  // The plan is always derived from the stored assessment, never persisted.
  const plan = useMemo(() => {
    if (!profile) return null;
    try {
      return buildPlan(profile.assessment);
    } catch {
      return null; // out-of-bounds storage → treat as no profile
    }
  }, [profile]);

  // No saved assessment → send the visitor to the flow (client-side replace;
  // static export has no redirect config).
  useEffect(() => {
    if (status === 'empty' || (status === 'ready' && !plan)) {
      router.replace('/motioncore/assessment');
    }
  }, [status, plan, router]);

  if (status === 'loading') {
    return (
      <MotionCoreShell>
        <div aria-busy aria-label={td.loading} className="flex flex-col gap-4">
          <div className="h-10 w-64 max-w-full animate-pulse rounded-xl bg-white/5" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="h-32 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-white/5" />
        </div>
      </MotionCoreShell>
    );
  }

  if (!plan) {
    return (
      <MotionCoreShell className="max-w-xl">
        <div className={cn(CARD, 'flex flex-col items-center p-10 text-center')}>
          <h1 className="text-2xl font-bold text-white">{td.empty.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60">{td.empty.body}</p>
          <Link
            href="/motioncore/assessment"
            className="mt-7 inline-flex items-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black shadow-[0_0_24px_-8px_#d6ec1b] transition hover:brightness-95"
          >
            {t.motioncore.landing.startCta}
          </Link>
        </div>
      </MotionCoreShell>
    );
  }

  const { targets } = plan;

  const statCards = [
    {
      key: 'calories',
      icon: Flame,
      label: td.targets.calories,
      value: formatNumber(targets.calories, locale),
      unit: units.kcal,
      sub:
        targets.expectedKgPerWeek !== 0
          ? fillTemplate(td.expectedRate, {
              rate: formatNumber(targets.expectedKgPerWeek, locale, {
                signDisplay: 'always',
                maximumFractionDigits: 2,
              }),
            })
          : undefined,
      highlight: true,
    },
    {
      key: 'protein',
      icon: Zap,
      label: td.targets.protein,
      value: formatNumber(targets.proteinG, locale),
      unit: units.g,
    },
    {
      key: 'water',
      icon: Droplets,
      label: td.targets.water,
      value: formatNumber(targets.waterL, locale, { maximumFractionDigits: 1 }),
      unit: units.liters,
    },
    {
      key: 'steps',
      icon: Footprints,
      label: td.targets.steps,
      value: formatNumber(targets.steps, locale),
      unit: units.steps,
    },
  ];

  return (
    <MotionCoreShell>
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{td.title}</h1>
          <p className="mt-2 text-sm text-white/55">{td.subtitle}</p>
        </div>
        <Link
          href="/motioncore/assessment"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
        >
          <Pencil aria-hidden className="size-3.5" />
          {td.editAssessment}
        </Link>
      </header>

      {targets.calorieFloorApplied ? (
        <p className="mt-6 flex items-start gap-3 rounded-2xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm leading-relaxed text-white/80">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
          {td.floorNotice}
        </p>
      ) : null}

      {/* Daily targets */}
      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className={cn(
              CARD,
              'p-5',
              card.highlight && 'border-brand/40 shadow-[0_0_40px_-18px_#d6ec1b]',
            )}
          >
            <span
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-lg',
                card.highlight ? 'bg-brand/15 text-brand' : 'bg-white/10 text-white/60',
              )}
            >
              <card.icon aria-hidden className="size-4" />
            </span>
            <p className="mt-3 text-xs font-medium text-white/50">{card.label}</p>
            <p className="mt-1 flex items-baseline gap-1.5">
              <span
                className={cn(
                  'font-mono text-2xl font-bold sm:text-3xl',
                  card.highlight ? 'text-brand' : 'text-white',
                )}
              >
                {card.value}
              </span>
              <span className="text-xs text-white/45">{card.unit}</span>
            </p>
            {card.sub ? <p className="mt-1.5 font-mono text-xs text-white/45">{card.sub}</p> : null}
          </div>
        ))}
      </section>

      {/* Macro split */}
      <section className={cn(CARD, 'mt-4 max-w-2xl p-6')}>
        <h2 className="text-lg font-bold text-white">{td.macrosTitle}</h2>
        <div className="mt-5">
          <MacroDonut targets={targets} />
        </div>
      </section>
    </MotionCoreShell>
  );
}
