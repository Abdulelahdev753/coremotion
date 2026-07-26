import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  ACTIVITY_MULTIPLIERS,
  GOAL_MULTIPLIERS,
  NutritionValidationError,
  calculateHydration,
  calculateNutritionPlan,
  calculateSweatLoss,
  calculateWalking,
  resolveFormula,
  validateNutritionInput,
  validateSweatInput,
  type CalorieGoal,
  type NutritionInput,
} from './nutrition.ts';
import type { ActivityLevel } from './types.ts';

/** Male, 25 y, 65 kg, 180 cm, moderately active — the reference profile. */
const BASE: NutritionInput = {
  sex: 'male',
  age: 25,
  weightKg: 65,
  heightCm: 180,
  activity: 'moderate',
  goal: 'maintain',
};

const ACTIVITY_LEVELS = Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[];
const GOALS = Object.keys(GOAL_MULTIPLIERS) as CalorieGoal[];

/** Fails on any NaN/Infinity anywhere in a nested result object. */
function assertAllFinite(value: unknown, path = 'result'): void {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} must be finite, got ${value}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertAllFinite(item, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      assertAllFinite(child, `${path}.${key}`);
    }
  }
}

describe('calories and macros', () => {
  test('reference profile: male 25 y, 65 kg, 180 cm, moderate, maintenance', () => {
    const result = calculateNutritionPlan(BASE);

    assert.equal(result.formulaUsed, 'mifflin');
    assert.equal(result.bmr, 1655);
    assert.equal(result.tdee, 2565.25);
    assert.equal(result.activityMultiplier, 1.55);
    assert.equal(result.goalMultiplier, 1);
    assert.equal(result.calculatedTargetCalories, 2565.25);
    assert.equal(result.recommendedTargetCalories, 2565.25);
    assert.equal(result.proteinGrams, 117);
    assert.equal(result.fatGrams, 71);
    assert.equal(result.carbGrams, 365);
    assert.equal(result.macroCalories, 2567);
    assert.equal(result.calorieMinimumApplied, false);
    assert.equal(result.proteinCapApplied, false);
    assert.deepEqual(result.warnings, []);
  });

  test('displayed calories always equal the rounded macro grams', () => {
    const result = calculateNutritionPlan(BASE);
    assert.equal(
      result.macroCalories,
      result.proteinGrams * 4 + result.carbGrams * 4 + result.fatGrams * 9,
    );
  });

  test('female Mifflin–St Jeor: 30 y, 60 kg, 165 cm, sedentary, maintenance', () => {
    const result = calculateNutritionPlan({
      ...BASE,
      sex: 'female',
      age: 30,
      weightKg: 60,
      heightCm: 165,
      activity: 'sedentary',
    });

    assert.equal(result.formulaUsed, 'mifflin');
    assert.equal(result.bmr, 1320.25);
    assert.equal(result.tdee, 1584.3);
    assert.equal(result.proteinGrams, 108);
    assert.equal(result.fatGrams, 44);
    assert.equal(result.carbGrams, 189);
    assert.equal(result.macroCalories, 1584);
  });

  test('Katch–McArdle uses lean mass, not height or age', () => {
    const result = calculateNutritionPlan({
      ...BASE,
      weightKg: 80,
      bodyFatPercent: 20,
      formula: 'katch',
    });

    // 80 kg × 0.80 = 64 kg lean → 370 + 21.6 × 64 = 1752.4
    assert.equal(result.formulaUsed, 'katch');
    assert.equal(result.bmr, 1752.4);

    const taller = calculateNutritionPlan({
      ...BASE,
      weightKg: 80,
      heightCm: 200,
      age: 60,
      bodyFatPercent: 20,
      formula: 'katch',
    });
    assert.equal(taller.bmr, 1752.4);
  });

  test('automatic formula selection follows the body-fat reading', () => {
    assert.equal(calculateNutritionPlan(BASE).formulaUsed, 'mifflin');
    assert.equal(
      calculateNutritionPlan({ ...BASE, bodyFatPercent: 18 }).formulaUsed,
      'katch',
    );
    assert.equal(
      calculateNutritionPlan({ ...BASE, bodyFatPercent: 18, formula: 'mifflin' }).formulaUsed,
      'mifflin',
    );
    assert.equal(resolveFormula('auto', null), 'mifflin');
    assert.equal(resolveFormula('auto', 25), 'katch');
    // Out-of-range readings never silently enable Katch–McArdle.
    assert.equal(resolveFormula('auto', 0), 'mifflin');
    assert.equal(resolveFormula('auto', 85), 'mifflin');
  });

  test('every activity level multiplies BMR by its exact factor', () => {
    const expected: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      athlete: 1.9,
    };
    for (const activity of ACTIVITY_LEVELS) {
      const result = calculateNutritionPlan({ ...BASE, activity });
      assert.equal(result.activityMultiplier, expected[activity]);
      assert.equal(result.tdee, 1655 * expected[activity]);
    }
  });

  test('every goal applies its exact percentage of TDEE', () => {
    const expected: Record<CalorieGoal, number> = {
      moderateLoss: 0.8,
      mildLoss: 0.9,
      maintain: 1,
      leanGain: 1.05,
      standardGain: 1.1,
    };
    for (const goal of GOALS) {
      const result = calculateNutritionPlan({ ...BASE, goal });
      assert.equal(result.goalMultiplier, expected[goal]);
      assert.equal(result.calculatedTargetCalories, 2565.25 * expected[goal]);
      assert.equal(result.goalAdjustmentPercent, Math.round(expected[goal] * 100 - 100));
      // No floor kicks in at this body size, so the target is untouched.
      assert.equal(result.recommendedTargetCalories, result.calculatedTargetCalories);
    }
  });

  test('protein target follows the goal-specific g/kg factor', () => {
    const factors: Record<CalorieGoal, number> = {
      moderateLoss: 2.2,
      mildLoss: 2.0,
      maintain: 1.8,
      leanGain: 1.8,
      standardGain: 1.8,
    };
    for (const goal of GOALS) {
      const result = calculateNutritionPlan({ ...BASE, goal });
      assert.equal(result.proteinGrams, Math.round(65 * factors[goal]));
      assert.equal(result.proteinCapApplied, false);
    }
  });
});

