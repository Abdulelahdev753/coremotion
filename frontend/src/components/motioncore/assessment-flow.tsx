'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useReducer } from 'react';

import { ChipToggle, FieldGroup, NumberField, OptionCard } from '@/components/motioncore/fields';
import { MotionCoreShell } from '@/components/motioncore/motioncore-shell';
import { useLanguage } from '@/components/providers/language-provider';
import { paceRateKgPerWeek, validateAssessment } from '@/lib/motioncore/engine';
import { fillTemplate, formatNumber } from '@/lib/motioncore/format';
import { loadProfile, saveProfile } from '@/lib/motioncore/storage';
import {
  INPUT_BOUNDS,
  type ActivityLevel,
  type AssessmentInput,
  type DaysPerWeek,
  type DietExclusion,
  type Equipment,
  type Goal,
  type Pace,
  type Sex,
  type TrainingLevel,
} from '@/lib/motioncore/types';
import { cn } from '@/lib/utils';

const STEPS = ['basics', 'activity', 'goal', 'preferences'] as const;
type StepId = (typeof STEPS)[number];

type Draft = {
  sex?: Sex;
  age: string;
  heightCm: string;
  weightKg: string;
  activity?: ActivityLevel;
  trainingLevel?: TrainingLevel;
  daysPerWeek?: DaysPerWeek;
  goal?: Goal;
  pace: Pace;
  equipment?: Equipment;
  exclusions: DietExclusion[];
};

type NumericField = 'age' | 'heightCm' | 'weightKg';

type State = {
  step: number;
  draft: Draft;
  errors: Partial<Record<NumericField, string>>;
};

type Action =
  | { type: 'set'; patch: Partial<Draft> }
  | { type: 'toggleExclusion'; exclusion: DietExclusion }
  | { type: 'errors'; errors: State['errors'] }
  | { type: 'goTo'; step: number }
  | { type: 'prefill'; draft: Draft };

const initialState: State = {
  step: 0,
  draft: { age: '', heightCm: '', weightKg: '', pace: 'standard', exclusions: [] },
  errors: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set':
      return { ...state, draft: { ...state.draft, ...action.patch }, errors: {} };
    case 'toggleExclusion': {
      const has = state.draft.exclusions.includes(action.exclusion);
      const exclusions = has
        ? state.draft.exclusions.filter((item) => item !== action.exclusion)
        : [...state.draft.exclusions, action.exclusion];
      return { ...state, draft: { ...state.draft, exclusions } };
    }
    case 'errors':
      return { ...state, errors: action.errors };
    case 'goTo':
      return { ...state, step: action.step, errors: {} };
    case 'prefill':
      return { ...state, draft: action.draft };
  }
}

const ACTIVITY_LEVELS: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'very', 'athlete'];
const TRAINING_LEVELS: TrainingLevel[] = ['beginner', 'intermediate', 'advanced'];
const TRAINING_DAYS: DaysPerWeek[] = [3, 4, 5];
const GOALS: Goal[] = ['fatLoss', 'muscleGain', 'fitness'];
const PACES: Pace[] = ['gentle', 'standard', 'aggressive'];
const EQUIPMENT: Equipment[] = ['none', 'dumbbells', 'gym'];
const EXCLUSIONS: DietExclusion[] = ['dairy', 'eggs', 'nuts', 'gluten', 'seafood'];

