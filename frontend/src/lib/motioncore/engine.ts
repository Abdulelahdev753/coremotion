/**
 * Assembles a full MotionCore plan: daily targets from ./assessment-mapping
 * (which delegates every number to the pure calculator in ./nutrition), plus
 * the meal and workout plans built around those targets.
 */

import {
  calculateDailyTargets,
  planSeed,
  validateAssessment,
} from './assessment-mapping';
import { buildMealPlan } from './meal-planner';
import { buildWorkoutPlan } from './workout-planner';
import type { AssessmentInput, MotionCorePlan } from './types';

export {
  KCAL_PER_KG_PER_WEEK,
  calculateDailyTargets,
  calorieGoalFor,
  paceAdjustmentPercent,
  planSeed,
  toNutritionInput,
  validateAssessment,
} from './assessment-mapping';

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