describe('safety guards', () => {
  test('male weight-loss targets are floored at 1500 kcal', () => {
    const result = calculateNutritionPlan({
      sex: 'male',
      age: 80,
      weightKg: 35,
      heightCm: 120,
      activity: 'sedentary',
      goal: 'moderateLoss',
    });

    assert.equal(result.bmr, 705);
    assert.equal(result.tdee, 846);
    assert.equal(result.calculatedTargetCalories, 846 * 0.8);
    assert.equal(result.recommendedTargetCalories, 1500);
    assert.equal(result.calorieMinimumApplied, true);
    assert.ok(result.warnings.includes('calorieMinimumApplied'));
  });

  test('female weight-loss targets are floored at 1200 kcal', () => {
    const result = calculateNutritionPlan({
      sex: 'female',
      age: 80,
      weightKg: 35,
      heightCm: 120,
      activity: 'sedentary',
      goal: 'moderateLoss',
    });

    assert.equal(result.bmr, 539);
    assert.equal(result.recommendedTargetCalories, 1200);
    assert.equal(result.calorieMinimumApplied, true);
  });

  test('the floor never touches BMR or TDEE', () => {
    const floored = calculateNutritionPlan({
      sex: 'female',
      age: 80,
      weightKg: 35,
      heightCm: 120,
      activity: 'sedentary',
      goal: 'moderateLoss',
    });
    const unfloored = calculateNutritionPlan({
      sex: 'female',
      age: 80,
      weightKg: 35,
      heightCm: 120,
      activity: 'sedentary',
      goal: 'maintain',
    });
    assert.equal(floored.bmr, unfloored.bmr);
    assert.equal(floored.tdee, unfloored.tdee);
  });

  test('gain goals are never raised to the weight-loss minimum', () => {
    const result = calculateNutritionPlan({
      sex: 'female',
      age: 80,
      weightKg: 35,
      heightCm: 120,
      activity: 'sedentary',
      goal: 'leanGain',
    });
    assert.equal(result.calorieMinimumApplied, false);
    assert.equal(result.recommendedTargetCalories, result.calculatedTargetCalories);
  });

  test('protein is capped at 35% of calories', () => {
    const result = calculateNutritionPlan({
      sex: 'male',
      age: 80,
      weightKg: 300,
      heightCm: 120,
      activity: 'sedentary',
      goal: 'moderateLoss',
    });

    // Weight-based protein would be 660 g; 35% of 3220.8 kcal allows 281.8 g.
    assert.equal(result.recommendedTargetCalories, 3220.8);
    assert.equal(result.proteinCapApplied, true);
    assert.equal(result.proteinGrams, 282);
    assert.ok(result.warnings.includes('proteinCapApplied'));
    assert.ok(result.proteinGrams * 4 <= result.recommendedTargetCalories * 0.35 + 4);
  });

  test('carbohydrates never fall below zero', () => {
    for (const sex of ['male', 'female'] as const) {
      for (const activity of ACTIVITY_LEVELS) {
        for (const goal of GOALS) {
          for (const weightKg of [35, 65, 120, 200, 300]) {
            for (const age of [18, 45, 80]) {
              const result = calculateNutritionPlan({
                sex,
                age,
                weightKg,
                heightCm: 120,
                activity,
                goal,
              });
              assert.ok(
                result.carbGrams >= 0,
                `carbs went negative for ${sex}/${activity}/${goal}/${weightKg}kg`,
              );
            }
          }
        }
      }
    }
  });

  test('no NaN or Infinity anywhere in the result', () => {
    for (const sex of ['male', 'female'] as const) {
      for (const activity of ACTIVITY_LEVELS) {
        for (const goal of GOALS) {
          for (const bodyFatPercent of [null, 2.5, 35, 69]) {
            assertAllFinite(
              calculateNutritionPlan({
                sex,
                age: 30,
                weightKg: 80,
                heightCm: 175,
                activity,
                goal,
                bodyFatPercent,
                currentAverageSteps: 4200,
                sweat: {
                  preExerciseWeightKg: 80,
                  postExerciseWeightKg: 79,
                  exerciseDurationMinutes: 45,
                  fluidConsumedLiters: 0.5,
                },
              }),
            );
          }
        }
      }
    }
  });
});

