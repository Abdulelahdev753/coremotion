import { foods, type FoodItem, type FoodRole } from './data/foods';
import { rolePortionOrder, slotRoles, slotSharesFor } from './data/meal-templates';
import type {
  DailyTargets,
  DietExclusion,
  MacroTotals,
  Meal,
  MealItem,
  MealPlan,
  MealSlot,
} from './types';

const DEFAULT_VEG_G = 150;
const DEFAULT_FRUIT_G = 120;

/** Acceptable day-level calorie drift after the correction pass. */
const DAY_KCAL_TOLERANCE = 0.02;

/**
 * When the day misses its calorie target, items absorb the error in this
 * order — carbs are dietarily the most elastic, vegetables the least.
 */
const ELASTICITY_ORDER: Record<FoodRole, number> = {
  carb: 0,
  fat: 1,
  'protein-snack': 2,
  protein: 3,
  fruit: 4,
  veg: 5,
};

type SlotPick = { slot: MealSlot; role: FoodRole; food: FoodItem; grams: number };

export function buildMealPlan(
  targets: DailyTargets,
  exclusions: DietExclusion[],
  seed: number,
): MealPlan {
  const shares = slotSharesFor(targets.calories);
  const picks = shares.flatMap(({ slot, share }, slotIndex) =>
    portionSlot(slot, slotIndex, share, targets, exclusions, seed),
  );
  correctDayCalories(picks, targets.calories);

  const meals: Meal[] = shares.map(({ slot }) => {
    const items = picks.filter((pick) => pick.slot === slot).map(toMealItem);
    return { slot, items, totals: sumTotals(items) };
  });

  return { meals, dayTotals: sumTotals(meals.map((meal) => meal.totals)) };
}

/** Picks one food per slot role and portions it against the slot's share. */
function portionSlot(
  slot: MealSlot,
  slotIndex: number,
  share: number,
  targets: DailyTargets,
  exclusions: DietExclusion[],
  seed: number,
): SlotPick[] {
  // A role may come up empty under heavy exclusions (e.g. a nut allergy
  // removes every snack fat) — skip it; the day-level correction below
  // absorbs the gap.
  const picks: SlotPick[] = [];
  slotRoles[slot].forEach((role, roleIndex) => {
    const candidates = foods.filter(
      (food) =>
        food.role === role &&
        food.slots.includes(slot) &&
        !food.contains.some((tag) => exclusions.includes(tag)),
    );
    if (candidates.length === 0) return;
    const food = candidates[(seed + slotIndex * 7 + roleIndex) % candidates.length];
    picks.push({ slot, role, food, grams: 0 });
  });

  // Portion protein first (the binding target), then fixed-portion produce,
  // then fat; carbs last so they soak up what's left of the slot.
  const remaining: MacroTotals = {
    kcal: targets.calories * share,
    proteinG: targets.proteinG * share,
    carbsG: targets.carbsG * share,
    fatG: targets.fatG * share,
  };
  for (const pick of [...picks].sort(
    (a, b) => rolePortionOrder[a.role] - rolePortionOrder[b.role],
  )) {
    pick.grams = clamp(portionGrams(pick, remaining), pick.food.minG, pick.food.maxG);
    remaining.proteinG -= macro(pick, 'proteinG');
    remaining.carbsG -= macro(pick, 'carbsG');
    remaining.fatG -= macro(pick, 'fatG');
    remaining.kcal -= macro(pick, 'kcal');
  }
  return picks;
}

/**
 * Portion clamps make individual slots over- or undershoot (very low or very
 * high targets hit minG/maxG), so rebalance once at the day level: walk the
 * items from most to least elastic and let each absorb as much of the
 * remaining calorie error as its clamp bounds allow.
 */
function correctDayCalories(picks: SlotPick[], targetKcal: number) {
  let error = targetKcal - picks.reduce((sum, pick) => sum + macro(pick, 'kcal'), 0);
  const tolerance = targetKcal * DAY_KCAL_TOLERANCE;

  for (const pick of [...picks].sort(
    (a, b) => ELASTICITY_ORDER[a.role] - ELASTICITY_ORDER[b.role],
  )) {
    if (Math.abs(error) <= tolerance) return;
    const desired = pick.grams + (error / pick.food.per100.kcal) * 100;
    const adjusted = clamp(desired, pick.food.minG, pick.food.maxG);
    error -= ((adjusted - pick.grams) * pick.food.per100.kcal) / 100;
    pick.grams = adjusted;
  }
}

function portionGrams(pick: SlotPick, remaining: MacroTotals): number {
  const { food, role } = pick;
  switch (role) {
    case 'protein':
    case 'protein-snack':
      return targetPortion(remaining.proteinG, food.per100.proteinG);
    case 'fat':
      return targetPortion(remaining.fatG, food.per100.fatG);
    case 'carb':
      return targetPortion(remaining.carbsG, food.per100.carbsG);
    case 'veg':
      return DEFAULT_VEG_G;
    case 'fruit':
      return food.gramsPerUnit ?? DEFAULT_FRUIT_G;
  }
}

function targetPortion(targetG: number, per100G: number): number {
  if (per100G <= 0 || targetG <= 0) return 0;
  return (targetG / per100G) * 100;
}

function toMealItem(pick: SlotPick): MealItem {
  const { food } = pick;
  // Foods naturally counted in units round to half units; the rest to 5 g.
  let grams: number;
  let units: MealItem['units'];
  if (food.gramsPerUnit && food.unitName) {
    const count = Math.max(0.5, Math.round((pick.grams / food.gramsPerUnit) * 2) / 2);
    grams = Math.round(count * food.gramsPerUnit);
    units = { count, unitName: food.unitName };
  } else {
    grams = Math.max(5, Math.round(pick.grams / 5) * 5);
  }

  const factor = grams / 100;
  return {
    foodId: food.id,
    name: food.name,
    grams,
    units,
    kcal: Math.round(food.per100.kcal * factor),
    proteinG: Math.round(food.per100.proteinG * factor),
    carbsG: Math.round(food.per100.carbsG * factor),
    fatG: Math.round(food.per100.fatG * factor),
  };
}

function macro(pick: SlotPick, key: keyof MacroTotals): number {
  const per100 =
    key === 'kcal'
      ? pick.food.per100.kcal
      : pick.food.per100[key as 'proteinG' | 'carbsG' | 'fatG'];
  return (per100 * pick.grams) / 100;
}

function sumTotals(parts: MacroTotals[]): MacroTotals {
  return parts.reduce(
    (acc, part) => ({
      kcal: acc.kcal + part.kcal,
      proteinG: acc.proteinG + part.proteinG,
      carbsG: acc.carbsG + part.carbsG,
      fatG: acc.fatG + part.fatG,
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
