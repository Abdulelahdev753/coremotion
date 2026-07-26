'use client';

import { Footprints, Info } from 'lucide-react';

import { useLanguage } from '@/components/providers/language-provider';
import { fillTemplate, formatNumber } from '@/lib/motioncore/format';
import type { WalkingResult } from '@/lib/motioncore/nutrition';
import { cn } from '@/lib/utils';

const CARD = 'rounded-2xl border border-black/10 bg-black/5';

export function WalkingPanel({
  walking,
  isWeightLoss,
}: {
  walking: WalkingResult;
  /** Adds the "walking does not promise weight loss" note on cutting plans. */
  isWeightLoss: boolean;
}) {
  const { t, locale } = useLanguage();
  const tw = t.motioncore.dashboard.walking;
  const units = t.motioncore.units;
  const steps = (value: number) => formatNumber(value, locale);

  const figures: Array<{ key: string; label: string; value: string; hint?: string }> = [
    {
      key: 'target',
      label: tw.targetLabel,
      value: steps(walking.recommendedSteps),
      hint: fillTemplate(tw.rangeLabel, {
        min: steps(walking.recommendedRangeMin),
        max: steps(walking.recommendedRangeMax),
      }),
    },
    {
      key: 'reference',
      label: tw.generalReferenceLabel,
      value: steps(walking.generalHealthReference),
    },
  ];

  if (walking.currentAverageSteps !== null) {
    figures.push({
      key: 'current',
      label: tw.currentLabel,
      value: steps(walking.currentAverageSteps),
    });
  }
  if (walking.nextStepTarget !== null) {
    figures.push({
      key: 'next',
      label: tw.nextTargetLabel,
      value: steps(walking.nextStepTarget),
      hint: walking.warnings.includes('alreadyMeetsTarget') ? undefined : tw.nextTargetHint,
    });
  }

  return (
    <section className={cn(CARD, 'mt-4 p-6')} aria-labelledby="mc-walking-title">
      <header className="flex items-start gap-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-black/10 text-black/60">
          <Footprints aria-hidden className="size-4" />
        </span>
        <div>
          <h2 id="mc-walking-title" className="text-lg font-bold text-black">
            {tw.title}
          </h2>
          <p className="mt-1 text-sm text-black/55">{tw.subtitle}</p>
        </div>
      </header>

      <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {figures.map((figure) => (
          <div key={figure.key} className="rounded-xl border border-black/10 bg-black/5 p-4">
            <dt className="text-xs font-medium text-black/50">{figure.label}</dt>
            <dd className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-black">{figure.value}</span>
              <span className="text-xs text-black/45">{units.steps}</span>
            </dd>
            {figure.hint ? (
              <p className="mt-1.5 text-xs leading-relaxed text-black/45">{figure.hint}</p>
            ) : null}
          </div>
        ))}
      </dl>

      {walking.warnings.includes('alreadyMeetsTarget') ? (
        <p className="mt-4 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm leading-relaxed text-black/80">
          {tw.alreadyMeets}
        </p>
      ) : null}

      <p className="mt-4 text-sm leading-relaxed text-black/60">{tw.evidenceNote}</p>

      <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-black/60">
        {tw.guidance.map((line) => (
          <li key={line} className="flex gap-2">
            <span aria-hidden className="text-black/30">
              •
            </span>
            {line}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-sm leading-relaxed text-black/60">{tw.intensityNote}</p>

      {/* The activity multiplier already covers daily movement — see engine.ts. */}
      <p className="mt-4 flex items-start gap-3 rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm leading-relaxed text-black/70">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-black/40" />
        {tw.calorieNote}
      </p>

      {isWeightLoss ? (
        <p className="mt-3 text-sm leading-relaxed text-black/60">{tw.weightLossNote}</p>
      ) : null}
    </section>
  );
}
