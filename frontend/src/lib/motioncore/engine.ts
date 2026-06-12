import { buildMealPlan } from './meal-planner';
import { buildWorkoutPlan } from './workout-planner';
import {
  INPUT_BOUNDS,
  type ActivityLevel,
  type AssessmentInput,
  type DailyTargets,
  type Goal,
  type MotionCorePlan,
  type Pace,
  type Sex,
} from './types';

// Worked example used by the sanity checks: male, 30 y, 80 kg, 180 cm, moderate
// activity → BMR = 800 + 1125 − 150 + 5 = 1780; TDEE = 1780 × 1.55 ≈ 2759;
// fat loss at standard pace → 2759 − 550 = 2209 kcal; protein 160 g (2.0 g/kg),
// fat max(48, 2209×0.25/9 ≈ 61) = 61 g, carbs ≈ (2209 − 640 − 552) / 4 ≈ 254 g.

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  athlete: 1.9,
};

// 1 kg of body fat ≈ 7700 kcal, so kg/week × 7700 ÷ 7 = kg/week × 1100 kcal/day.
export const KCAL_PER_KG_PER_WEEK = 1100;

const PACE_KG_PER_WEEK: Record<Goal, Record<Pace, number>> = {
  fatLoss: { gentle: -0.25, standard: -0.5, aggressive: -0.75 },
  // Muscle gain has no aggressive pace in the UI; treat it as standard.
  muscleGain: { gentle: 0.125, standard: 0.25, aggressive: 0.25 },
  fitness: { gentle: 0, standard: 0, aggressive: 0 },
};

/** Nominal weekly rate for a goal/pace pair (pre-clamp), for UI previews. */
export function paceRateKgPerWeek(goal: Goal, pace: Pace): number {
  return PACE_KG_PER_WEEK[goal][pace];
}

/** Deficits steeper than 25% of TDEE are unsustainable and unsafe. */
const MAX_DEFICIT_FRACTION = 0.25;

const CALORIE_FLOOR: Record<Sex, number> = { female: 1200, male: 1500 };

const PROTEIN_G_PER_KG: Record<Goal, number> = {
  fatLoss: 2.0,
  muscleGain: 1.8,
  fitness: 1.6,
};

const STEP_TARGETS: Record<Goal, number> = {
  fatLoss: 10000,
  fitness: 8000,
  muscleGain: 7000,
};

/** Mifflin-St Jeor basal metabolic rate, kcal/day. */
export function calculateBmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

export function calculateTdee(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
}

export function calculateCalorieTarget(
  tdee: number,
  goal: Goal,
  pace: Pace,
  sex: Sex,
): { calories: number; expectedKgPerWeek: number; floorApplied: boolean } {
  const kgPerWeek = PACE_KG_PER_WEEK[goal][pace];
  const candidate = tdee + kgPerWeek * KCAL_PER_KG_PER_WEEK;

  let calories = candidate;
  if (goal === 'fatLoss') {
    calories = Math.max(calories, tdee * (1 - MAX_DEFICIT_FRACTION));
  }
  calories = Math.max(calories, CALORIE_FLOOR[sex]);
  calories = Math.round(calories);

  const floorApplied = calories > Math.round(candidate);
  return {
    calories,
    // Recompute from the clamped target so dashboard expectations stay honest.
    expectedKgPerWeek: floorApplied
      ? round2((calories - tdee) / KCAL_PER_KG_PER_WEEK)
      : kgPerWeek,
    floorApplied,
  };
}

export function calculateMacroTargets(
  calories: number,
  weightKg: number,
  goal: Goal,
): { proteinG: number; carbsG: number; fatG: number } {
  // Protein first (the binding target), capped at 40% of calories.
  let proteinG = Math.min(PROTEIN_G_PER_KG[goal] * weightKg, (calories * 0.4) / 4);
  let fatG = Math.max(0.6 * weightKg, (calories * 0.25) / 9);
  let carbsG = (calories - proteinG * 4 - fatG * 9) / 4;

  // At floor calories with a heavy user the remainder can dip below a usable
  // carb intake; scale protein and fat down proportionally to keep carbs ≥ 50 g.
  const MIN_CARBS_G = 50;
  if (carbsG < MIN_CARBS_G) {
    const available = calories - MIN_CARBS_G * 4;
    const current = proteinG * 4 + fatG * 9;
    const scale = Math.max(available, 0) / current;
    proteinG *= scale;
    fatG *= scale;
    carbsG = MIN_CARBS_G;
  }

  return {
    proteinG: Math.round(proteinG),
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG),
  };
}

export function calculateWaterL(weightKg: number): number {
  return clamp(Math.round(0.035 * weightKg * 10) / 10, 1.5, 4.0);
}

export function calculateSteps(goal: Goal): number {
  return STEP_TARGETS[goal];
}

export function calculateDailyTargets(assessment: AssessmentInput): DailyTargets {
  const { sex, age, heightCm, weightKg, activity, goal, pace } = assessment;
  const bmr = calculateBmr(sex, weightKg, heightCm, age);
  const tdee = calculateTdee(bmr, activity);
  const { calories, expectedKgPerWeek, floorApplied } = calculateCalorieTarget(
    tdee,
    goal,
    pace,
    sex,
  );
  const macros = calculateMacroTargets(calories, weightKg, goal);

  return {
    bmr,
    tdee,
    calories,
    ...macros,
    waterL: calculateWaterL(weightKg),
    steps: calculateSteps(goal),
    expectedKgPerWeek,
    calorieFloorApplied: floorApplied,
  };
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

export function validateAssessment(assessment: AssessmentInput): boolean {
  const inRange = (value: number, bounds: { min: number; max: number }) =>
    Number.isFinite(value) && value >= bounds.min && value <= bounds.max;
  return (
    inRange(assessment.age, INPUT_BOUNDS.age) &&
    inRange(assessment.heightCm, INPUT_BOUNDS.heightCm) &&
    inRange(assessment.weightKg, INPUT_BOUNDS.weightKg)
  );
}

export function buildPlan(assessment: AssessmentInput): MotionCorePlan {
  if (!validateAssessment(assessment)) {
    throw new Error('Assessment input out of bounds');
  }
  const targets = calculateDailyTargets(assessment);
  return {
    targets,
    meals: buildMealPlan(targets, assessment.exclusions, planSeed(assessment)),
    workout: buildWorkoutPlan(
      assessment.trainingLevel,
      assessment.goal,
      assessment.equipment,
      assessment.daysPerWeek,
    ),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