describe('input validation', () => {
  const invalidCases: Array<[string, Partial<NutritionInput>, string]> = [
    ['age below 18', { age: 17 }, 'age'],
    ['age above 80', { age: 81 }, 'age'],
    ['age NaN', { age: Number.NaN }, 'age'],
    ['age Infinity', { age: Number.POSITIVE_INFINITY }, 'age'],
    ['weight below 35 kg', { weightKg: 34.9 }, 'weightKg'],
    ['weight above 300 kg', { weightKg: 301 }, 'weightKg'],
    ['weight zero', { weightKg: 0 }, 'weightKg'],
    ['weight negative', { weightKg: -70 }, 'weightKg'],
    ['height below 120 cm', { heightCm: 119 }, 'heightCm'],
    ['height above 250 cm', { heightCm: 251 }, 'heightCm'],
    ['height NaN', { heightCm: Number.NaN }, 'heightCm'],
    ['body fat at 2%', { bodyFatPercent: 2 }, 'bodyFatPercent'],
    ['body fat at 70%', { bodyFatPercent: 70 }, 'bodyFatPercent'],
    ['body fat NaN', { bodyFatPercent: Number.NaN }, 'bodyFatPercent'],
  ];

  for (const [name, patch, field] of invalidCases) {
    test(`rejects ${name}`, () => {
      const input = { ...BASE, ...patch } as NutritionInput;
      const errors = validateNutritionInput(input);
      assert.equal(errors[field as keyof typeof errors], 'range');
      assert.throws(() => calculateNutritionPlan(input), NutritionValidationError);
    });
  }

  test('rejects missing required inputs', () => {
    const errors = validateNutritionInput({
      ...BASE,
      age: undefined as unknown as number,
      weightKg: undefined as unknown as number,
    });
    assert.equal(errors.age, 'required');
    assert.equal(errors.weightKg, 'required');
  });

  test('body fat is accepted strictly between 2% and 70%', () => {
    assert.deepEqual(validateNutritionInput({ ...BASE, bodyFatPercent: 2.1 }), {});
    assert.deepEqual(validateNutritionInput({ ...BASE, bodyFatPercent: 69.9 }), {});
  });

  test('explicit Katch–McArdle without body fat is an error, not a fallback', () => {
    const errors = validateNutritionInput({ ...BASE, formula: 'katch' });
    assert.equal(errors.bodyFatPercent, 'bodyFatRequired');
    assert.throws(
      () => calculateNutritionPlan({ ...BASE, formula: 'katch' }),
      NutritionValidationError,
    );
    // …and it still errors rather than quietly switching formulas.
    assert.equal(
      validateNutritionInput({ ...BASE, formula: 'katch', bodyFatPercent: 18 }).bodyFatPercent,
      undefined,
    );
  });

  test('valid input produces no errors', () => {
    assert.deepEqual(validateNutritionInput(BASE), {});
  });
});

