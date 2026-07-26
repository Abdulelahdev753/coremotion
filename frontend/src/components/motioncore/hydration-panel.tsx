'use client';

import { Droplets, Info, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import { CheckboxField, NumberField } from '@/components/motioncore/fields';
import { useLanguage } from '@/components/providers/language-provider';
import { formatNumber } from '@/lib/motioncore/format';
import {
  calculateSweatLoss,
  validateSweatInput,
  type HydrationResult,
  type SweatErrors,
  type SweatField,
  type SweatInput,
  type SweatLossResult,
} from '@/lib/motioncore/nutrition';
import { cn } from '@/lib/utils';

const CARD = 'rounded-2xl border border-black/10 bg-black/5';

type SweatDraft = Record<SweatField, string> & { hotOrHumid: boolean };

const EMPTY_DRAFT: SweatDraft = {
  preExerciseWeightKg: '',
  postExerciseWeightKg: '',
  exerciseDurationMinutes: '',
  fluidConsumedLiters: '',
  urineProducedLiters: '0',
  hotOrHumid: false,
};

/** Blank optional fields read as 0; blank required fields stay NaN so they error. */
function toNumber(raw: string, fallback: number): number {
  const trimmed = raw.trim();
  if (trimmed === '') return fallback;
  return Number(trimmed);
}

export function HydrationPanel({ hydration }: { hydration: HydrationResult }) {
  const { t, locale } = useLanguage();
  const th = t.motioncore.dashboard.hydration;
  const units = t.motioncore.units;

  const [draft, setDraft] = useState<SweatDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<SweatErrors>({});
  const [result, setResult] = useState<SweatLossResult | null>(null);

  const set = (patch: Partial<SweatDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setErrors({});
  };

  const liters = (value: number) =>
    formatNumber(value, locale, { maximumFractionDigits: 2 });

  const submit = () => {
    const input: SweatInput = {
      preExerciseWeightKg: toNumber(draft.preExerciseWeightKg, Number.NaN),
      postExerciseWeightKg: toNumber(draft.postExerciseWeightKg, Number.NaN),
      exerciseDurationMinutes: toNumber(draft.exerciseDurationMinutes, Number.NaN),
      fluidConsumedLiters: toNumber(draft.fluidConsumedLiters, 0),
      urineProducedLiters: toNumber(draft.urineProducedLiters, 0),
      hotOrHumid: draft.hotOrHumid,
    };
    const found = validateSweatInput(input);
    if (Object.keys(found).length > 0) {
      // Never show a fabricated sweat rate: keep the previous result cleared.
      setErrors(found);
      setResult(null);
      return;
    }
    setErrors({});
    setResult(calculateSweatLoss(input));
  };

  const fieldError = (field: SweatField): string | undefined => {
    if (!errors[field]) return undefined;
    // A zero/absent duration is the one case worth calling out specifically —
    // it is what would otherwise divide by zero.
    return field === 'exerciseDurationMinutes'
      ? th.sweat.errors.duration
      : th.sweat.errors.value;
  };

  const sweatRows: Array<{ key: string; label: string; value: string }> = result
    ? [
        {
          key: 'netSweatLoss',
          label: th.sweat.results.netSweatLoss,
          value: `${liters(result.netSweatLossLiters)} ${units.liters}`,
        },
        {
          key: 'sweatRate',
          label: th.sweat.results.sweatRate,
          value: `${liters(result.sweatRateLitersPerHour)} ${units.litersPerHour}`,
        },
        {
          key: 'dehydration',
          label: th.sweat.results.dehydration,
          value: `${formatNumber(result.dehydrationPercent, locale, {
            maximumFractionDigits: 2,
          })}${units.percent}`,
        },
        {
          key: 'replacement',
          label: th.sweat.results.replacement,
          value: `${liters(result.replacementMinLiters)}–${liters(
            result.replacementMaxLiters,
          )} ${units.liters}`,
        },
        {
          key: 'drinkingRate',
          label: th.sweat.results.drinkingRate,
          value: `${liters(result.suggestedDrinkingRateLitersPerHour)} ${units.litersPerHour}`,
        },
      ]
    : [];

  return (
    <section className={cn(CARD, 'mt-4 p-6')} aria-labelledby="mc-hydration-title">
      <header className="flex items-start gap-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-black/10 text-black/60">
          <Droplets aria-hidden className="size-4" />
        </span>
        <div>
          <h2 id="mc-hydration-title" className="text-lg font-bold text-black">
            {th.title}
          </h2>
          <p className="mt-1 text-sm text-black/55">{th.subtitle}</p>
        </div>
      </header>

      {/* Baseline references — total water already includes beverages. */}
      <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { key: 'total', label: th.totalWaterLabel, value: hydration.totalWaterLiters },
          { key: 'beverage', label: th.beverageLabel, value: hydration.beverageFluidLiters },
        ].map((item) => (
          <div key={item.key} className="rounded-xl border border-black/10 bg-black/5 p-4">
            <dt className="text-xs font-medium text-black/50">{item.label}</dt>
            <dd className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-black">
                ≈ {formatNumber(item.value, locale, { maximumFractionDigits: 1 })}
              </span>
              <span className="text-xs text-black/45">{units.liters}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 space-y-2 text-sm leading-relaxed text-black/60">
        <p>{th.splitNote}</p>
        <p>{th.doNotAddNote}</p>
      </div>

      <p className="mt-4 flex items-start gap-3 rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm leading-relaxed text-black/70">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-black/40" />
        {th.increaseNote}
      </p>

      {/* Optional sweat-loss calculator. */}
      <details className="mt-4 rounded-xl border border-black/10 bg-black/5">
        <summary className="cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70">
          {th.sweat.title}
        </summary>
        <div className="border-t border-black/10 px-4 py-5">
          <p className="text-sm leading-relaxed text-black/55">{th.sweat.intro}</p>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <NumberField
              id="mc-sweat-pre"
              label={th.sweat.fields.preExerciseWeightKg}
              unit={units.kg}
              inputMode="decimal"
              value={draft.preExerciseWeightKg}
              onChange={(preExerciseWeightKg) => set({ preExerciseWeightKg })}
              error={fieldError('preExerciseWeightKg')}
            />
            <NumberField
              id="mc-sweat-post"
              label={th.sweat.fields.postExerciseWeightKg}
              unit={units.kg}
              inputMode="decimal"
              value={draft.postExerciseWeightKg}
              onChange={(postExerciseWeightKg) => set({ postExerciseWeightKg })}
              error={fieldError('postExerciseWeightKg')}
            />
            <NumberField
              id="mc-sweat-duration"
              label={th.sweat.fields.exerciseDurationMinutes}
              unit={units.minutes}
              value={draft.exerciseDurationMinutes}
              onChange={(exerciseDurationMinutes) => set({ exerciseDurationMinutes })}
              error={fieldError('exerciseDurationMinutes')}
            />
            <NumberField
              id="mc-sweat-fluid"
              label={th.sweat.fields.fluidConsumedLiters}
              unit={units.liters}
              inputMode="decimal"
              value={draft.fluidConsumedLiters}
              onChange={(fluidConsumedLiters) => set({ fluidConsumedLiters })}
              error={fieldError('fluidConsumedLiters')}
            />
            <NumberField
              id="mc-sweat-urine"
              label={th.sweat.fields.urineProducedLiters}
              unit={units.liters}
              inputMode="decimal"
              value={draft.urineProducedLiters}
              onChange={(urineProducedLiters) => set({ urineProducedLiters })}
              error={fieldError('urineProducedLiters')}
            />
          </div>

          <div className="mt-5">
            <CheckboxField
              id="mc-sweat-hot"
              label={th.sweat.fields.hotOrHumid}
              checked={draft.hotOrHumid}
              onChange={(hotOrHumid) => set({ hotOrHumid })}
            />
          </div>

          <button
            type="button"
            onClick={submit}
            className="mt-5 inline-flex items-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-black shadow-[0_0_24px_-8px_#16924e] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {th.sweat.submit}
          </button>

          <div aria-live="polite">
            {result ? (
              <>
                <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {sweatRows.map((row) => (
                    <div
                      key={row.key}
                      className="flex items-baseline justify-between gap-3 rounded-xl border border-black/10 bg-black/5 px-4 py-3"
                    >
                      <dt className="text-xs text-black/55">{row.label}</dt>
                      <dd className="font-mono text-sm font-semibold text-black">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 space-y-2 text-sm leading-relaxed text-black/60">
                  <p>{th.sweat.replacementNote}</p>
                  <p>{th.sweat.drinkingRateNote}</p>
                </div>
                {result.warnings.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {result.warnings.map((warning) => (
                      <li
                        key={warning}
                        className="flex items-start gap-3 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm leading-relaxed text-black/80"
                      >
                        <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
                        {th.sweat.warnings[warning]}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </details>

      {/* Daily feedback + clinical safety. */}
      <ul className="mt-5 space-y-1.5 text-sm leading-relaxed text-black/60">
        {th.feedback.map((line) => (
          <li key={line} className="flex gap-2">
            <span aria-hidden className="text-black/30">
              •
            </span>
            {line}
          </li>
        ))}
      </ul>

      <p className="mt-4 flex items-start gap-3 rounded-xl border border-black/15 bg-black/10 px-4 py-3 text-sm leading-relaxed text-black/75">
        <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-black/45" />
        {th.safety}
      </p>
    </section>
  );
}
