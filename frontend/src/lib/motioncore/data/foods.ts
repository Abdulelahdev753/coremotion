import type { DietExclusion, LocalizedText, MealSlot } from '../types';

export type FoodRole = 'protein' | 'carb' | 'fat' | 'veg' | 'fruit' | 'protein-snack';

export type FoodItem = {
  id: string;
  name: LocalizedText;
  category: 'protein' | 'carb' | 'fat' | 'dairy' | 'fruit' | 'veg' | 'snack';
  role: FoodRole;
  slots: MealSlot[];
  /** Macros per 100 g (or 100 ml for drinks). */
  per100: { kcal: number; proteinG: number; carbsG: number; fatG: number };
  minG: number;
  maxG: number;
  gramsPerUnit?: number;
  unitName?: LocalizedText;
  contains: DietExclusion[];
};

/**
 * Macro data per 100 g.
 *
 * Generic foods are sourced from USDA FoodData Central (https://fdc.nal.usda.gov),
 * cited per entry as "USDA FDC #<id> — <official description>". Values were
 * pulled from the FDC API (SR Legacy dataset).
 *
 * Regional or branded items with no USDA entry (labneh, halloumi, samoli,
 * freekeh, jareesh, whey, protein bars, composite dishes) are label-based
 * estimates and marked "Estimate".
 */