describe('hydration', () => {
  test('male baseline references', () => {
    const hydration = calculateHydration('male');
    assert.equal(hydration.totalWaterMl, 3700);
    assert.equal(hydration.totalWaterLiters, 3.7);
    assert.equal(hydration.beverageFluidMl, 3000);
    assert.equal(hydration.beverageFluidLiters, 3);
  });

  test('female baseline references', () => {
    const hydration = calculateHydration('female');
    assert.equal(hydration.totalWaterMl, 2700);
    assert.equal(hydration.totalWaterLiters, 2.7);
    assert.equal(hydration.beverageFluidMl, 2200);
    assert.equal(hydration.beverageFluidLiters, 2.2);
  });

  test('baselines are not scaled by activity, goal or body size', () => {
    for (const activity of ACTIVITY_LEVELS) {
      for (const goal of GOALS) {
        const result = calculateNutritionPlan({ ...BASE, activity, goal, weightKg: 120 });
        assert.equal(result.hydration.totalWaterMl, 3700);
        assert.equal(result.hydration.beverageFluidMl, 3000);
      }
    }
  });

  test('sweat fields are null until measurements are supplied', () => {
    const { hydration } = calculateNutritionPlan(BASE);
    assert.equal(hydration.netSweatLossLiters, null);
    assert.equal(hydration.sweatRateLitersPerHour, null);
    assert.equal(hydration.dehydrationPercent, null);
    assert.equal(hydration.replacementMinLiters, null);
    assert.equal(hydration.replacementMaxLiters, null);
    assert.deepEqual(hydration.warnings, []);
  });

  test('sweat loss, rate and replacement range', () => {
    const sweat = calculateSweatLoss({
      preExerciseWeightKg: 70,
      postExerciseWeightKg: 68.5,
      exerciseDurationMinutes: 60,
      fluidConsumedLiters: 0.5,
      urineProducedLiters: 0,
    });

    assert.ok(sweat);
    assert.equal(sweat.bodyMassLossLiters, 1.5);
    assert.equal(sweat.netSweatLossLiters, 2);
    assert.equal(sweat.sweatRateLitersPerHour, 2);
    assert.equal(sweat.dehydrationPercent, 2.14);
    assert.equal(sweat.replacementMinLiters, 2.5);
    assert.equal(sweat.replacementMaxLiters, 3);
    // Never recommend drinking faster than sweat is actually lost.
    assert.equal(sweat.suggestedDrinkingRateLitersPerHour, sweat.sweatRateLitersPerHour);
    assert.ok(sweat.warnings.includes('highSweatRate'));
    assert.ok(sweat.warnings.includes('highDrinkingRate'));
  });

  test('urine produced is subtracted from the sweat estimate', () => {
    const sweat = calculateSweatLoss({
      preExerciseWeightKg: 70,
      postExerciseWeightKg: 68.5,
      exerciseDurationMinutes: 120,
      fluidConsumedLiters: 0.5,
      urineProducedLiters: 0.3,
    });
    assert.ok(sweat);
    assert.equal(sweat.netSweatLossLiters, 1.7);
    assert.equal(sweat.sweatRateLitersPerHour, 0.85);
    assert.ok(!sweat.warnings.includes('highSweatRate'));
    assert.ok(!sweat.warnings.includes('highDrinkingRate'));
  });

  test('dehydration warning fires at exactly 2%', () => {
    const atThreshold = calculateSweatLoss({
      preExerciseWeightKg: 75,
      postExerciseWeightKg: 73.5,
      exerciseDurationMinutes: 90,
      fluidConsumedLiters: 0,
    });
    assert.ok(atThreshold);
    assert.equal(atThreshold.dehydrationPercent, 2);
    assert.ok(atThreshold.warnings.includes('dehydration'));

    const below = calculateSweatLoss({
      preExerciseWeightKg: 75,
      postExerciseWeightKg: 74,
      exerciseDurationMinutes: 90,
      fluidConsumedLiters: 0,
    });
    assert.ok(below);
    assert.equal(below.dehydrationPercent, 1.33);
    assert.ok(!below.warnings.includes('dehydration'));
  });

  test('hot or humid conditions raise their own warning', () => {
    const sweat = calculateSweatLoss({
      preExerciseWeightKg: 70,
      postExerciseWeightKg: 69.8,
      exerciseDurationMinutes: 60,
      fluidConsumedLiters: 0,
      hotOrHumid: true,
    });
    assert.ok(sweat);
    assert.ok(sweat.warnings.includes('hotConditions'));
  });

  test('a negative sweat result is clamped to zero', () => {
    const sweat = calculateSweatLoss({
      preExerciseWeightKg: 70,
      postExerciseWeightKg: 71,
      exerciseDurationMinutes: 60,
      fluidConsumedLiters: 0,
    });

    assert.ok(sweat);
    assert.equal(sweat.bodyMassLossLiters, -1);
    assert.equal(sweat.netSweatLossLiters, 0);
    assert.equal(sweat.sweatRateLitersPerHour, 0);
    assert.equal(sweat.dehydrationPercent, 0);
    assert.equal(sweat.replacementMinLiters, 0);
    assert.equal(sweat.replacementMaxLiters, 0);
    assert.deepEqual(sweat.warnings, []);
  });

  test('zero or invalid exercise duration yields validation feedback, not a rate', () => {
    const zeroDuration = {
      preExerciseWeightKg: 70,
      postExerciseWeightKg: 69,
      exerciseDurationMinutes: 0,
      fluidConsumedLiters: 0,
    };
    assert.equal(validateSweatInput(zeroDuration).exerciseDurationMinutes, 'range');
    assert.equal(calculateSweatLoss(zeroDuration), null);

    for (const duration of [-30, Number.NaN, Number.POSITIVE_INFINITY]) {
      const input = { ...zeroDuration, exerciseDurationMinutes: duration };
      assert.ok(validateSweatInput(input).exerciseDurationMinutes);
      assert.equal(calculateSweatLoss(input), null);
    }
  });

  test('invalid weights and fluids are rejected', () => {
    const errors = validateSweatInput({
      preExerciseWeightKg: Number.NaN,
      postExerciseWeightKg: 0,
      exerciseDurationMinutes: 60,
      fluidConsumedLiters: Number.POSITIVE_INFINITY,
      urineProducedLiters: -1,
    });
    assert.equal(errors.preExerciseWeightKg, 'range');
    assert.equal(errors.postExerciseWeightKg, 'range');
    assert.equal(errors.fluidConsumedLiters, 'range');
    assert.equal(errors.urineProducedLiters, 'range');
  });

  test('an invalid sweat block leaves the hydration baseline intact', () => {
    const { hydration } = calculateNutritionPlan({
      ...BASE,
      sweat: {
        preExerciseWeightKg: 70,
        postExerciseWeightKg: 69,
        exerciseDurationMinutes: 0,
        fluidConsumedLiters: 0,
      },
    });
    assert.equal(hydration.totalWaterMl, 3700);
    assert.equal(hydration.netSweatLossLiters, null);
    assert.deepEqual(hydration.warnings, []);
  });
});

