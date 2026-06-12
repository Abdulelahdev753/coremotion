import type { MealSlot } from '../types';
import type { FoodRole } from './foods';

/** Fraction of the daily targets assigned to each meal slot, by calorie tier. */
export function slotSharesFor(calories: number): Array<{ slot: MealSlot; share: number }> {
  if (calories < 1800) {
    return [
      { slot: 'breakfast', share: 0.3 },
      { slot: 'lunch', share: 0.35 },
      { slot: 'dinner', share: 0.25 },
      { slot: 'snack', share: 0.1 },
    ];
  }
  if (calories <= 2600) {
    return [
      { slot: 'breakfast', share: 0.25 },
      { slot: 'lunch', share: 0.35 },
      { slot: 'dinner', share: 0.3 },
      { slot: 'snack', share: 0.1 },
    ];
  }
  return [
    { slot: 'breakfast', share: 0.25 },
    { slot: 'lunch', share: 0.3 },
    { slot: 'dinner', share: 0.25 },
    { slot: 'snack', share: 0.1 },
    { slot: 'snack2', share: 0.1 },
  ];
}

/** Which food roles make up each slot, in display order. */
export const slotRoles: Record<MealSlot, FoodRole[]> = {
  breakfast: ['protein', 'carb', 'fruit'],
  lunch: ['protein', 'carb', 'veg', 'fat'],
  dinner: ['protein', 'carb', 'veg', 'fat'],
  snack: ['protein-snack', 'fruit'],
  snack2: ['fat', 'fruit'],
};

/**
 * Portioning priority: protein items first (the binding target), then
 * fixed-portion produce, then fat, and carbs last — carbs are the most
 * elastic and absorb the remaining calories.
 */
export const rolePortionOrder: Record<FoodRole, number> = {
  protein: 0,
  'protein-snack': 0,
  veg: 1,
  fruit: 1,
  fat: 2,
  carb: 3,
};
