'use client';

import { Droplets, Flame, Footprints, Pencil, TriangleAlert, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { HydrationPanel } from '@/components/motioncore/hydration-panel';
import { MacroDonut } from '@/components/motioncore/macro-donut';
import { MotionCoreShell } from '@/components/motioncore/motioncore-shell';
import { useMotionCoreStore } from '@/components/motioncore/use-motioncore-store';
import { WalkingPanel } from '@/components/motioncore/walking-panel';
import { useLanguage } from '@/components/providers/language-provider';
import { buildPlan } from '@/lib/motioncore/engine';
import { fillTemplate, formatNumber } from '@/lib/motioncore/format';
import { cn } from '@/lib/utils';

const CARD = 'rounded-2xl border border-black/10 bg-black/5';

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
          <div className="h-10 w-64 max-w-full animate-pulse rounded-xl bg-black/5" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="h-32 animate-pulse rounded-2xl bg-black/5" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-black/5" />
        </div>
      </MotionCoreShell>
    );
  }

  if (!plan) {
    return (
      <MotionCoreShell className="max-w-xl">
        <div className={cn(CARD, 'flex flex-col items-center p-10 text-center')}>
          <h1 className="text-2xl font-bold text-black">{td.empty.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-black/60">{td.empty.body}</p>
          <Link
            href="/motioncore/assessment"
            className="mt-7 inline-flex items-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black shadow-[0_0_24px_-8px_#16924e] transition hover:brightness-95"
          >
            {t.motioncore.landing.startCta}
          </Link>
        </div>
      </MotionCoreShell>
    );
  }

  const { targets } = plan;
  const { nutrition } = targets;
  const tr = td.results;

  // The derivation chain, in the order it is calculated.
  const breakdown = [
    {
      key: 'formula',
      label: tr.formulaLabel,
      value: tr.formulas[nutrition.formulaUsed],
      explanation: undefined as string | undefined,
    },
    {
      key: 'bmr',
      label: tr.bmrLabel,
      value: `${formatNumber(Math.round(nutrition.bmr), locale)} ${units.kcal}`,
      explanation: tr.bmrExplanation,
    },
    {
      key: 'tdee',
      label: tr.tdeeLabel,
      value: `${formatNumber(Math.round(nutrition.tdee), locale)} ${units.kcal}`,
      explanation: tr.tdeeExplanation,
    },
    {
      key: 'goal',
      label: tr.goalAdjustmentLabel,
      value: `${formatNumber(nutrition.goalAdjustmentPercent, locale, {
        signDisplay: 'exceptZero',
        maximumFractionDigits: 0,
      })}${units.percent}`,
      explanation: tr.goalAdjustmentExplanation,
    },
    {
      key: 'target',
      label: tr.targetLabel,
      value: `${formatNumber(Math.round(nutrition.recommendedTargetCalories), locale)} ${units.kcal}`,
      explanation: undefined,
    },
    {
      key: 'protein',
      label: td.targets.protein,
      value: `${formatNumber(nutrition.proteinGrams, locale)} ${units.g}`,
      explanation: undefined,
    },
    {
      key: 'carbs',
      label: td.targets.carbs,
      value: `${formatNumber(nutrition.carbGrams, locale)} ${units.g}`,
      explanation: undefined,
    },
    {
      key: 'fat',
      label: td.targets.fat,
      value: `${formatNumber(nutrition.fatGrams, locale)} ${units.g}`,
      explanation: undefined,
    },
  ];

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
          <h1 className="text-3xl font-extrabold text-black sm:text-4xl">{td.title}</h1>
          <p className="mt-2 text-sm text-black/55">{td.subtitle}</p>
        </div>
        <Link
          href="/motioncore/assessment"
          className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-medium text-black/75 transition-colors hover:border-black/30 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
        >
          <Pencil aria-hidden className="size-3.5" />
          {td.editAssessment}
        </Link>
      </header>

      {nutrition.warnings.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {nutrition.warnings.map((warning) => (
            <li
              key={warning}
              className="flex items-start gap-3 rounded-2xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm leading-relaxed text-black/80"
            >
              <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>
                {warning === 'calorieMinimumApplied'
                  ? `${tr.warnings.calorieMinimum} ${td.floorNotice}`
                  : tr.warnings.proteinCap}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Daily targets */}
      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className={cn(
              CARD,
              'p-5',
              card.highlight && 'border-brand/40 shadow-[0_0_40px_-18px_#16924e]',
            )}
          >
            <span
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-lg',
                card.highlight ? 'bg-brand/15 text-brand' : 'bg-black/10 text-black/60',
              )}
            >
              <card.icon aria-hidden className="size-4" />
            </span>
            <p className="mt-3 text-xs font-medium text-black/50">{card.label}</p>
            <p className="mt-1 flex items-baseline gap-1.5">
              <span
                className={cn(
                  'font-mono text-2xl font-bold sm:text-3xl',
                  card.highlight ? 'text-brand' : 'text-black',
                )}
              >
                {card.value}
              </span>
              <span className="text-xs text-black/45">{card.unit}</span>
            </p>
            {card.sub ? <p className="mt-1.5 font-mono text-xs text-black/45">{card.sub}</p> : null}
          </div>
        ))}
      </section>

      {/* Macro split */}
      <section className={cn(CARD, 'mt-4 max-w-2xl p-6')}>
        <h2 className="text-lg font-bold text-black">{td.macrosTitle}</h2>
        <div className="mt-5">
          <MacroDonut targets={targets} />
        </div>
      </section>

      {/* How the target was derived */}
      <section className={cn(CARD, 'mt-4 p-6')} aria-labelledby="mc-results-title">
        <h2 id="mc-results-title" className="text-lg font-bold text-black">
          {tr.title}
        </h2>
        <dl className="mt-5 divide-y divide-black/10">
          {breakdown.map((row) => (
            <div
              key={row.key}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
            >
              <dt className="text-sm text-black/60">
                {row.label}
                {row.explanation ? (
                  <span className="mt-0.5 block text-xs leading-relaxed text-black/40">
                    {row.explanation}
                  </span>
                ) : null}
              </dt>
              <dd className="font-mono text-sm font-semibold text-black">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-black/45">
          {fillTemplate(tr.macroCaloriesNote, {
            kcal: `${formatNumber(nutrition.macroCalories, locale)} ${units.kcal}`,
          })}
        </p>
      </section>

      <HydrationPanel hydration={nutrition.hydration} />
      <WalkingPanel walking={nutrition.walking} isWeightLoss={nutrition.goalMultiplier < 1} />
    </MotionCoreShell>
  );
}
