'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useReducer } from 'react';

import {
  ChipToggle,
  Disclosure,
  FieldGroup,
  NumberField,
  OptionCard,
} from '@/components/motioncore/fields';
import { MotionCoreShell } from '@/components/motioncore/motioncore-shell';
import { useLanguage } from '@/components/providers/language-provider';
import { paceAdjustmentPercent, validateAssessment } from '@/lib/motioncore/engine';
import { fillTemplate, formatNumber } from '@/lib/motioncore/format';
import { isValidBodyFatPercent, type BmrFormulaChoice } from '@/lib/motioncore/nutrition';
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
  /** Optional inputs stay as strings so an empty field means "not supplied". */
  bodyFatPercent: string;
  bmrFormula: BmrFormulaChoice;
  currentAverageSteps: string;
  activity?: ActivityLevel;
  trainingLevel?: TrainingLevel;
  daysPerWeek?: DaysPerWeek;
  goal?: Goal;
  pace: Pace;
  equipment?: Equipment;
  exclusions: DietExclusion[];
};

type NumericField =
  | 'age'
  | 'heightCm'
  | 'weightKg'
  | 'bodyFatPercent'
  | 'currentAverageSteps';

type State = {
  step: number;
  draft: Draft;
  errors: Partial<Record<NumericField, string>>;
  /** The BMR formula sits behind a disclosure: most people never change it. */
  advancedOpen: boolean;
};

type Action =
  | { type: 'set'; patch: Partial<Draft> }
  | { type: 'errors'; errors: State['errors'] }
  | { type: 'goTo'; step: number }
  | { type: 'prefill'; draft: Draft }
  | { type: 'advanced'; open: boolean };

const initialState: State = {
  step: 0,
  advancedOpen: false,
  draft: {
    age: '',
    heightCm: '',
    weightKg: '',
    bodyFatPercent: '',
    bmrFormula: 'auto',
    currentAverageSteps: '',
    pace: 'standard',
    exclusions: [],
  },
  errors: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set':
      return { ...state, draft: { ...state.draft, ...action.patch }, errors: {} };
    case 'errors':
      return { ...state, errors: action.errors };
    case 'goTo':
      return { ...state, step: action.step, errors: {} };
    case 'prefill':
      // A saved non-default formula is surfaced rather than buried.
      return { ...state, draft: action.draft, advancedOpen: action.draft.bmrFormula !== 'auto' };
    case 'advanced':
      return { ...state, advancedOpen: action.open };
  }
}

const ACTIVITY_LEVELS: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'very', 'athlete'];
const TRAINING_LEVELS: TrainingLevel[] = ['beginner', 'intermediate', 'advanced'];
const TRAINING_DAYS: DaysPerWeek[] = [3, 4, 5];
const GOALS: Goal[] = ['fatLoss', 'muscleGain', 'fitness'];
const PACES: Pace[] = ['gentle', 'standard', 'aggressive'];
const EQUIPMENT: Equipment[] = ['none', 'dumbbells', 'gym'];
const BMR_FORMULAS: BmrFormulaChoice[] = ['auto', 'mifflin', 'katch'];