describe('walking', () => {
  test('adults under 60 get a 9,000-step target', () => {
    const walking = calculateWalking(59);
    assert.equal(walking.recommendedSteps, 9000);
    assert.equal(walking.recommendedRangeMin, 8000);
    assert.equal(walking.recommendedRangeMax, 10000);
    assert.equal(walking.generalHealthReference, 7000);
    assert.equal(walking.currentAverageSteps, null);
    assert.equal(walking.nextStepTarget, null);
    assert.deepEqual(walking.warnings, []);
  });

  test('adults 60 and over get a 7,000-step target', () => {
    const walking = calculateWalking(60);
    assert.equal(walking.recommendedSteps, 7000);
    assert.equal(walking.recommendedRangeMin, 6000);
    assert.equal(walking.recommendedRangeMax, 8000);
    assert.equal(calculateWalking(75).recommendedSteps, 7000);
  });

  test('activity guidance is reported alongside the step target', () => {
    const walking = calculateWalking(30);
    assert.equal(walking.weeklyModerateMinutesMin, 150);
    assert.equal(walking.weeklyModerateMinutesMax, 300);
    assert.equal(walking.strengthTrainingDays, 2);
  });

  test('step progression adds ~1,000 and rounds to the nearest 500', () => {
    assert.equal(calculateWalking(30, 3200).nextStepTarget, 4000);
    assert.equal(calculateWalking(30, 6400).nextStepTarget, 7500);
    assert.equal(calculateWalking(30, 8600).nextStepTarget, 9000);
    assert.equal(calculateWalking(65, 5200).nextStepTarget, 6000);
    assert.equal(calculateWalking(30, 0).nextStepTarget, 1000);
  });

  test('the next target moves forward but never past the personalized target', () => {
    for (let current = 0; current < 9000; current += 137) {
      const walking = calculateWalking(30, current);
      assert.ok(walking.nextStepTarget !== null);
      assert.ok(walking.nextStepTarget <= 9000, `overshot at ${current}`);
      assert.ok(walking.nextStepTarget >= current, `went backwards at ${current}`);
    }
  });

  test('an already-met target is reported, never reduced or raised', () => {
    const met = calculateWalking(30, 9500);
    assert.equal(met.nextStepTarget, 9500);
    assert.ok(met.warnings.includes('alreadyMeetsTarget'));

    const exactly = calculateWalking(30, 9000);
    assert.equal(exactly.nextStepTarget, 9000);
    assert.ok(exactly.warnings.includes('alreadyMeetsTarget'));

    const older = calculateWalking(65, 12000);
    assert.equal(older.nextStepTarget, 12000);
    assert.ok(older.warnings.includes('alreadyMeetsTarget'));
  });

  test('current steps are normalized to a whole number', () => {
    assert.equal(calculateWalking(30, 4200.6).currentAverageSteps, 4201);
  });

  test('invalid step inputs are rejected and leave the target unchanged', () => {
    for (const steps of [-1, 100001, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.equal(validateNutritionInput({ ...BASE, currentAverageSteps: steps }).currentAverageSteps, 'range');
      const walking = calculateWalking(30, steps);
      assert.equal(walking.currentAverageSteps, null);
      assert.equal(walking.nextStepTarget, null);
      assert.equal(walking.recommendedSteps, 9000);
    }
    assert.deepEqual(validateNutritionInput({ ...BASE, currentAverageSteps: 0 }), {});
    assert.deepEqual(validateNutritionInput({ ...BASE, currentAverageSteps: 100000 }), {});
  });
});

describe('hydration and walking never feed back into energy', () => {
  test('step and sweat inputs leave calories and macros untouched', () => {
    const plain = calculateNutritionPlan({ ...BASE, goal: 'moderateLoss' });
    const enriched = calculateNutritionPlan({
      ...BASE,
      goal: 'moderateLoss',
      currentAverageSteps: 15000,
      sweat: {
        preExerciseWeightKg: 65,
        postExerciseWeightKg: 63.5,
        exerciseDurationMinutes: 90,
        fluidConsumedLiters: 1,
        hotOrHumid: true,
      },
    });

    for (const key of [
      'bmr',
      'tdee',
      'calculatedTargetCalories',
      'recommendedTargetCalories',
      'macroCalories',
      'proteinGrams',
      'carbGrams',
      'fatGrams',
      'activityMultiplier',
      'goalMultiplier',
    ] as const) {
      assert.equal(enriched[key], plain[key], `${key} changed`);
    }
    assert.deepEqual(enriched.warnings, plain.warnings);
    // …and the walking block still reflects the supplied steps.
    assert.equal(enriched.walking.currentAverageSteps, 15000);
    assert.ok(enriched.walking.warnings.includes('alreadyMeetsTarget'));
  });

  test('age changes the step target without changing the step-driven calories', () => {
    const younger = calculateNutritionPlan({ ...BASE, age: 59 });
    const older = calculateNutritionPlan({ ...BASE, age: 60 });
    assert.equal(younger.walking.recommendedSteps, 9000);
    assert.equal(older.walking.recommendedSteps, 7000);
    // Calories differ only through the BMR age term (5 kcal per year).
    assert.equal(younger.bmr - older.bmr, 5);
  });
});
