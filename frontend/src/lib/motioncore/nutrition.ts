/**
 * Pure nutrition / hydration / walking math.
 *
 * Nothing in here touches React, the DOM, storage or i18n — the UI layer maps
 * its own vocabulary onto these inputs and translates the returned warning
 * codes. Keep it that way: every number the dashboard shows must be derivable
 * (and unit-testable) from this module alone.
 *
 * Worked example used by the tests: male, 25 y, 65 kg, 180 cm, moderately
 * active, maintenance, automatic formula, no body fat →
 * BMR 1655, TDEE 2565.25, protein 117 g, fat 71 g, carbs 365 g, 2567 kcal.
 */

import type { ActivityLevel, Sex } from './types';

/** Which basal-metabolic-rate equation produced the result. */
export type BmrFormula = 'mifflin' | 'katch';

/** What the caller asked for — `auto` picks Katch–McArdle when body fat is known. */
export type BmrFormulaChoice = 'auto' | BmrFormula;

/** Percentage-based calorie goals, independent of the app's goal/pace wording. */
export type CalorieGoal =
  | 'moderateLoss'
  | 'mildLoss'
  | 'maintain'
  | 'leanGain'
  | 'standardGain';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Mifflin–St Jeor coefficients (metric: kg, cm, years). */
const MIFFLIN_WEIGHT_COEFFICIENT = 10;
const MIFFLIN_HEIGHT_COEFFICIENT = 6.25;
const MIFFLIN_AGE_COEFFICIENT = 5;
const MIFFLIN_SEX_OFFSET: Record<Sex, number> = { male: 5, female: -161 };

/** Katch–McArdle coefficients, applied to lean body mass in kg. */
const KATCH_BASE = 370;
const KATCH_LEAN_MASS_COEFFICIENT = 21.6;

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  athlete: 1.9,
};

export const GOAL_MULTIPLIERS: Record<CalorieGoal, number> = {
  moderateLoss: 0.8,
  mildLoss: 0.9,
  maintain: 1.0,
  leanGain: 1.05,
  standardGain: 1.1,
};

/** General-audience safety floor for weight-loss targets, kcal/day. */
export const CALORIE_MINIMUM: Record<Sex, number> = { male: 1500, female: 1200 };

/** Atwater energy factors, kcal per gram. */
export const KCAL_PER_G_PROTEIN = 4;
export const KCAL_PER_G_CARB = 4;
export const KCAL_PER_G_FAT = 9;

export const PROTEIN_G_PER_KG: Record<CalorieGoal, number> = {
  moderateLoss: 2.2,
  mildLoss: 2.0,
  maintain: 1.8,
  leanGain: 1.8,
  standardGain: 1.8,
};

/** Protein may not eat more than this share of the day's calories. */
export const MAX_PROTEIN_CALORIE_SHARE = 0.35;

/** Fat always takes this share of the day's calories; carbs get the rest. */
export const FAT_CALORIE_SHARE = 0.25;

/** Total-water references for healthy adults (food + all beverages), ml/day. */
export const HYDRATION_REFERENCE: Record<
  Sex,
  { totalWaterMl: number; beverageFluidMl: number }
> = {
  male: { totalWaterMl: 3700, beverageFluidMl: 3000 },
  female: { totalWaterMl: 2700, beverageFluidMl: 2200 },
};

/** Roughly how total water splits between drinks and food, in percent. */
export const BEVERAGE_SHARE_PERCENT = 80;
export const FOOD_SHARE_PERCENT = 20;

/** Post-exercise replacement is a range over gradual recovery, not one drink. */
export const REPLACEMENT_MIN_FACTOR = 1.25;
export const REPLACEMENT_MAX_FACTOR = 1.5;

/** Sweat-loss warning thresholds. */
export const DEHYDRATION_WARNING_PERCENT = 2;
export const HIGH_SWEAT_RATE_L_PER_H = 1.5;
export const HIGH_DRINKING_RATE_L_PER_H = 1;