export function AssessmentFlow() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, draft, errors } = state;

  const ta = t.motioncore.assessment;
  const stepId: StepId = STEPS[step];

  // Re-assessment: prefill from the saved profile once after mount.
  useEffect(() => {
    const stored = loadProfile();
    if (!stored) return;
    const { assessment } = stored;
    dispatch({
      type: 'prefill',
      draft: {
        sex: assessment.sex,
        age: String(assessment.age),
        heightCm: String(assessment.heightCm),
        weightKg: String(assessment.weightKg),
        activity: assessment.activity,
        trainingLevel: assessment.trainingLevel,
        daysPerWeek: assessment.daysPerWeek,
        goal: assessment.goal,
        pace: assessment.pace,
        equipment: assessment.equipment,
        exclusions: assessment.exclusions,
      },
    });
  }, []);

  const numericBoundsError = (field: NumericField): string | undefined => {
    const bounds = INPUT_BOUNDS[field];
    const value = Number(draft[field]);
    if (!Number.isFinite(value) || value < bounds.min || value > bounds.max) {
      return fillTemplate(ta.rangeError, { min: bounds.min, max: bounds.max });
    }
    return undefined;
  };

  const stepComplete: boolean = (() => {
    switch (stepId) {
      case 'basics':
        return Boolean(draft.sex && draft.age && draft.heightCm && draft.weightKg);
      case 'activity':
        return Boolean(draft.activity && draft.trainingLevel && draft.daysPerWeek);
      case 'goal':
        return Boolean(draft.goal);
      case 'preferences':
        return Boolean(draft.equipment);
    }
  })();

  const next = () => {
    if (stepId === 'basics') {
      const stepErrors: State['errors'] = {};
      for (const field of ['age', 'heightCm', 'weightKg'] as const) {
        const error = numericBoundsError(field);
        if (error) stepErrors[field] = error;
      }
      if (Object.keys(stepErrors).length > 0) {
        dispatch({ type: 'errors', errors: stepErrors });
        return;
      }
    }
    if (step < STEPS.length - 1) {
      dispatch({ type: 'goTo', step: step + 1 });
      return;
    }
    finish();
  };

  const finish = () => {
    const assessment: AssessmentInput = {
      sex: draft.sex!,
      age: Number(draft.age),
      heightCm: Number(draft.heightCm),
      weightKg: Number(draft.weightKg),
      activity: draft.activity!,
      trainingLevel: draft.trainingLevel!,
      goal: draft.goal!,
      // Pace is hidden for the fitness goal; normalize it for storage.
      pace: draft.goal === 'fitness' ? 'standard' : draft.pace,
      equipment: draft.equipment!,
      daysPerWeek: draft.daysPerWeek!,
      exclusions: draft.exclusions,
    };
    if (!validateAssessment(assessment)) {
      dispatch({ type: 'goTo', step: 0 });
      return;
    }
    saveProfile(assessment);
    router.push('/motioncore/dashboard');
  };

  const paceBadge = (pace: Pace): string => {
    if (!draft.goal || draft.goal === 'fitness') return '';
    const rate = paceRateKgPerWeek(draft.goal, pace);
    return fillTemplate(ta.paceHint, {
      rate: formatNumber(rate, locale, { signDisplay: 'always', maximumFractionDigits: 3 }),
    });
  };

  return (
    <MotionCoreShell className="max-w-2xl">
      {/* Step header + progress */}
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 rtl:tracking-normal">
          {fillTemplate(ta.stepOf, {
            current: formatNumber(step + 1, locale),
            total: formatNumber(STEPS.length, locale),
          })}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
          {ta.steps[stepId]}
        </h1>
        <div className="mt-6 flex gap-2" aria-hidden>
          {STEPS.map((id, index) => (
            <span
              key={id}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-500',
                index <= step ? 'bg-brand shadow-[0_0_12px_-2px_#d6ec1b]' : 'bg-white/10',
              )}
            />
          ))}
        </div>
      </header>

      {/* Step content — keyed so each step gets its entrance animation. */}
      <div key={stepId} className="mt-10 flex animate-in flex-col gap-8 fade-in slide-in-from-bottom-2 duration-300">
        {stepId === 'basics' && (
          <>
            <FieldGroup label={ta.fields.sex}>
              <div role="radiogroup" aria-label={ta.fields.sex} className="grid grid-cols-2 gap-3">
                {(['male', 'female'] as const).map((sex) => (
                  <OptionCard
                    key={sex}
                    selected={draft.sex === sex}
                    onSelect={() => dispatch({ type: 'set', patch: { sex } })}
                    label={ta.options.sex[sex]}
                  />
                ))}
              </div>
            </FieldGroup>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <NumberField
                id="mc-age"
                label={ta.fields.age}
                unit={t.motioncore.units.years}
                value={draft.age}
                onChange={(age) => dispatch({ type: 'set', patch: { age } })}
                error={errors.age}
              />
              <NumberField
                id="mc-height"
                label={ta.fields.heightCm}
                unit={t.motioncore.units.cm}
                value={draft.heightCm}
                onChange={(heightCm) => dispatch({ type: 'set', patch: { heightCm } })}
                error={errors.heightCm}
              />
              <NumberField
                id="mc-weight"
                label={ta.fields.weightKg}
                unit={t.motioncore.units.kg}
                value={draft.weightKg}
                onChange={(weightKg) => dispatch({ type: 'set', patch: { weightKg } })}
                error={errors.weightKg}
                inputMode="decimal"
              />
            </div>
          </>
        )}

        {stepId === 'activity' && (
          <>
            <FieldGroup label={ta.fields.activity}>
              <div role="radiogroup" aria-label={ta.fields.activity} className="grid grid-cols-1 gap-3">
                {ACTIVITY_LEVELS.map((level) => (
                  <OptionCard
                    key={level}
                    selected={draft.activity === level}
                    onSelect={() => dispatch({ type: 'set', patch: { activity: level } })}
                    label={ta.options.activity[level].label}
                    description={ta.options.activity[level].description}
                  />
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label={ta.fields.trainingLevel}>
              <div role="radiogroup" aria-label={ta.fields.trainingLevel} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {TRAINING_LEVELS.map((level) => (
                  <OptionCard
                    key={level}
                    selected={draft.trainingLevel === level}
                    onSelect={() => dispatch({ type: 'set', patch: { trainingLevel: level } })}
                    label={ta.options.trainingLevel[level].label}
                    description={ta.options.trainingLevel[level].description}
                  />
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label={ta.fields.daysPerWeek}>
              <div role="radiogroup" aria-label={ta.fields.daysPerWeek} className="flex flex-wrap gap-3">
                {TRAINING_DAYS.map((days) => (
                  <ChipToggle
                    key={days}
                    selected={draft.daysPerWeek === days}
                    onToggle={() => dispatch({ type: 'set', patch: { daysPerWeek: days } })}
                    label={fillTemplate(ta.daysLabel, { n: formatNumber(days, locale) })}
                  />
                ))}
              </div>
            </FieldGroup>
          </>
        )}

        {stepId === 'goal' && (
          <>
            <FieldGroup label={ta.fields.goal}>
              <div role="radiogroup" aria-label={ta.fields.goal} className="grid grid-cols-1 gap-3">
                {GOALS.map((goal) => (
                  <OptionCard
                    key={goal}
                    selected={draft.goal === goal}
                    onSelect={() => dispatch({ type: 'set', patch: { goal } })}
                    label={ta.options.goal[goal].label}
                    description={ta.options.goal[goal].description}
                  />
                ))}
              </div>
            </FieldGroup>
            {draft.goal && draft.goal !== 'fitness' ? (
              <FieldGroup label={ta.fields.pace}>
                <div role="radiogroup" aria-label={ta.fields.pace} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {PACES.map((pace) => (
                    <OptionCard
                      key={pace}
                      selected={draft.pace === pace}
                      onSelect={() => dispatch({ type: 'set', patch: { pace } })}
                      label={ta.options.pace[pace].label}
                      description={ta.options.pace[pace].description}
                      badge={paceBadge(pace)}
                    />
                  ))}
                </div>
              </FieldGroup>
            ) : null}
            {draft.goal === 'fitness' ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                {ta.maintainHint}
              </p>
            ) : null}
          </>
        )}

        {stepId === 'preferences' && (
          <>
            <FieldGroup label={ta.fields.equipment}>
              <div role="radiogroup" aria-label={ta.fields.equipment} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {EQUIPMENT.map((equipment) => (
                  <OptionCard
                    key={equipment}
                    selected={draft.equipment === equipment}
                    onSelect={() => dispatch({ type: 'set', patch: { equipment } })}
                    label={ta.options.equipment[equipment].label}
                    description={ta.options.equipment[equipment].description}
                  />
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label={ta.fields.exclusions} hint={ta.optional}>
              <div className="flex flex-wrap gap-2.5">
                {EXCLUSIONS.map((exclusion) => (
                  <ChipToggle
                    key={exclusion}
                    selected={draft.exclusions.includes(exclusion)}
                    onToggle={() => dispatch({ type: 'toggleExclusion', exclusion })}
                    label={ta.options.exclusions[exclusion]}
                  />
                ))}
              </div>
            </FieldGroup>
          </>
        )}
      </div>

      {/* Footer navigation */}
      <div className="mt-12 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => dispatch({ type: 'goTo', step: step - 1 })}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/75 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70',
            step === 0 && 'invisible',
          )}
        >
          <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
          {ta.back}
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!stepComplete}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-black shadow-[0_0_24px_-8px_#d6ec1b] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {step === STEPS.length - 1 ? ta.finish : ta.next}
          <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </button>
      </div>
    </MotionCoreShell>
  );
}
