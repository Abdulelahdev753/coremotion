/**
 * Maps the MotionCore assessment vocabulary (goal + pace) onto the pure
 * calculator in ./nutrition and shapes the result into `DailyTargets`.
 *
 * Kept separate from ./engine so it stays free of meal/workout imports and can
 * be unit-tested on its own.
 */

import {
  NUTRITION_BOUNDS,
  calculateNutritionPlan,
  goalAdjustmentPercent,
  isValidBodyFatPercent,
  validateNutritionInput,
  type CalorieGoal,
  type NutritionInput,
  // Explicit extension: this module is loaded directly by `node --test`.
} from './nutrition.ts';
import type { AssessmentInput, DailyTargets, Goal, Pace } from './types.ts';

// 1 kg of body fat ≈ 7700 kcal, so kg/week × 7700 ÷ 7 = kg/week × 1100 kcal/day.
export const KCAL_PER_KG_PER_WEEK = 1100;

/**
 * The assessment offers three goals × three paces; the calculator works in
 * percentage-of-maintenance goals. Gentle is the milder adjustment of each
 * pair, and the fitness goal is plain maintenance.
 */
export function calorieGoalFor(goal: Goal, pace: Pace): CalorieGoal {
  if (goal === 'fatLoss') return pace === 'gentle' ? 'mildLoss' : 'moderateLoss';
  if (goal === 'muscleGain') return pace === 'gentle' ? 'leanGain' : 'standardGain';
  return 'maintain';
}

/**
 * Signed percentage a goal/pace pair applies to maintenance calories, for the
 * pace badges in the assessment. This is the adjustment the calculator makes —
 * not a promised rate of weight change.
 */
export function paceAdjustmentPercent(goal: Goal, pace: Pace): number {
  return goalAdjustmentPercent(calorieGoalFor(goal, pace));
}

/**
 * Maps a stored assessment onto the pure calculator's input shape.
 *
 * The form rejects bad optional values before saving, so anything out of range
 * here came from tampered or stale storage: drop it (same policy as the shape
 * guards in ./storage) rather than lock the visitor out of their dashboard.
 * The required fields are still validated and will fail loudly.
 */
export function toNutritionInput(assessment: AssessmentInput): NutritionInput {
  const steps = assessment.currentAverageSteps;
  const stepsUsable =
    typeof steps === 'number' &&
    Number.isFinite(steps) &&
    steps >= NUTRITION_BOUNDS.currentAverageSteps.min &&
    steps <= NUTRITION_BOUNDS.currentAverageSteps.max;

  return {
    sex: assessment.sex,
    age: assessment.age,
    weightKg: assessment.weightKg,
    heightCm: assessment.heightCm,
    activity: assessment.activity,
    goal: calorieGoalFor(assessment.goal, assessment.pace),
    bodyFatPercent: isValidBodyFatPercent(assessment.bodyFatPercent)
      ? assessment.bodyFatPercent
      : null,
    // An explicit Katch–McArdle choice with no usable body fat is a validation
    // error, so drop the stale choice rather than block a saved profile.
    formula:
      assessment.bmrFormula === 'katch' && !isValidBodyFatPercent(assessment.bodyFatPercent)
        ? 'auto'
        : (assessment.bmrFormula ?? 'auto'),
    currentAverageSteps: stepsUsable ? steps : null,
  };
}

export function calculateDailyTargets(assessment: AssessmentInput): DailyTargets {
  const nutrition = calculateNutritionPlan(toNutritionInput(assessment));

  return {
    // BMR and TDEE are kept at full precision inside `nutrition`; these two are
    // the display-rounded copies the rest of the dashboard has always used.
    bmr: Math.round(nutrition.bmr),
    tdee: Math.round(nutrition.tdee),
    // Calories come from the rounded macros so the plate and the number agree.
    calories: nutrition.macroCalories,
    proteinG: nutrition.proteinGrams,
    carbsG: nutrition.carbGrams,
    fatG: nutrition.fatGrams,
    waterL: nutrition.hydration.beverageFluidLiters,
    steps: nutrition.walking.recommendedSteps,
    // Derived from the target actually recommended, so a floored target
    // honestly reports the slower rate it implies.
    expectedKgPerWeek: round2(
      (nutrition.recommendedTargetCalories - nutrition.tdee) / KCAL_PER_KG_PER_WEEK,
    ),
    calorieFloorApplied: nutrition.calorieMinimumApplied,
    nutrition,
  };
}

export function validateAssessment(assessment: AssessmentInput): boolean {
  return Object.keys(validateNutritionInput(toNutritionInput(assessment))).length === 0;
}

/** Deterministic hash of the assessment, used to vary meal picks per profile. */
export function planSeed(assessment: AssessmentInput): number {
  const key = [
    assessment.sex,
    assessment.age,
    assessment.heightCm,
    assessment.weightKg,
    assessment.activity,
    assessment.goal,
    assessment.pace,
    [...assessment.exclusions].sort().join(','),
  ].join('|');
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