/** Evidence-informed step targets — health references, not prescriptions. */
export const GENERAL_HEALTH_STEP_REFERENCE = 7000;
export const OLDER_ADULT_AGE = 60;
const STEP_TARGETS = {
  younger: { recommended: 9000, min: 8000, max: 10000 },
  older: { recommended: 7000, min: 6000, max: 8000 },
} as const;

/** Progression increment and the rounding grain applied to the next target. */
export const STEP_PROGRESSION_INCREMENT = 1000;
export const STEP_PROGRESSION_ROUNDING = 500;

/** WHO-aligned weekly physical-activity guidance. */
export const WEEKLY_MODERATE_MINUTES_MIN = 150;
export const WEEKLY_MODERATE_MINUTES_MAX = 300;
export const STRENGTH_TRAINING_DAYS = 2;

/** Hard input bounds — the form and `calculateNutritionPlan` both enforce these. */
export const NUTRITION_BOUNDS = {
  age: { min: 18, max: 80 },
  weightKg: { min: 35, max: 300 },
  heightCm: { min: 120, max: 250 },
  /** Exclusive on both ends: strictly greater than 2 and strictly less than 70. */
  bodyFatPercent: { min: 2, max: 70 },
  currentAverageSteps: { min: 0, max: 100000 },
  exerciseDurationMinutes: { min: 1, max: 1440 },
  fluidLiters: { min: 0, max: 20 },
} as const;

// ---------------------------------------------------------------------------
// Input / output shapes
// ---------------------------------------------------------------------------

export type NutritionInput = {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: ActivityLevel;
  goal: CalorieGoal;
  /** Optional — enables Katch–McArdle. */
  bodyFatPercent?: number | null;
  /** Defaults to `auto`. */
  formula?: BmrFormulaChoice;
  /** Optional 7-day average, drives the walking progression. */
  currentAverageSteps?: number | null;
  /** Optional post-workout measurements, drives the sweat-loss block. */
  sweat?: SweatInput | null;
};

export type SweatInput = {
  preExerciseWeightKg: number;
  postExerciseWeightKg: number;
  exerciseDurationMinutes: number;
  fluidConsumedLiters: number;
  /** Defaults to 0. */
  urineProducedLiters?: number | null;
  hotOrHumid?: boolean;
};

/** Warning codes; the UI owns the translated copy for each. */
export type NutritionWarning = 'calorieMinimumApplied' | 'proteinCapApplied';
export type HydrationWarning =
  | 'dehydration'
  | 'highSweatRate'
  | 'highDrinkingRate'
  | 'hotConditions';
export type WalkingWarning = 'alreadyMeetsTarget';

/** Outcome of one paired weigh-in; all liters/percentages rounded for display. */
export type SweatLossResult = {
  bodyMassLossLiters: number;
  netSweatLossLiters: number;
  sweatRateLitersPerHour: number;
  dehydrationPercent: number;
  /** Never faster than the measured sweat rate. */
  suggestedDrinkingRateLitersPerHour: number;
  replacementMinLiters: number;
  replacementMaxLiters: number;
  warnings: HydrationWarning[];
};

export type HydrationResult = {
  totalWaterMl: number;
  totalWaterLiters: number;
  beverageFluidMl: number;
  beverageFluidLiters: number;
  /** Sweat fields are null until post-exercise measurements are supplied. */
  bodyMassLossLiters: number | null;
  netSweatLossLiters: number | null;
  sweatRateLitersPerHour: number | null;
  dehydrationPercent: number | null;
  /** Never faster than the measured sweat rate. */
  suggestedDrinkingRateLitersPerHour: number | null;
  replacementMinLiters: number | null;
  replacementMaxLiters: number | null;
  warnings: HydrationWarning[];
};

export type WalkingResult = {
  generalHealthReference: number;
  recommendedSteps: number;
  recommendedRangeMin: number;
  recommendedRangeMax: number;
  currentAverageSteps: number | null;
  nextStepTarget: number | null;
  weeklyModerateMinutesMin: number;
  weeklyModerateMinutesMax: number;
  strengthTrainingDays: number;
  warnings: WalkingWarning[];
};