export function AssessmentFlow() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, draft, errors, advancedOpen } = state;

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
        bodyFatPercent:
          assessment.bodyFatPercent === undefined ? '' : String(assessment.bodyFatPercent),
        bmrFormula: assessment.bmrFormula ?? 'auto',
        currentAverageSteps:
          assessment.currentAverageSteps === undefined
            ? ''
            : String(assessment.currentAverageSteps),
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

  const rangeError = (field: NumericField): string =>
    fillTemplate(ta.rangeError, {
      min: INPUT_BOUNDS[field].min,
      max: INPUT_BOUNDS[field].max,
    });

  const numericBoundsError = (field: NumericField): string | undefined => {
    const bounds = INPUT_BOUNDS[field];
    const value = Number(draft[field]);
    if (!Number.isFinite(value) || value < bounds.min || value > bounds.max) {
      return rangeError(field);
    }
    return undefined;
  };

  /** Optional numeric field: blank is valid, anything present must be in range. */
  const optionalBoundsError = (field: 'currentAverageSteps'): string | undefined => {
    if (draft[field].trim() === '') return undefined;
    return numericBoundsError(field);
  };

  const bodyFatError = (): string | undefined => {
    const raw = draft.bodyFatPercent.trim();
    const supplied = raw !== '';
    if (supplied && !isValidBodyFatPercent(Number(raw))) return rangeError('bodyFatPercent');
    // Katch–McArdle is never swapped for Mifflin behind the user's back.
    if (draft.bmrFormula === 'katch' && !supplied) return ta.katchNeedsBodyFat;
    return undefined;
  };

  /** Inline validation for the current step; empty means the step can advance. */
  const validateStep = (): State['errors'] => {
    const stepErrors: State['errors'] = {};
    if (stepId === 'basics') {
      for (const field of ['age', 'heightCm', 'weightKg'] as const) {
        const error = numericBoundsError(field);
        if (error) stepErrors[field] = error;
      }
      const bodyFat = bodyFatError();
      if (bodyFat) stepErrors.bodyFatPercent = bodyFat;
    }
    if (stepId === 'activity') {
      const steps = optionalBoundsError('currentAverageSteps');
      if (steps) stepErrors.currentAverageSteps = steps;
    }
    return stepErrors;
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
    const stepErrors = validateStep();
    if (Object.keys(stepErrors).length > 0) {
      dispatch({ type: 'errors', errors: stepErrors });
      // Katch–McArdle without a body fat is fixable from either control, so
      // reveal the formula picker instead of only flagging the number field.
      if (draft.bmrFormula === 'katch' && draft.bodyFatPercent.trim() === '') {
        dispatch({ type: 'advanced', open: true });
      }
      return;
    }
    if (step < STEPS.length - 1) {
      dispatch({ type: 'goTo', step: step + 1 });
      return;
    }
    finish();
  };

  const finish = () => {
    const bodyFat = draft.bodyFatPercent.trim();
    const steps = draft.currentAverageSteps.trim();
    const assessment: AssessmentInput = {
      sex: draft.sex!,
      age: Number(draft.age),
      heightCm: Number(draft.heightCm),
      weightKg: Number(draft.weightKg),
      bodyFatPercent: bodyFat === '' ? undefined : Number(bodyFat),
      bmrFormula: draft.bmrFormula,
      currentAverageSteps: steps === '' ? undefined : Math.round(Number(steps)),
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

  // The badge states the calorie adjustment the pace applies, not a promised
  // rate of weight change.
  const paceBadge = (pace: Pace): string => {
    if (!draft.goal || draft.goal === 'fitness') return '';
    return fillTemplate(ta.paceHint, {
      percent: formatNumber(paceAdjustmentPercent(draft.goal, pace), locale, {
        signDisplay: 'always',
        maximumFractionDigits: 0,
      }),
    });
  };

  return (
    <MotionCoreShell className="max-w-2xl">
      {/* Step header + progress */}
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-black/40 rtl:tracking-normal">
          {fillTemplate(ta.stepOf, {
            current: formatNumber(step + 1, locale),
            total: formatNumber(STEPS.length, locale),
          })}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-black sm:text-4xl">
          {ta.steps[stepId]}
        </h1>
        <div className="mt-6 flex gap-2" aria-hidden>
          {STEPS.map((id, index) => (
            <span
              key={id}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-500',
                index <= step ? 'bg-brand shadow-[0_0_12px_-2px_#16924e]' : 'bg-black/10',
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
            {/* Optional: a known body-fat reading unlocks Katch–McArdle. */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <NumberField
                id="mc-bodyfat"
                label={ta.fields.bodyFatPercent}
                hint={ta.optional}
                help={ta.hints.bodyFat}
                unit={t.motioncore.units.percent}
                value={draft.bodyFatPercent}
                onChange={(bodyFatPercent) =>
                  dispatch({ type: 'set', patch: { bodyFatPercent } })
                }
                error={errors.bodyFatPercent}
                inputMode="decimal"
              />
            </div>
            <Disclosure
              id="mc-advanced"
              label={ta.advanced}
              summary={ta.options.bmrFormula[draft.bmrFormula].label}
              open={advancedOpen}
              onToggle={() => dispatch({ type: 'advanced', open: !advancedOpen })}
            >
              <FieldGroup label={ta.fields.bmrFormula} hint={ta.hints.formula}>
                <div
                  role="radiogroup"
                  aria-label={ta.fields.bmrFormula}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                >
                  {BMR_FORMULAS.map((formula) => (
                    <OptionCard
                      key={formula}
                      selected={draft.bmrFormula === formula}
                      onSelect={() => dispatch({ type: 'set', patch: { bmrFormula: formula } })}
                      label={ta.options.bmrFormula[formula].label}
                      description={ta.options.bmrFormula[formula].description}
                    />
                  ))}
                </div>
              </FieldGroup>
            </Disclosure>
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
            {/* Optional: drives the walking progression only — never calories. */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <NumberField
                id="mc-steps"
                label={ta.fields.currentAverageSteps}
                hint={ta.optional}
                help={ta.hints.steps}
                unit={t.motioncore.units.steps}
                value={draft.currentAverageSteps}
                onChange={(currentAverageSteps) =>
                  dispatch({ type: 'set', patch: { currentAverageSteps } })
                }
                error={errors.currentAverageSteps}
              />
            </div>
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
              <p className="rounded-2xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/60">
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
          </>
        )}
      </div>

      {/* Footer navigation */}
      <div className="mt-12 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => dispatch({ type: 'goTo', step: step - 1 })}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium text-black/75 transition-colors hover:border-black/30 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70',
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
          className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-black shadow-[0_0_24px_-8px_#16924e] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {step === STEPS.length - 1 ? ta.finish : ta.next}
          <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </button>
      </div>
    </MotionCoreShell>
  );
}
