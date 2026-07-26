import type { BmrFormulaChoice, NutritionResult } from './nutrition';

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'athlete';
export type Goal = 'fatLoss' | 'muscleGain' | 'fitness';
export type Pace = 'gentle' | 'standard' | 'aggressive';
export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'none' | 'dumbbells' | 'gym';
export type DietExclusion = 'dairy' | 'eggs' | 'nuts' | 'gluten' | 'seafood';
export type DaysPerWeek = 3 | 4 | 5;

export type LocalizedText = { en: string; ar: string };

export type AssessmentInput = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  trainingLevel: TrainingLevel;
  goal: Goal;
  pace: Pace;
  equipment: Equipment;
  daysPerWeek: DaysPerWeek;
  exclusions: DietExclusion[];
  /** Optional — a valid reading (2–70%) unlocks the Katch–McArdle formula. */
  bodyFatPercent?: number;
  /** Defaults to `auto`: Katch–McArdle when body fat is known, else Mifflin. */
  bmrFormula?: BmrFormulaChoice;
  /** Optional 7-day average, used only for the walking progression. */
  currentAverageSteps?: number;
};

/**
 * Hard validation bounds — enforced in the form and re-checked in buildPlan.
 * Mirrors `NUTRITION_BOUNDS` in ./nutrition, which is the source of truth.
 */
export const INPUT_BOUNDS = {
  age: { min: 18, max: 80 },
  heightCm: { min: 120, max: 250 },
  weightKg: { min: 35, max: 300 },
  bodyFatPercent: { min: 2, max: 70 },
  currentAverageSteps: { min: 0, max: 100000 },
} as const;

export type DailyTargets = {
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterL: number;
  steps: number;
  /** Signed kg per week implied by the calorie target; negative = loss. */
  expectedKgPerWeek: number;
  /** True when the safety floor or deficit cap clamped the calorie target. */
  calorieFloorApplied: boolean;
  /** Full result from the pure calculator, incl. hydration and walking. */
  nutrition: NutritionResult;
};

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'snack2';

export type MacroTotals = {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type MealItem = {
  foodId: string;
  name: LocalizedText;
  grams: number;
  /** Present for foods naturally counted in units (eggs, bread slices, dates). */
  units?: { count: number; unitName: LocalizedText };
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type Meal = {
  slot: MealSlot;
  items: MealItem[];
  totals: MacroTotals;
};

export type MealPlan = {
  meals: Meal[];
  dayTotals: MacroTotals;
};

export type MovementPattern =
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'push-h'
  | 'push-v'
  | 'pull-h'
  | 'pull-v'
  | 'core';

export type WorkoutExercise = {
  exerciseId: string;
  name: LocalizedText;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: LocalizedText;
};

export type WorkoutDay = {
  title: LocalizedText;
  exercises: WorkoutExercise[];
};

export type WorkoutPlan = {
  splitName: LocalizedText;
  days: WorkoutDay[];
  cardioNote?: LocalizedText;
};

export type MotionCorePlan = {
  targets: DailyTargets;
  meals: MealPlan;
  workout: WorkoutPlan;
};

export type WeightEntry = {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  weightKg: number;
};