export type NutritionResult = {
  formulaUsed: BmrFormula;
  /** Full precision — round only for display. */
  bmr: number;
  tdee: number;
  calculatedTargetCalories: number;
  recommendedTargetCalories: number;
  /** Rebuilt from the rounded grams so displayed kcal match displayed macros. */
  macroCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  activityMultiplier: number;
  goalMultiplier: number;
  /** Signed percentage the goal applies to maintenance, e.g. −20 or +10. */
  goalAdjustmentPercent: number;
  calorieMinimumApplied: boolean;
  proteinCapApplied: boolean;
  warnings: NutritionWarning[];
  hydration: HydrationResult;
  walking: WalkingResult;
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type NutritionField =
  | 'age'
  | 'weightKg'
  | 'heightCm'
  | 'bodyFatPercent'
  | 'currentAverageSteps';

export type SweatField =
  | 'preExerciseWeightKg'
  | 'postExerciseWeightKg'
  | 'exerciseDurationMinutes'
  | 'fluidConsumedLiters'
  | 'urineProducedLiters';

/**
 * `range` — present but outside the allowed bounds (also covers NaN/Infinity).
 * `bodyFatRequired` — Katch–McArdle was chosen explicitly with no valid body
 * fat; the formula is never swapped silently.
 */
export type FieldErrorCode = 'required' | 'range' | 'bodyFatRequired';

export type NutritionErrors = Partial<Record<NutritionField, FieldErrorCode>>;
export type SweatErrors = Partial<Record<SweatField, FieldErrorCode>>;

function isFinitePositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function inRange(value: number, bounds: { min: number; max: number }): boolean {
  return value >= bounds.min && value <= bounds.max;
}

/** True for a body-fat reading usable by Katch–McArdle: 2 < bf < 70. */
export function isValidBodyFatPercent(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > NUTRITION_BOUNDS.bodyFatPercent.min &&
    value < NUTRITION_BOUNDS.bodyFatPercent.max
  );
}

/** Empty object = valid. Optional fields only error when actually supplied. */
export function validateNutritionInput(input: NutritionInput): NutritionErrors {
  const errors: NutritionErrors = {};

  for (const field of ['age', 'weightKg', 'heightCm'] as const) {
    const value = input[field];
    if (value === undefined || value === null || (value as unknown) === '') {
      errors[field] = 'required';
    } else if (!isFinitePositive(value) || !inRange(value, NUTRITION_BOUNDS[field])) {
      errors[field] = 'range';
    }
  }

  const bodyFat = input.bodyFatPercent;
  const bodyFatSupplied = bodyFat !== undefined && bodyFat !== null;
  if (bodyFatSupplied && !isValidBodyFatPercent(bodyFat)) {
    errors.bodyFatPercent = 'range';
  } else if (input.formula === 'katch' && !isValidBodyFatPercent(bodyFat)) {
    // Explicit Katch–McArdle without a usable reading is an error, not a
    // silent fallback to Mifflin–St Jeor.
    errors.bodyFatPercent = 'bodyFatRequired';
  }

  const steps = input.currentAverageSteps;
  if (steps !== undefined && steps !== null) {
    if (
      typeof steps !== 'number' ||
      !Number.isFinite(steps) ||
      !inRange(steps, NUTRITION_BOUNDS.currentAverageSteps)
    ) {
      errors.currentAverageSteps = 'range';
    }
  }

  return errors;
}

