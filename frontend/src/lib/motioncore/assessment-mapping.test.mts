import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  KCAL_PER_KG_PER_WEEK,
  calculateDailyTargets,
  calorieGoalFor,
  paceAdjustmentPercent,
  toNutritionInput,
  validateAssessment,
} from './assessment-mapping.ts';
import type { AssessmentInput, Goal, Pace } from './types.ts';

/** Male, 25 y, 65 kg, 180 cm, moderately active — matches the reference case. */
const BASE: AssessmentInput = {
  sex: 'male',
  age: 25,
  heightCm: 180,
  weightKg: 65,
  activity: 'moderate',
  trainingLevel: 'intermediate',
  goal: 'fitness',
  pace: 'standard',
  equipment: 'gym',
  daysPerWeek: 4,
  exclusions: [],
};

describe('goal and pace mapping', () => {
  test('each goal/pace pair maps to one percentage goal', () => {
    const expected: Array<[Goal, Pace, string]> = [
      ['fatLoss', 'gentle', 'mildLoss'],
      ['fatLoss', 'standard', 'moderateLoss'],
      ['fatLoss', 'aggressive', 'moderateLoss'],
      ['muscleGain', 'gentle', 'leanGain'],
      ['muscleGain', 'standard', 'standardGain'],
      ['muscleGain', 'aggressive', 'standardGain'],
      ['fitness', 'gentle', 'maintain'],
      ['fitness', 'standard', 'maintain'],
      ['fitness', 'aggressive', 'maintain'],
    ];
    for (const [goal, pace, calorieGoal] of expected) {
      assert.equal(calorieGoalFor(goal, pace), calorieGoal);
    }
  });

  test('pace badges report the calorie adjustment, not a weight-change rate', () => {
    assert.equal(paceAdjustmentPercent('fatLoss', 'gentle'), -10);
    assert.equal(paceAdjustmentPercent('fatLoss', 'standard'), -20);
    assert.equal(paceAdjustmentPercent('muscleGain', 'gentle'), 5);
    assert.equal(paceAdjustmentPercent('muscleGain', 'standard'), 10);
    assert.equal(paceAdjustmentPercent('fitness', 'standard'), 0);
  });

  test('optional inputs pass through, and a stale Katch choice falls back', () => {
    assert.equal(toNutritionInput(BASE).bodyFatPercent, null);
    assert.equal(toNutritionInput(BASE).formula, 'auto');
    assert.equal(toNutritionInput(BASE).currentAverageSteps, null);

    const withBodyFat = toNutritionInput({ ...BASE, bodyFatPercent: 18, bmrFormula: 'katch' });
    assert.equal(withBodyFat.bodyFatPercent, 18);
    assert.equal(withBodyFat.formula, 'katch');

    // A saved profile whose body fat was later cleared must still build.
    const stale = toNutritionInput({ ...BASE, bmrFormula: 'katch' });
    assert.equal(stale.formula, 'auto');
    assert.equal(validateAssessment({ ...BASE, bmrFormula: 'katch' }), true);
  });
});

describe('daily targets', () => {
  test('maintenance targets match the pure calculator', () => {
    const targets = calculateDailyTargets(BASE);
    assert.equal(targets.bmr, 1655);
    assert.equal(targets.tdee, 2565);
    assert.equal(targets.calories, 2567);
    assert.equal(targets.proteinG, 117);
    assert.equal(targets.carbsG, 365);
    assert.equal(targets.fatG, 71);
    assert.equal(targets.expectedKgPerWeek, 0);
    assert.equal(targets.calorieFloorApplied, false);
  });

  test('displayed calories always equal the displayed macro grams', () => {
    for (const goal of ['fatLoss', 'muscleGain', 'fitness'] as Goal[]) {
      for (const pace of ['gentle', 'standard', 'aggressive'] as Pace[]) {
        const targets = calculateDailyTargets({ ...BASE, goal, pace });
        assert.equal(
          targets.calories,
          targets.proteinG * 4 + targets.carbsG * 4 + targets.fatG * 9,
        );
      }
    }
  });

  test('water comes from the hydration reference, not from body weight', () => {
    assert.equal(calculateDailyTargets(BASE).waterL, 3);
    assert.equal(calculateDailyTargets({ ...BASE, weightKg: 120 }).waterL, 3);
    assert.equal(calculateDailyTargets({ ...BASE, sex: 'female' }).waterL, 2.2);
  });

  test('steps come from age, not from the goal', () => {
    assert.equal(calculateDailyTargets(BASE).steps, 9000);
    assert.equal(calculateDailyTargets({ ...BASE, goal: 'fatLoss' }).steps, 9000);
    assert.equal(calculateDailyTargets({ ...BASE, age: 65 }).steps, 7000);
  });

  test('the expected rate is derived from the recommended target', () => {
    const cutting = calculateDailyTargets({ ...BASE, goal: 'fatLoss', pace: 'standard' });
    const expected =
      Math.round(
        ((cutting.nutrition.recommendedTargetCalories - cutting.nutrition.tdee) /
          KCAL_PER_KG_PER_WEEK) *
          100,
      ) / 100;
    assert.equal(cutting.expectedKgPerWeek, expected);
    assert.ok(cutting.expectedKgPerWeek < 0);
  });

  test('a floored target reports the slower rate it actually implies', () => {
    const targets = calculateDailyTargets({
      ...BASE,
      sex: 'female',
      age: 80,
      weightKg: 35,
      heightCm: 120,
      activity: 'sedentary',
      goal: 'fatLoss',
      pace: 'aggressive',
    });
    assert.equal(targets.calorieFloorApplied, true);
    assert.equal(targets.nutrition.recommendedTargetCalories, 1200);
    // The floor is above maintenance here, so the honest rate is a small gain.
    assert.ok(targets.expectedKgPerWeek > 0);
  });

  test('out-of-bounds required inputs are rejected', () => {
    assert.equal(validateAssessment(BASE), true);
    assert.equal(validateAssessment({ ...BASE, age: 17 }), false);
    assert.equal(validateAssessment({ ...BASE, age: 81 }), false);
    assert.equal(validateAssessment({ ...BASE, weightKg: 34 }), false);
    assert.equal(validateAssessment({ ...BASE, weightKg: 301 }), false);
    assert.equal(validateAssessment({ ...BASE, heightCm: 119 }), false);
    assert.equal(validateAssessment({ ...BASE, heightCm: 251 }), false);
    assert.equal(validateAssessment({ ...BASE, age: Number.NaN }), false);
  });

  test('a corrupt stored optional is dropped, not allowed to break the plan', () => {
    // The form rejects these before saving; only tampered storage reaches here.
    for (const patch of [
      { bodyFatPercent: 90 },
      { bodyFatPercent: Number.NaN },
      { currentAverageSteps: 100001 },
      { currentAverageSteps: -5 },
    ]) {
      const input = toNutritionInput({ ...BASE, ...patch });
      assert.equal(validateAssessment({ ...BASE, ...patch }), true);
      if ('bodyFatPercent' in patch) assert.equal(input.bodyFatPercent, null);
      if ('currentAverageSteps' in patch) assert.equal(input.currentAverageSteps, null);
    }
    // …and the dropped value leaves the personalized target untouched.
    const targets = calculateDailyTargets({ ...BASE, currentAverageSteps: 100001 });
    assert.equal(targets.nutrition.walking.currentAverageSteps, null);
    assert.equal(targets.nutrition.walking.nextStepTarget, null);
    assert.equal(targets.nutrition.walking.recommendedSteps, 9000);
  });
});
