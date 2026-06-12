'use client';

import {
  CheckCircle2,
  Droplets,
  Flame,
  Footprints,
  Pencil,
  TriangleAlert,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { MacroDonut } from '@/components/motioncore/macro-donut';
import { MotionCoreShell } from '@/components/motioncore/motioncore-shell';
import { useMotionCoreStore } from '@/components/motioncore/use-motioncore-store';
import { WeightChart } from '@/components/motioncore/weight-chart';
import { useLanguage } from '@/components/providers/language-provider';
import { buildPlan } from '@/lib/motioncore/engine';
import { fillTemplate, formatNumber, todayIso } from '@/lib/motioncore/format';
import { analyzeWeightTrend } from '@/lib/motioncore/recalibration';
import { INPUT_BOUNDS, type MealItem } from '@/lib/motioncore/types';
import { cn } from '@/lib/utils';

const CARD = 'rounded-2xl border border-white/10 bg-white/5';

export function Dashboard() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const { status, profile, weightLog, addWeight } = useMotionCoreStore();
  const td = t.motioncore.dashboard;
  const units = t.motioncore.units;

  const [activeDay, setActiveDay] = useState(0);
  const [weightInput, setWeightInput] = useState('');
  // Initialized post-mount: the page is prerendered at build time, so the
  // build machine's date must not leak into the hydrated HTML.
  const [dateInput, setDateInput] = useState('');
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe one-time init
    setDateInput(todayIso());
  }, []);

  // The plan is always derived from the stored assessment, never persisted.
  const plan = useMemo(() => {
    if (!profile) return null;
    try {
      return buildPlan(profile.assessment);
    } catch {
      return null; // out-of-bounds storage → treat as no profile
    }
  }, [profile]);

  const trend = useMemo(
    () => (plan ? analyzeWeightTrend(weightLog, plan.targets.expectedKgPerWeek) : null),
    [weightLog, plan],
  );

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

  const { targets, meals, workout } = plan;

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

  const weightValue = Number(weightInput);
  const weightValid =
    Number.isFinite(weightValue) &&
    weightInput !== '' &&
    weightValue >= INPUT_BOUNDS.weightKg.min &&
    weightValue <= INPUT_BOUNDS.weightKg.max &&
    dateInput !== '';

  const logWeight = () => {
    if (!weightValid) return;
    addWeight({ date: dateInput, weightKg: Math.round(weightValue * 10) / 10 });
    setWeightInput('');
  };

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

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
        {/* Left column: meals + workout */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          {/* Meals */}
          <section className={cn(CARD, 'p-6')}>
            <header className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-bold text-white">{td.meals.title}</h2>
              <p className="text-xs text-white/40">{td.meals.approxNote}</p>
            </header>
            <div className="mt-5 flex flex-col gap-4">
              {meals.meals.map((meal) => (
                <article key={meal.slot} className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
                  <header className="flex items-baseline justify-between">
                    <h3 className="text-sm font-semibold text-brand">{td.meals.slots[meal.slot]}</h3>
                    <span className="font-mono text-xs text-white/55">
                      {formatNumber(Math.round(meal.totals.kcal), locale)} {units.kcal}
                    </span>
                  </header>
                  <ul className="mt-3 flex flex-col gap-2">
                    {meal.items.map((item) => (
                      <li key={item.foodId} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-white/85">{item.name[locale]}</span>
                        <span className="shrink-0 font-mono text-xs text-white/50">
                          {portionLabel(item, locale, units.g)} · {formatNumber(item.kcal, locale)}{' '}
                          {units.kcal}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
              <footer className="flex flex-wrap items-baseline justify-between gap-2 px-1 text-sm">
                <span className="font-semibold text-white/75">{td.meals.total}</span>
                <span className="font-mono text-xs text-white/60">
                  ≈ {formatNumber(Math.round(meals.dayTotals.kcal), locale)} {units.kcal} ·{' '}
                  {formatNumber(Math.round(meals.dayTotals.proteinG), locale)} {units.g}{' '}
                  {td.targets.protein} · {formatNumber(Math.round(meals.dayTotals.carbsG), locale)}{' '}
                  {units.g} {td.targets.carbs} ·{' '}
                  {formatNumber(Math.round(meals.dayTotals.fatG), locale)} {units.g} {td.targets.fat}
                </span>
              </footer>
            </div>
          </section>

          {/* Workout */}
          <section className={cn(CARD, 'p-6')}>
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold text-white">{td.workout.title}</h2>
              <p className="text-xs text-white/40">{workout.splitName[locale]}</p>
            </header>
            <div role="tablist" aria-label={td.workout.title} className="mt-5 flex flex-wrap gap-2">
              {workout.days.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={activeDay === index}
                  onClick={() => setActiveDay(index)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70',
                    activeDay === index
                      ? 'bg-brand text-black'
                      : 'border border-white/15 text-white/65 hover:border-white/30 hover:text-white',
                  )}
                >
                  {day.title[locale]}
                </button>
              ))}
            </div>
            <ul className="mt-5 flex flex-col gap-2.5">
              {workout.days[activeDay]?.exercises.map((exercise, index) => (
                <li
                  key={exercise.exerciseId + index}
                  className="rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-white/90">
                      {exercise.name[locale]}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-white/60" dir="ltr">
                      {formatNumber(exercise.sets, locale)} × {exercise.reps}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    {exercise.notes ? (
                      <p className="text-xs leading-relaxed text-white/45">
                        {exercise.notes[locale]}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="shrink-0 rounded-full bg-white/[0.07] px-2.5 py-0.5 text-[0.7rem] text-white/50">
                      {fillTemplate(td.workout.rest, {
                        seconds: formatNumber(exercise.restSeconds, locale),
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            {workout.cardioNote ? (
              <p className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-white/55">
                {workout.cardioNote[locale]}
              </p>
            ) : null}
          </section>
        </div>

        {/* Right column: macros + weight + check-in */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          <section className={cn(CARD, 'p-6')}>
            <h2 className="text-lg font-bold text-white">{td.macrosTitle}</h2>
            <div className="mt-5">
              <MacroDonut targets={targets} />
            </div>
          </section>

          {/* Weight log */}
          <section className={cn(CARD, 'p-6')}>
            <h2 className="text-lg font-bold text-white">{td.weight.title}</h2>
            <form
              className="mt-4 flex flex-wrap items-end gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                logWeight();
              }}
            >
              <div className="min-w-28 flex-1">
                <label htmlFor="mc-log-weight" className="text-xs font-medium text-white/55">
                  {td.weight.weightLabel}
                </label>
                <input
                  id="mc-log-weight"
                  dir="ltr"
                  inputMode="decimal"
                  autoComplete="off"
                  value={weightInput}
                  onChange={(event) => setWeightInput(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 font-mono text-sm text-white outline-none transition-colors focus:border-brand/50 focus:ring-2 focus:ring-brand/40"
                />
              </div>
              <div className="min-w-36 flex-1">
                <label htmlFor="mc-log-date" className="text-xs font-medium text-white/55">
                  {td.weight.dateLabel}
                </label>
                <input
                  id="mc-log-date"
                  type="date"
                  value={dateInput}
                  onChange={(event) => setDateInput(event.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 font-mono text-sm text-white outline-none transition-colors focus:border-brand/50 focus:ring-2 focus:ring-brand/40"
                />
              </div>
              <button
                type="submit"
                disabled={!weightValid}
                className="h-11 rounded-full bg-brand px-5 text-sm font-semibold text-black shadow-[0_0_24px_-8px_#d6ec1b] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {td.weight.add}
              </button>
            </form>
            <div className="mt-5">
              {weightLog.length >= 2 ? (
                <WeightChart entries={weightLog} expectedKgPerWeek={targets.expectedKgPerWeek} />
              ) : (
                <p className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-white/45">
                  {weightLog.length === 0 ? td.weight.empty : td.weight.needMorePoints}
                </p>
              )}
            </div>
          </section>

          {/* Plan check-in */}
          <section className={cn(CARD, 'p-6')}>
            <h2 className="text-lg font-bold text-white">{td.hints.title}</h2>
            {trend ? (
              <div className="mt-4 flex items-start gap-3">
                {trend.status === 'onTrack' ? (
                  <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
                ) : (
                  <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-amber-300" />
                )}
                <div className="text-sm leading-relaxed text-white/75">
                  <p>{td.hints[trend.status]}</p>
                  {trend.suggestedKcalDelta !== 0 ? (
                    <p className="mt-1.5 text-white/55">
                      {fillTemplate(
                        trend.suggestedKcalDelta > 0 ? td.hints.increase : td.hints.reduce,
                        { kcal: formatNumber(Math.abs(trend.suggestedKcalDelta), locale) },
                      )}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-white/50">{td.hints.needMoreData}</p>
            )}
          </section>
        </div>
      </div>
    </MotionCoreShell>
  );
}

/** "2 eggs · 100 g" or plain "150 g", with locale-aware digits. */
function portionLabel(item: MealItem, locale: 'ar' | 'en', gramUnit: string): string {
  const grams = `${formatNumber(item.grams, locale)} ${gramUnit}`;
  if (!item.units) return grams;
  const count = formatNumber(item.units.count, locale, { maximumFractionDigits: 1 });
  return `${count} ${item.units.unitName[locale]} · ${grams}`;
}