export const foods: FoodItem[] = [
  // ── Lunch/dinner proteins ────────────────────────────────────────────────
  {
    id: 'chicken-breast',
    name: { en: 'Grilled chicken breast', ar: 'صدر دجاج مشوي' },
    category: 'protein',
    role: 'protein',
    slots: ['lunch', 'dinner'],
    // USDA FDC #171477 — Chicken, broilers or fryers, breast, meat only, cooked, roasted
    per100: { kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
    minG: 80,
    maxG: 250,
    contains: [],
  },
  {
    id: 'chicken-thigh',
    name: { en: 'Chicken thigh (skinless)', ar: 'فخذ دجاج بدون جلد' },
    category: 'protein',
    role: 'protein',
    slots: ['lunch', 'dinner'],
    per100: { kcal: 179, proteinG: 24, carbsG: 0, fatG: 8.5 },
    minG: 80,
    maxG: 250,
    contains: [],
  },
  {
    id: 'lean-beef',
    name: { en: 'Lean beef', ar: 'لحم بقري قليل الدهن' },
    category: 'protein',
    role: 'protein',
    slots: ['lunch', 'dinner'],
    // USDA FDC #174031 — Beef, ground, 90% lean meat / 10% fat, patty, cooked, broiled
    per100: { kcal: 217, proteinG: 26.1, carbsG: 0, fatG: 11.8 },
    minG: 80,
    maxG: 220,
    contains: [],
  },
  {
    id: 'lamb-lean',
    name: { en: 'Lean lamb', ar: 'لحم ضأن قليل الدهن' },
    category: 'protein',
    role: 'protein',
    slots: ['lunch', 'dinner'],
    // USDA FDC #174308 — Lamb, composite of trimmed retail cuts, separable lean only, cooked
    per100: { kcal: 206, proteinG: 28.2, carbsG: 0, fatG: 9.5 },
    minG: 80,
    maxG: 200,
    contains: [],
  },
  {
    id: 'beef-kofta',
    name: { en: 'Beef kofta', ar: 'كفتة لحم' },
    category: 'protein',
    role: 'protein',
    slots: ['lunch', 'dinner'],
    // Estimate — composite dish (ground beef + onion/spices), no USDA entry
    per100: { kcal: 250, proteinG: 18, carbsG: 3, fatG: 19 },
    minG: 80,
    maxG: 200,
    contains: [],
  },
  {
    id: 'salmon',
    name: { en: 'Salmon fillet', ar: 'فيليه سلمون' },
    category: 'protein',
    role: 'protein',
    slots: ['lunch', 'dinner'],
    // USDA FDC #175168 — Fish, salmon, Atlantic, farmed, cooked, dry heat
    per100: { kcal: 206, proteinG: 22.1, carbsG: 0, fatG: 12.4 },
    minG: 80,
    maxG: 200,
    contains: ['seafood'],
  },
  {
    id: 'hammour',
    name: { en: 'Hammour (white fish)', ar: 'سمك هامور' },
    category: 'protein',
    role: 'protein',
    slots: ['lunch', 'dinner'],
    // USDA FDC #171963 — Fish, grouper, mixed species, cooked, dry heat
    per100: { kcal: 118, proteinG: 24.8, carbsG: 0, fatG: 1.3 },
    minG: 100,
    maxG: 250,
    contains: ['seafood'],
  },
  {
    id: 'shrimp',
    name: { en: 'Shrimp', ar: 'روبيان' },
    category: 'protein',
    role: 'protein',
    slots: ['lunch', 'dinner'],
    per100: { kcal: 99, proteinG: 24, carbsG: 0.2, fatG: 0.3 },
    minG: 80,
    maxG: 250,
    contains: ['seafood'],
  },
  {
    id: 'tuna-canned',
    name: { en: 'Canned tuna (in water)', ar: 'تونة معلبة بالماء' },
    category: 'protein',
    role: 'protein',
    slots: ['lunch', 'dinner'],
    // USDA FDC #171986 — Fish, tuna, light, canned in water, drained solids
    per100: { kcal: 116, proteinG: 25.5, carbsG: 0, fatG: 0.8 },
    minG: 50,
    maxG: 200,
    contains: ['seafood'],
  },

  // ── Breakfast proteins ───────────────────────────────────────────────────
  {
    id: 'eggs',
    name: { en: 'Eggs', ar: 'بيض' },
    category: 'protein',
    role: 'protein',
    slots: ['breakfast'],
    // USDA FDC #171287 — Egg, whole, raw, fresh
    per100: { kcal: 143, proteinG: 12.6, carbsG: 0.7, fatG: 9.5 },
    minG: 50,
    maxG: 200,
    gramsPerUnit: 50,
    unitName: { en: 'egg', ar: 'بيضة' },
    contains: ['eggs'],
  },
  {
    id: 'egg-whites',
    name: { en: 'Egg whites', ar: 'بياض البيض' },
    category: 'protein',
    role: 'protein',
    slots: ['breakfast'],
    // USDA FDC #172183 — Egg, white, raw, fresh
    per100: { kcal: 52, proteinG: 10.9, carbsG: 0.7, fatG: 0.2 },
    minG: 100,
    maxG: 400,
    contains: ['eggs'],
  },
  {
    id: 'greek-yogurt',
    name: { en: 'Greek yogurt (low fat)', ar: 'زبادي يوناني قليل الدسم' },
    category: 'dairy',
    role: 'protein',
    slots: ['breakfast'],
    per100: { kcal: 73, proteinG: 10, carbsG: 3.9, fatG: 1.9 },
    minG: 100,
    maxG: 300,
    contains: ['dairy'],
  },
  {
    id: 'labneh',
    name: { en: 'Labneh (light)', ar: 'لبنة قليلة الدسم' },
    category: 'dairy',
    role: 'protein',
    slots: ['breakfast'],
    // Estimate — regional product, no USDA entry; based on KSA label data
    per100: { kcal: 110, proteinG: 9, carbsG: 5, fatG: 6 },
    minG: 50,
    maxG: 150,
    contains: ['dairy'],
  },
  {
    id: 'halloumi',
    name: { en: 'Grilled halloumi', ar: 'جبن حلوم مشوي' },
    category: 'dairy',
    role: 'protein',
    slots: ['breakfast'],
    // Estimate — branded product, no USDA generic entry; based on label data
    per100: { kcal: 321, proteinG: 21, carbsG: 3, fatG: 25 },
    minG: 30,
    maxG: 100,
    contains: ['dairy'],
  },
  {
    id: 'cottage-cheese',
    name: { en: 'Cottage cheese', ar: 'جبن قريش' },
    category: 'dairy',
    role: 'protein',
    slots: ['breakfast'],
    per100: { kcal: 84, proteinG: 11, carbsG: 4.3, fatG: 2.3 },
    minG: 100,
    maxG: 250,
    contains: ['dairy'],
  },
  {
    id: 'foul-medames',
    name: { en: 'Foul medames', ar: 'فول مدمس' },
    category: 'protein',
    role: 'protein',
    slots: ['breakfast'],
    // USDA FDC #173753 — Broadbeans (fava beans), mature seeds, cooked, boiled
    per100: { kcal: 110, proteinG: 7.6, carbsG: 19.6, fatG: 0.4 },
    minG: 100,
    maxG: 300,
    contains: [],
  },

  // ── Protein snacks ───────────────────────────────────────────────────────
  {
    id: 'laban',
    name: { en: 'Laban (low fat)', ar: 'لبن قليل الدسم' },
    category: 'dairy',
    role: 'protein-snack',
    slots: ['snack', 'snack2'],
    per100: { kcal: 40, proteinG: 3.3, carbsG: 4.7, fatG: 1 },
    minG: 120,
    maxG: 480,
    gramsPerUnit: 240,
    unitName: { en: 'cup', ar: 'كوب' },
    contains: ['dairy'],
  },
  {
    id: 'whey-protein',
    name: { en: 'Whey protein shake', ar: 'مخفوق بروتين مصل اللبن' },
    category: 'snack',
    role: 'protein-snack',
    slots: ['snack', 'snack2'],
    // Estimate — branded supplement; typical whey-isolate label values
    per100: { kcal: 380, proteinG: 75, carbsG: 8, fatG: 6 },
    minG: 15,
    maxG: 60,
    gramsPerUnit: 30,
    unitName: { en: 'scoop', ar: 'سكوب' },
    contains: ['dairy'],
  },
  {
    id: 'protein-bar',
    name: { en: 'Protein bar', ar: 'لوح بروتين' },
    category: 'snack',
    role: 'protein-snack',
    slots: ['snack', 'snack2'],
    // Estimate — branded product; typical label values across common bars
    per100: { kcal: 380, proteinG: 30, carbsG: 40, fatG: 12 },
    minG: 30,
    maxG: 120,
    gramsPerUnit: 60,
    unitName: { en: 'bar', ar: 'لوح' },
    contains: ['nuts'],
  },
  {
    id: 'roasted-chickpeas',
    name: { en: 'Roasted chickpeas', ar: 'حمص محمص' },
    category: 'snack',
    role: 'protein-snack',
    slots: ['snack', 'snack2'],
    // Estimate — no USDA entry for dry-roasted chickpeas; based on label data
    per100: { kcal: 387, proteinG: 19, carbsG: 58, fatG: 6 },
    minG: 20,
    maxG: 60,
    contains: [],
  },

  // ── Carbs ────────────────────────────────────────────────────────────────
  {
    id: 'oats',
    name: { en: 'Oats', ar: 'شوفان' },
    category: 'carb',
    role: 'carb',
    slots: ['breakfast'],
    per100: { kcal: 389, proteinG: 16.9, carbsG: 66, fatG: 6.9 },
    minG: 30,
    maxG: 120,
    contains: [],
  },
  {
    id: 'samoli',
    name: { en: 'Samoli bread', ar: 'خبز صامولي' },
    category: 'carb',
    role: 'carb',
    slots: ['breakfast'],
    // Estimate — regional bread, no USDA entry; based on KSA bakery label data
    per100: { kcal: 270, proteinG: 9, carbsG: 52, fatG: 2.5 },
    minG: 30,
    maxG: 120,
    gramsPerUnit: 60,
    unitName: { en: 'roll', ar: 'حبة' },
    contains: ['gluten'],
  },
  {
    id: 'whole-wheat-toast',
    name: { en: 'Whole-wheat toast', ar: 'خبز توست أسمر' },
    category: 'carb',
    role: 'carb',
    slots: ['breakfast'],
    // USDA FDC #172688 — Bread, whole-wheat, commercially prepared
    per100: { kcal: 252, proteinG: 12.4, carbsG: 42.7, fatG: 3.5 },
    minG: 30,
    maxG: 120,
    gramsPerUnit: 30,
    unitName: { en: 'slice', ar: 'شريحة' },
    contains: ['gluten'],
  },
  {
    id: 'arabic-bread',
    name: { en: 'Arabic bread', ar: 'خبز عربي' },
    category: 'carb',
    role: 'carb',
    slots: ['breakfast', 'lunch', 'dinner'],
    // USDA FDC #172816 — Bread, pita, white
    per100: { kcal: 275, proteinG: 9.1, carbsG: 55.7, fatG: 1.2 },
    minG: 30,
    maxG: 120,
    gramsPerUnit: 60,
    unitName: { en: 'loaf', ar: 'رغيف' },
    contains: ['gluten'],
  },
  {
    id: 'white-rice',
    name: { en: 'White rice (cooked)', ar: 'أرز أبيض مطبوخ' },
    category: 'carb',
    role: 'carb',
    slots: ['lunch', 'dinner'],
    // USDA FDC #168878 — Rice, white, long-grain, regular, enriched, cooked
    per100: { kcal: 130, proteinG: 2.7, carbsG: 28.2, fatG: 0.3 },
    minG: 100,
    maxG: 450,
    contains: [],
  },
  {
    id: 'brown-rice',
    name: { en: 'Brown rice (cooked)', ar: 'أرز بني مطبوخ' },
    category: 'carb',
    role: 'carb',
    slots: ['lunch', 'dinner'],
    // USDA FDC #169704 — Rice, brown, long-grain, cooked
    per100: { kcal: 123, proteinG: 2.7, carbsG: 25.6, fatG: 1 },
    minG: 100,
    maxG: 450,
    contains: [],
  },
  {
    id: 'pasta',
    name: { en: 'Pasta (cooked)', ar: 'معكرونة مسلوقة' },
    category: 'carb',
    role: 'carb',
    slots: ['lunch', 'dinner'],
    // USDA FDC #169737 — Pasta, cooked, enriched, without added salt
    per100: { kcal: 158, proteinG: 5.8, carbsG: 30.9, fatG: 0.9 },
    minG: 100,
    maxG: 450,
    contains: ['gluten'],
  },
  {
    id: 'potato',
    name: { en: 'Boiled potato', ar: 'بطاطس مسلوقة' },
    category: 'carb',
    role: 'carb',
    slots: ['lunch', 'dinner'],
    per100: { kcal: 87, proteinG: 1.9, carbsG: 20, fatG: 0.1 },
    minG: 100,
    maxG: 500,
    contains: [],
  },
  {
    id: 'sweet-potato',
    name: { en: 'Baked sweet potato', ar: 'بطاطا حلوة مشوية' },
    category: 'carb',
    role: 'carb',
    slots: ['lunch', 'dinner'],
    // USDA FDC #168483 — Sweet potato, cooked, baked in skin, flesh
    per100: { kcal: 90, proteinG: 2, carbsG: 20.7, fatG: 0.2 },
    minG: 100,
    maxG: 500,
    contains: [],
  },
  {
    id: 'freekeh',
    name: { en: 'Freekeh (cooked)', ar: 'فريكة مطبوخة' },
    category: 'carb',
    role: 'carb',
    slots: ['lunch', 'dinner'],
    // Estimate — regional grain, no USDA entry; based on label/FAO data
    per100: { kcal: 126, proteinG: 5, carbsG: 24, fatG: 1 },
    minG: 100,
    maxG: 300,
    contains: ['gluten'],
  },
  {
    id: 'jareesh',
    name: { en: 'Jareesh (cooked)', ar: 'جريش مطبوخ' },
    category: 'carb',
    role: 'carb',
    slots: ['lunch', 'dinner'],
    // Estimate — regional dish (cracked wheat), no USDA entry; based on FAO data
    per100: { kcal: 114, proteinG: 3.5, carbsG: 23, fatG: 0.5 },
    minG: 100,
    maxG: 300,
    contains: ['gluten'],
  },
  {
    id: 'quinoa',
    name: { en: 'Quinoa (cooked)', ar: 'كينوا مطبوخة' },
    category: 'carb',
    role: 'carb',
    slots: ['lunch', 'dinner'],
    // USDA FDC #168917 — Quinoa, cooked
    per100: { kcal: 120, proteinG: 4.4, carbsG: 21.3, fatG: 1.9 },
    minG: 100,
    maxG: 300,
    contains: [],
  },
  {
    id: 'lentils',
    name: { en: 'Lentils (cooked)', ar: 'عدس مطبوخ' },
    category: 'carb',
    role: 'carb',
    slots: ['lunch', 'dinner'],
    // USDA FDC #172421 — Lentils, mature seeds, cooked, boiled
    per100: { kcal: 116, proteinG: 9, carbsG: 20.1, fatG: 0.4 },
    minG: 100,
    maxG: 300,
    contains: [],
  },

  // ── Fats ─────────────────────────────────────────────────────────────────
  {
    id: 'olive-oil',
    name: { en: 'Olive oil', ar: 'زيت زيتون' },
    category: 'fat',
    role: 'fat',
    slots: ['lunch', 'dinner'],
    // USDA FDC #171413 — Oil, olive, salad or cooking
    per100: { kcal: 884, proteinG: 0, carbsG: 0, fatG: 100 },
    minG: 5,
    maxG: 20,
    contains: [],
  },
  {
    id: 'tahini',
    name: { en: 'Tahini', ar: 'طحينة' },
    category: 'fat',
    role: 'fat',
    slots: ['lunch', 'dinner'],
    // USDA FDC #170189 — Seeds, sesame butter, tahini, from roasted kernels
    per100: { kcal: 595, proteinG: 17, carbsG: 21.2, fatG: 53.8 },
    minG: 10,
    maxG: 30,
    contains: ['nuts'],
  },
  {
    id: 'hummus',
    name: { en: 'Hummus', ar: 'حمص بالطحينة' },
    category: 'fat',
    role: 'fat',
    slots: ['lunch', 'dinner'],
    // USDA FDC #174289 — Hummus, commercial
    per100: { kcal: 237, proteinG: 7.8, carbsG: 15, fatG: 17.8 },
    minG: 30,
    maxG: 100,
    contains: ['nuts'],
  },
  {
    id: 'avocado',
    name: { en: 'Avocado', ar: 'أفوكادو' },
    category: 'fat',
    role: 'fat',
    slots: ['lunch', 'dinner', 'snack2'],
    // USDA FDC #171705 — Avocados, raw, all commercial varieties
    per100: { kcal: 160, proteinG: 2, carbsG: 8.5, fatG: 14.7 },
    minG: 50,
    maxG: 150,
    contains: [],
  },
  {
    id: 'olives',
    name: { en: 'Olives', ar: 'زيتون' },
    category: 'fat',
    role: 'fat',
    slots: ['lunch', 'dinner'],
    // USDA FDC #169094 — Olives, ripe, canned
    per100: { kcal: 116, proteinG: 0.8, carbsG: 6, fatG: 10.9 },
    minG: 20,
    maxG: 60,
    contains: [],
  },
  {
    id: 'mixed-nuts',
    name: { en: 'Mixed nuts', ar: 'مكسرات مشكلة' },
    category: 'fat',
    role: 'fat',
    slots: ['snack', 'snack2'],
    // USDA FDC #170585 — Nuts, mixed nuts, dry roasted, with peanuts, without salt
    per100: { kcal: 607, proteinG: 19.5, carbsG: 22.4, fatG: 53.5 },
    minG: 15,
    maxG: 50,
    contains: ['nuts'],
  },
  {
    id: 'almonds',
    name: { en: 'Almonds', ar: 'لوز' },
    category: 'fat',
    role: 'fat',
    slots: ['snack', 'snack2'],
    // USDA FDC #170567 — Nuts, almonds
    per100: { kcal: 579, proteinG: 21.2, carbsG: 21.6, fatG: 49.9 },
    minG: 15,
    maxG: 50,
    contains: ['nuts'],
  },
  {
    id: 'peanut-butter',
    name: { en: 'Peanut butter', ar: 'زبدة فول سوداني' },
    category: 'fat',
    role: 'fat',
    slots: ['snack', 'snack2'],
    // USDA FDC #172470 — Peanut butter, smooth style, without salt
    per100: { kcal: 598, proteinG: 22.2, carbsG: 22.3, fatG: 51.4 },
    minG: 10,
    maxG: 40,
    contains: ['nuts'],
  },

  // ── Fruits ───────────────────────────────────────────────────────────────
  {
    id: 'dates',
    name: { en: 'Dates', ar: 'تمر' },
    category: 'fruit',
    role: 'fruit',
    slots: ['breakfast', 'snack', 'snack2'],
    // USDA FDC #171726 — Dates, deglet noor
    per100: { kcal: 282, proteinG: 2.5, carbsG: 75, fatG: 0.4 },
    minG: 16,
    maxG: 80,
    gramsPerUnit: 8,
    unitName: { en: 'date', ar: 'حبة' },
    contains: [],
  },
  {
    id: 'banana',
    name: { en: 'Banana', ar: 'موز' },
    category: 'fruit',
    role: 'fruit',
    slots: ['breakfast', 'snack', 'snack2'],
    // USDA FDC #173944 — Bananas, raw
    per100: { kcal: 89, proteinG: 1.1, carbsG: 22.8, fatG: 0.3 },
    minG: 59,
    maxG: 236,
    gramsPerUnit: 118,
    unitName: { en: 'banana', ar: 'موزة' },
    contains: [],
  },
  {
    id: 'apple',
    name: { en: 'Apple', ar: 'تفاح' },
    category: 'fruit',
    role: 'fruit',
    slots: ['snack', 'snack2'],
    // USDA FDC #171688 — Apples, raw, with skin
    per100: { kcal: 52, proteinG: 0.3, carbsG: 13.8, fatG: 0.2 },
    minG: 90,
    maxG: 360,
    gramsPerUnit: 180,
    unitName: { en: 'apple', ar: 'تفاحة' },
    contains: [],
  },
  {
    id: 'orange',
    name: { en: 'Orange', ar: 'برتقال' },
    category: 'fruit',
    role: 'fruit',
    slots: ['breakfast', 'snack', 'snack2'],
    // USDA FDC #169097 — Oranges, raw, all commercial varieties
    per100: { kcal: 47, proteinG: 0.9, carbsG: 11.8, fatG: 0.1 },
    minG: 65,
    maxG: 260,
    gramsPerUnit: 130,
    unitName: { en: 'orange', ar: 'برتقالة' },
    contains: [],
  },
  {
    id: 'watermelon',
    name: { en: 'Watermelon', ar: 'بطيخ' },
    category: 'fruit',
    role: 'fruit',
    slots: ['snack', 'snack2'],
    // USDA FDC #167765 — Watermelon, raw
    per100: { kcal: 30, proteinG: 0.6, carbsG: 7.6, fatG: 0.2 },
    minG: 100,
    maxG: 400,
    contains: [],
  },
  {
    id: 'grapes',
    name: { en: 'Grapes', ar: 'عنب' },
    category: 'fruit',
    role: 'fruit',
    slots: ['snack', 'snack2'],
    // USDA FDC #174683 — Grapes, red or green (European type), raw
    per100: { kcal: 69, proteinG: 0.7, carbsG: 18.1, fatG: 0.2 },
    minG: 80,
    maxG: 250,
    contains: [],
  },
  {
    id: 'mango',
    name: { en: 'Mango', ar: 'مانجو' },
    category: 'fruit',
    role: 'fruit',
    slots: ['snack', 'snack2'],
    // USDA FDC #169910 — Mangos, raw
    per100: { kcal: 60, proteinG: 0.8, carbsG: 15, fatG: 0.4 },
    minG: 100,
    maxG: 300,
    contains: [],
  },
  {
    id: 'pomegranate',
    name: { en: 'Pomegranate', ar: 'رمان' },
    category: 'fruit',
    role: 'fruit',
    slots: ['snack', 'snack2'],
    // USDA FDC #169134 — Pomegranates, raw
    per100: { kcal: 83, proteinG: 1.7, carbsG: 18.7, fatG: 1.2 },
    minG: 80,
    maxG: 250,
    contains: [],
  },
  {
    id: 'strawberries',
    name: { en: 'Strawberries', ar: 'فراولة' },
    category: 'fruit',
    role: 'fruit',
    slots: ['breakfast', 'snack', 'snack2'],
    // USDA FDC #167762 — Strawberries, raw
    per100: { kcal: 32, proteinG: 0.7, carbsG: 7.7, fatG: 0.3 },
    minG: 100,
    maxG: 300,
    contains: [],
  },

  // ── Vegetables ───────────────────────────────────────────────────────────
  {
    id: 'mixed-salad',
    name: { en: 'Green salad', ar: 'سلطة خضراء' },
    category: 'veg',
    role: 'veg',
    slots: ['lunch', 'dinner'],
    // Estimate — composite (lettuce, cucumber, tomato), averaged from USDA items
    per100: { kcal: 20, proteinG: 1.5, carbsG: 3.5, fatG: 0.2 },
    minG: 80,
    maxG: 300,
    contains: [],
  },
  {
    id: 'cucumber-tomato-salad',
    name: { en: 'Cucumber & tomato salad', ar: 'سلطة خيار وطماطم' },
    category: 'veg',
    role: 'veg',
    slots: ['lunch', 'dinner'],
    // Estimate — composite, averaged from USDA cucumber (#168409) and tomato (#170457)
    per100: { kcal: 18, proteinG: 0.9, carbsG: 3.9, fatG: 0.1 },
    minG: 80,
    maxG: 300,
    contains: [],
  },
  {
    id: 'broccoli',
    name: { en: 'Steamed broccoli', ar: 'بروكلي على البخار' },
    category: 'veg',
    role: 'veg',
    slots: ['lunch', 'dinner'],
    // USDA FDC #169967 — Broccoli, cooked, boiled, drained
    per100: { kcal: 35, proteinG: 2.4, carbsG: 7.2, fatG: 0.4 },
    minG: 80,
    maxG: 300,
    contains: [],
  },
  {
    id: 'green-beans',
    name: { en: 'Green beans', ar: 'فاصوليا خضراء' },
    category: 'veg',
    role: 'veg',
    slots: ['lunch', 'dinner'],
    per100: { kcal: 35, proteinG: 1.9, carbsG: 7.9, fatG: 0.2 },
    minG: 80,
    maxG: 300,
    contains: [],
  },
  {
    id: 'zucchini',
    name: { en: 'Zucchini', ar: 'كوسة' },
    category: 'veg',
    role: 'veg',
    slots: ['lunch', 'dinner'],
    // USDA FDC #169291 — Squash, summer, zucchini, includes skin, raw
    per100: { kcal: 17, proteinG: 1.2, carbsG: 3.1, fatG: 0.3 },
    minG: 80,
    maxG: 300,
    contains: [],
  },
  {
    id: 'carrots',
    name: { en: 'Carrots', ar: 'جزر' },
    category: 'veg',
    role: 'veg',
    slots: ['lunch', 'dinner'],
    // USDA FDC #170393 — Carrots, raw
    per100: { kcal: 41, proteinG: 0.9, carbsG: 9.6, fatG: 0.2 },
    minG: 80,
    maxG: 300,
    contains: [],
  },
  {
    id: 'spinach',
    name: { en: 'Spinach', ar: 'سبانخ' },
    category: 'veg',
    role: 'veg',
    slots: ['lunch', 'dinner'],
    // USDA FDC #168462 — Spinach, raw
    per100: { kcal: 23, proteinG: 2.9, carbsG: 3.6, fatG: 0.4 },
    minG: 80,
    maxG: 300,
    contains: [],
  },
  {
    id: 'cauliflower',
    name: { en: 'Cauliflower', ar: 'قرنبيط' },
    category: 'veg',
    role: 'veg',
    slots: ['lunch', 'dinner'],
    // USDA FDC #169986 — Cauliflower, raw
    per100: { kcal: 25, proteinG: 1.9, carbsG: 5, fatG: 0.3 },
    minG: 80,
    maxG: 300,
    contains: [],
  },
  {
    id: 'okra',
    name: { en: 'Okra', ar: 'بامية' },
    category: 'veg',
    role: 'veg',
    slots: ['lunch', 'dinner'],
    // USDA FDC #169260 — Okra, raw
    per100: { kcal: 33, proteinG: 1.9, carbsG: 7.5, fatG: 0.2 },
    minG: 80,
    maxG: 300,
    contains: [],
  },
  {
    id: 'grilled-veg',
    name: { en: 'Grilled vegetables', ar: 'خضار مشوية' },
    category: 'veg',
    role: 'veg',
    slots: ['lunch', 'dinner'],
    // Estimate — composite (zucchini, peppers, onion, carrot), averaged from USDA items
    per100: { kcal: 35, proteinG: 1.5, carbsG: 7, fatG: 0.5 },
    minG: 80,
    maxG: 300,
    contains: [],
  },
];