export function validateSweatInput(input: SweatInput): SweatErrors {
  const errors: SweatErrors = {};

  for (const field of ['preExerciseWeightKg', 'postExerciseWeightKg'] as const) {
    const value = input[field];
    if (value === undefined || value === null || (value as unknown) === '') {
      errors[field] = 'required';
    } else if (!isFinitePositive(value) || !inRange(value, NUTRITION_BOUNDS.weightKg)) {
      errors[field] = 'range';
    }
  }

  const duration = input.exerciseDurationMinutes;
  if (duration === undefined || duration === null || (duration as unknown) === '') {
    errors.exerciseDurationMinutes = 'required';
  } else if (
    !isFinitePositive(duration) ||
    !inRange(duration, NUTRITION_BOUNDS.exerciseDurationMinutes)
  ) {
    // Zero or negative duration would divide by zero in the sweat rate.
    errors.exerciseDurationMinutes = 'range';
  }

  const fluid = input.fluidConsumedLiters;
  if (fluid === undefined || fluid === null || (fluid as unknown) === '') {
    errors.fluidConsumedLiters = 'required';
  } else if (
    typeof fluid !== 'number' ||
    !Number.isFinite(fluid) ||
    !inRange(fluid, NUTRITION_BOUNDS.fluidLiters)
  ) {
    errors.fluidConsumedLiters = 'range';
  }

  const urine = input.urineProducedLiters;
  if (urine !== undefined && urine !== null) {
    if (
      typeof urine !== 'number' ||
      !Number.isFinite(urine) ||
      !inRange(urine, NUTRITION_BOUNDS.fluidLiters)
    ) {
      errors.urineProducedLiters = 'range';
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Energy
// ---------------------------------------------------------------------------

/** Mifflin–St Jeor BMR, kcal/day, unrounded. */
export function mifflinStJeorBmr(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number,
): number {
  return (
    MIFFLIN_WEIGHT_COEFFICIENT * weightKg +
    MIFFLIN_HEIGHT_COEFFICIENT * heightCm -
    MIFFLIN_AGE_COEFFICIENT * age +
    MIFFLIN_SEX_OFFSET[sex]
  );
}

/** Katch–McArdle BMR, kcal/day, unrounded. */
export function katchMcArdleBmr(weightKg: number, bodyFatPercent: number): number {
  const leanMassKg = weightKg * (1 - bodyFatPercent / 100);
  return KATCH_BASE + KATCH_LEAN_MASS_COEFFICIENT * leanMassKg;
}

/** Katch–McArdle when body fat is known (or demanded), Mifflin–St Jeor otherwise. */
export function resolveFormula(
  choice: BmrFormulaChoice,
  bodyFatPercent: number | null | undefined,
): BmrFormula {
  if (choice === 'mifflin') return 'mifflin';
  if (choice === 'katch') return 'katch';
  return isValidBodyFatPercent(bodyFatPercent) ? 'katch' : 'mifflin';
}

/** Signed percentage a goal applies to maintenance calories (−20, 0, +10 …). */
export function goalAdjustmentPercent(goal: CalorieGoal): number {
  return round(GOAL_MULTIPLIERS[goal] * 100 - 100, 2);
}

// ---------------------------------------------------------------------------
// Hydration
// ---------------------------------------------------------------------------

/**
 * Sweat loss from a paired weigh-in. Returns null when the inputs cannot
 * support the math (notably a zero or missing exercise duration) — the caller
 * shows validation feedback instead of a fabricated rate.
 */
export function calculateSweatLoss(input: SweatInput): SweatLossResult | null {
  if (Object.keys(validateSweatInput(input)).length > 0) return null;

  const {
    preExerciseWeightKg: pre,
    postExerciseWeightKg: post,
    exerciseDurationMinutes,
    fluidConsumedLiters,
  } = input;
  const urineProducedLiters = input.urineProducedLiters ?? 0;

  // 1 kg of acute body-mass change ≈ 1 L of fluid.
  const bodyMassLossLiters = pre - post;
  const netSweatLossLiters = Math.max(
    0,
    bodyMassLossLiters + fluidConsumedLiters - urineProducedLiters,
  );
  const exerciseHours = exerciseDurationMinutes / 60;
  const sweatRateLitersPerHour = netSweatLossLiters / exerciseHours;
  const dehydrationPercent = (Math.max(0, pre - post) / pre) * 100;

  // Drinking during exercise is never recommended faster than sweat is lost.
  const suggestedDrinkingRateLitersPerHour = sweatRateLitersPerHour;

  const rounded = {
    bodyMassLossLiters: round(bodyMassLossLiters, 2),
    netSweatLossLiters: round(netSweatLossLiters, 2),
    sweatRateLitersPerHour: round(sweatRateLitersPerHour, 2),
    dehydrationPercent: round(dehydrationPercent, 2),
    suggestedDrinkingRateLitersPerHour: round(suggestedDrinkingRateLitersPerHour, 2),
    replacementMinLiters: round(netSweatLossLiters * REPLACEMENT_MIN_FACTOR, 2),
    replacementMaxLiters: round(netSweatLossLiters * REPLACEMENT_MAX_FACTOR, 2),
  };

  // Warn off the rounded values so the copy always matches the shown numbers.
  const warnings: HydrationWarning[] = [];
  if (rounded.dehydrationPercent >= DEHYDRATION_WARNING_PERCENT) warnings.push('dehydration');
  if (rounded.sweatRateLitersPerHour > HIGH_SWEAT_RATE_L_PER_H) warnings.push('highSweatRate');
  if (rounded.suggestedDrinkingRateLitersPerHour > HIGH_DRINKING_RATE_L_PER_H) {
    warnings.push('highDrinkingRate');
  }
  if (input.hotOrHumid) warnings.push('hotConditions');

  return { ...rounded, warnings };
}

export function calculateHydration(sex: Sex, sweat?: SweatInput | null): HydrationResult {
  const { totalWaterMl, beverageFluidMl } = HYDRATION_REFERENCE[sex];
  const sweatResult = sweat ? calculateSweatLoss(sweat) : null;

  return {
    totalWaterMl,
    totalWaterLiters: totalWaterMl / 1000,
    beverageFluidMl,
    beverageFluidLiters: beverageFluidMl / 1000,
    bodyMassLossLiters: sweatResult?.bodyMassLossLiters ?? null,
    netSweatLossLiters: sweatResult?.netSweatLossLiters ?? null,
    sweatRateLitersPerHour: sweatResult?.sweatRateLitersPerHour ?? null,
    dehydrationPercent: sweatResult?.dehydrationPercent ?? null,
    suggestedDrinkingRateLitersPerHour:
      sweatResult?.suggestedDrinkingRateLitersPerHour ?? null,
    replacementMinLiters: sweatResult?.replacementMinLiters ?? null,
    replacementMaxLiters: sweatResult?.replacementMaxLiters ?? null,
    warnings: sweatResult?.warnings ?? [],
  };
}

// ---------------------------------------------------------------------------
// Walking
// ---------------------------------------------------------------------------

export function calculateWalking(
  age: number,
  currentAverageSteps?: number | null,
): WalkingResult {
  const target = age >= OLDER_ADULT_AGE ? STEP_TARGETS.older : STEP_TARGETS.younger;

  const stepsUsable =
    typeof currentAverageSteps === 'number' &&
    Number.isFinite(currentAverageSteps) &&
    currentAverageSteps >= NUTRITION_BOUNDS.currentAverageSteps.min &&
    currentAverageSteps <= NUTRITION_BOUNDS.currentAverageSteps.max;
  const current = stepsUsable ? Math.round(currentAverageSteps as number) : null;

  const warnings: WalkingWarning[] = [];
  let nextStepTarget: number | null = null;
  if (current !== null) {
    if (current >= target.recommended) {
      // Meeting the target is the end of the progression, never a new floor.
      nextStepTarget = current;
      warnings.push('alreadyMeetsTarget');
    } else {
      const raw = Math.min(target.recommended, current + STEP_PROGRESSION_INCREMENT);
      nextStepTarget =
        Math.round(raw / STEP_PROGRESSION_ROUNDING) * STEP_PROGRESSION_ROUNDING;
    }
  }

  return {
    generalHealthReference: GENERAL_HEALTH_STEP_REFERENCE,
    recommendedSteps: target.recommended,
    recommendedRangeMin: target.min,
    recommendedRangeMax: target.max,
    currentAverageSteps: current,
    nextStepTarget,
    weeklyModerateMinutesMin: WEEKLY_MODERATE_MINUTES_MIN,
    weeklyModerateMinutesMax: WEEKLY_MODERATE_MINUTES_MAX,
    strengthTrainingDays: STRENGTH_TRAINING_DAYS,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Full plan
// ---------------------------------------------------------------------------

export class NutritionValidationError extends Error {
  readonly errors: NutritionErrors;

  constructor(errors: NutritionErrors) {
    super(`Invalid nutrition input: ${Object.keys(errors).join(', ')}`);
    this.name = 'NutritionValidationError';
    this.errors = errors;
  }
}

/**
 * The single entry point. Throws `NutritionValidationError` rather than
 * returning half-computed numbers, so no caller can render NaN.
 *
 * Walking and hydration are reported alongside the energy targets but never
 * feed back into them: the activity multiplier already accounts for daily
 * movement, so adding step calories would double-count it.
 */
export function calculateNutritionPlan(input: NutritionInput): NutritionResult {
  const errors = validateNutritionInput(input);
  if (Object.keys(errors).length > 0) throw new NutritionValidationError(errors);

  const { sex, age, weightKg, heightCm, activity, goal } = input;
  const bodyFatPercent = input.bodyFatPercent ?? null;
  const formulaUsed = resolveFormula(input.formula ?? 'auto', bodyFatPercent);

  const bmr =
    formulaUsed === 'katch'
      ? katchMcArdleBmr(weightKg, bodyFatPercent as number)
      : mifflinStJeorBmr(sex, weightKg, heightCm, age);

  // Full precision all the way to the calorie target — no intermediate rounding.
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activity];
  const tdee = bmr * activityMultiplier;
  const goalMultiplier = GOAL_MULTIPLIERS[goal];
  const calculatedTargetCalories = tdee * goalMultiplier;

  // The floor lifts the *target* only; BMR and TDEE stay untouched.
  const isWeightLoss = goalMultiplier < 1;
  const minimumCalories = CALORIE_MINIMUM[sex];
  const recommendedTargetCalories = isWeightLoss
    ? Math.max(calculatedTargetCalories, minimumCalories)
    : calculatedTargetCalories;
  const calorieMinimumApplied =
    isWeightLoss && recommendedTargetCalories > calculatedTargetCalories;

  const weightBasedProtein = weightKg * PROTEIN_G_PER_KG[goal];
  const maximumProteinFromCalories =
    (recommendedTargetCalories * MAX_PROTEIN_CALORIE_SHARE) / KCAL_PER_G_PROTEIN;
  const proteinCapApplied = weightBasedProtein > maximumProteinFromCalories;
  const proteinGrams = Math.round(Math.min(weightBasedProtein, maximumProteinFromCalories));

  const fatGrams = Math.round(
    (recommendedTargetCalories * FAT_CALORIE_SHARE) / KCAL_PER_G_FAT,
  );

  // Carbs absorb the remainder, and can never go negative.
  const carbGrams = Math.max(
    0,
    Math.round(
      (recommendedTargetCalories -
        proteinGrams * KCAL_PER_G_PROTEIN -
        fatGrams * KCAL_PER_G_FAT) /
        KCAL_PER_G_CARB,
    ),
  );

  // Displayed calories are rebuilt from the rounded grams so the two agree.
  const macroCalories =
    proteinGrams * KCAL_PER_G_PROTEIN +
    carbGrams * KCAL_PER_G_CARB +
    fatGrams * KCAL_PER_G_FAT;

  const warnings: NutritionWarning[] = [];
  if (calorieMinimumApplied) warnings.push('calorieMinimumApplied');
  if (proteinCapApplied) warnings.push('proteinCapApplied');

  return {
    formulaUsed,
    bmr,
    tdee,
    calculatedTargetCalories,
    recommendedTargetCalories,
    macroCalories,
    proteinGrams,
    carbGrams,
    fatGrams,
    activityMultiplier,
    goalMultiplier,
    goalAdjustmentPercent: goalAdjustmentPercent(goal),
    calorieMinimumApplied,
    proteinCapApplied,
    warnings,
    hydration: calculateHydration(sex, input.sweat),
    walking: calculateWalking(age, input.currentAverageSteps),
  };
}

/** Rounds to `digits` decimals without leaking binary-float noise. */
function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
