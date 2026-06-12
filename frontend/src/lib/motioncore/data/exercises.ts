import type { Equipment, LocalizedText, MovementPattern, TrainingLevel } from '../types';

export type ExerciseEquipment = 'bodyweight' | 'dumbbells' | 'gym';

export type ExerciseItem = {
  id: string;
  name: LocalizedText;
  pattern: MovementPattern;
  minLevel: TrainingLevel;
  equipment: ExerciseEquipment;
  notes?: LocalizedText;
};

/** Equipment a user can access, from least to most equipped. */
export const equipmentAccess: Record<Equipment, ExerciseEquipment[]> = {
  none: ['bodyweight'],
  dumbbells: ['bodyweight', 'dumbbells'],
  gym: ['bodyweight', 'dumbbells', 'gym'],
};

const LEVEL_RANK: Record<TrainingLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export function levelAllows(userLevel: TrainingLevel, minLevel: TrainingLevel): boolean {
  return LEVEL_RANK[userLevel] >= LEVEL_RANK[minLevel];
}

/**
 * Ordered best-first within each pattern: the planner walks the list and
 * takes the first (or nth, for variety) exercise the user's equipment and
 * level allow. Every pattern keeps at least one bodyweight beginner entry
 * so a no-equipment plan always fills.
 */
export const exercises: ExerciseItem[] = [
  // ── Squat ────────────────────────────────────────────────────────────────
  {
    id: 'barbell-back-squat',
    name: { en: 'Barbell back squat', ar: 'سكوات بالبار' },
    pattern: 'squat',
    minLevel: 'intermediate',
    equipment: 'gym',
    notes: { en: 'Brace your core; hit parallel depth.', ar: 'شدّ جذعك وانزل حتى يتوازى الفخذ مع الأرض.' },
  },
  {
    id: 'goblet-squat',
    name: { en: 'Goblet squat', ar: 'سكوات جوبلت بالدمبل' },
    pattern: 'squat',
    minLevel: 'beginner',
    equipment: 'dumbbells',
    notes: { en: 'Hold the dumbbell at your chest; keep your torso upright.', ar: 'امسك الدمبل عند صدرك وحافظ على استقامة جذعك.' },
  },
  {
    id: 'leg-press',
    name: { en: 'Leg press', ar: 'دفع الأرجل بالجهاز' },
    pattern: 'squat',
    minLevel: 'beginner',
    equipment: 'gym',
  },
  {
    id: 'bodyweight-squat',
    name: { en: 'Bodyweight squat', ar: 'سكوات بوزن الجسم' },
    pattern: 'squat',
    minLevel: 'beginner',
    equipment: 'bodyweight',
    notes: { en: 'Slow the way down for more challenge.', ar: 'أبطئ النزول لزيادة الصعوبة.' },
  },

  // ── Hinge ────────────────────────────────────────────────────────────────
  {
    id: 'barbell-rdl',
    name: { en: 'Barbell Romanian deadlift', ar: 'رفعة رومانية بالبار' },
    pattern: 'hinge',
    minLevel: 'intermediate',
    equipment: 'gym',
    notes: { en: 'Push the hips back; keep the bar close to your legs.', ar: 'ادفع الوركين للخلف وأبقِ البار قريبًا من ساقيك.' },
  },
  {
    id: 'dumbbell-rdl',
    name: { en: 'Dumbbell Romanian deadlift', ar: 'رفعة رومانية بالدمبل' },
    pattern: 'hinge',
    minLevel: 'beginner',
    equipment: 'dumbbells',
  },
  {
    id: 'back-extension',
    name: { en: 'Back extension', ar: 'تمديد الظهر على الجهاز' },
    pattern: 'hinge',
    minLevel: 'beginner',
    equipment: 'gym',
  },
  {
    id: 'glute-bridge',
    name: { en: 'Glute bridge', ar: 'جسر المؤخرة' },
    pattern: 'hinge',
    minLevel: 'beginner',
    equipment: 'bodyweight',
    notes: { en: 'Squeeze the glutes hard at the top.', ar: 'اضغط عضلات المؤخرة بقوة عند الأعلى.' },
  },

  // ── Lunge ────────────────────────────────────────────────────────────────
  {
    id: 'bulgarian-split-squat',
    name: { en: 'Bulgarian split squat', ar: 'سكوات بلغاري' },
    pattern: 'lunge',
    minLevel: 'intermediate',
    equipment: 'dumbbells',
  },
  {
    id: 'dumbbell-walking-lunge',
    name: { en: 'Dumbbell walking lunge', ar: 'طعنات مشي بالدمبل' },
    pattern: 'lunge',
    minLevel: 'intermediate',
    equipment: 'dumbbells',
  },
  {
    id: 'dumbbell-split-squat',
    name: { en: 'Dumbbell split squat', ar: 'سكوات مفتوح بالدمبل' },
    pattern: 'lunge',
    minLevel: 'beginner',
    equipment: 'dumbbells',
  },
  {
    id: 'bodyweight-lunge',
    name: { en: 'Bodyweight lunge', ar: 'طعنات بوزن الجسم' },
    pattern: 'lunge',
    minLevel: 'beginner',
    equipment: 'bodyweight',
  },
  {
    id: 'step-up',
    name: { en: 'Step-up', ar: 'صعود الدرجة' },
    pattern: 'lunge',
    minLevel: 'beginner',
    equipment: 'bodyweight',
    notes: { en: 'Use a sturdy bench or step.', ar: 'استخدم مقعدًا أو درجة ثابتة.' },
  },

  // ── Horizontal push ──────────────────────────────────────────────────────
  {
    id: 'barbell-bench-press',
    name: { en: 'Barbell bench press', ar: 'ضغط صدر بالبار' },
    pattern: 'push-h',
    minLevel: 'intermediate',
    equipment: 'gym',
  },
  {
    id: 'dumbbell-bench-press',
    name: { en: 'Dumbbell bench press', ar: 'ضغط صدر بالدمبل' },
    pattern: 'push-h',
    minLevel: 'beginner',
    equipment: 'dumbbells',
  },
  {
    id: 'incline-dumbbell-press',
    name: { en: 'Incline dumbbell press', ar: 'ضغط صدر مائل بالدمبل' },
    pattern: 'push-h',
    minLevel: 'intermediate',
    equipment: 'dumbbells',
  },
  {
    id: 'machine-chest-press',
    name: { en: 'Machine chest press', ar: 'ضغط صدر بالجهاز' },
    pattern: 'push-h',
    minLevel: 'beginner',
    equipment: 'gym',
  },
  {
    id: 'push-up',
    name: { en: 'Push-up', ar: 'تمرين الضغط' },
    pattern: 'push-h',
    minLevel: 'beginner',
    equipment: 'bodyweight',
    notes: { en: 'Elevate your hands to make it easier; elevate your feet to make it harder.', ar: 'ارفع يديك لتسهيل التمرين أو قدميك لزيادة الصعوبة.' },
  },

  // ── Vertical push ────────────────────────────────────────────────────────
  {
    id: 'barbell-overhead-press',
    name: { en: 'Barbell overhead press', ar: 'ضغط كتف بالبار' },
    pattern: 'push-v',
    minLevel: 'intermediate',
    equipment: 'gym',
  },
  {
    id: 'seated-dumbbell-press',
    name: { en: 'Seated dumbbell shoulder press', ar: 'ضغط كتف بالدمبل جالسًا' },
    pattern: 'push-v',
    minLevel: 'beginner',
    equipment: 'dumbbells',
  },
  {
    id: 'machine-shoulder-press',
    name: { en: 'Machine shoulder press', ar: 'ضغط كتف بالجهاز' },
    pattern: 'push-v',
    minLevel: 'beginner',
    equipment: 'gym',
  },
  {
    id: 'lateral-raise',
    name: { en: 'Dumbbell lateral raise', ar: 'رفرفة جانبية بالدمبل' },
    pattern: 'push-v',
    minLevel: 'beginner',
    equipment: 'dumbbells',
    notes: { en: 'Light weight, controlled tempo.', ar: 'وزن خفيف وحركة مسيطر عليها.' },
  },
  {
    id: 'pike-push-up',
    name: { en: 'Pike push-up', ar: 'ضغط بايك' },
    pattern: 'push-v',
    minLevel: 'beginner',
    equipment: 'bodyweight',
    notes: { en: 'Hips high, head toward the floor between your hands.', ar: 'ارفع وركيك عاليًا ووجّه رأسك نحو الأرض بين يديك.' },
  },

  // ── Horizontal pull ──────────────────────────────────────────────────────
  {
    id: 'barbell-row',
    name: { en: 'Barbell row', ar: 'تجديف بالبار' },
    pattern: 'pull-h',
    minLevel: 'intermediate',
    equipment: 'gym',
  },
  {
    id: 'one-arm-dumbbell-row',
    name: { en: 'One-arm dumbbell row', ar: 'تجديف بالدمبل بذراع واحدة' },
    pattern: 'pull-h',
    minLevel: 'beginner',
    equipment: 'dumbbells',
  },
  {
    id: 'seated-cable-row',
    name: { en: 'Seated cable row', ar: 'تجديف بالكيبل جالسًا' },
    pattern: 'pull-h',
    minLevel: 'beginner',
    equipment: 'gym',
  },
  {
    id: 'inverted-row',
    name: { en: 'Inverted row', ar: 'تجديف معكوس' },
    pattern: 'pull-h',
    minLevel: 'intermediate',
    equipment: 'bodyweight',
    notes: { en: 'Use a sturdy table edge or low bar.', ar: 'استخدم حافة طاولة ثابتة أو عارضة منخفضة.' },
  },
  {
    id: 'towel-row',
    name: { en: 'Doorway towel row', ar: 'تجديف بالمنشفة على الباب' },
    pattern: 'pull-h',
    minLevel: 'beginner',
    equipment: 'bodyweight',
    notes: { en: 'Loop a towel around a door handle; lean back and row.', ar: 'لفّ منشفة حول مقبض الباب ثم انحنِ للخلف وجدّف.' },
  },

  // ── Vertical pull ────────────────────────────────────────────────────────
  {
    id: 'pull-up',
    name: { en: 'Pull-up', ar: 'عقلة' },
    pattern: 'pull-v',
    minLevel: 'advanced',
    equipment: 'bodyweight',
    notes: { en: 'Full hang to chin over the bar.', ar: 'من تعليق كامل حتى يتجاوز ذقنك العارضة.' },
  },
  {
    id: 'lat-pulldown',
    name: { en: 'Lat pulldown', ar: 'سحب أمامي بالجهاز' },
    pattern: 'pull-v',
    minLevel: 'beginner',
    equipment: 'gym',
  },
  {
    id: 'dumbbell-pullover',
    name: { en: 'Dumbbell pullover', ar: 'بلوفر بالدمبل' },
    pattern: 'pull-v',
    minLevel: 'beginner',
    equipment: 'dumbbells',
  },
  {
    id: 'prone-lat-pull',
    name: { en: 'Prone lat pull', ar: 'سحب أرضي على البطن' },
    pattern: 'pull-v',
    minLevel: 'beginner',
    equipment: 'bodyweight',
    notes: { en: 'Lie face down; pull imaginary bar to your chest, squeezing the lats.', ar: 'استلقِ على بطنك واسحب كأنك تسحب عارضة نحو صدرك مع شد عضلات الظهر.' },
  },

  // ── Core ─────────────────────────────────────────────────────────────────
  {
    id: 'hanging-knee-raise',
    name: { en: 'Hanging knee raise', ar: 'رفع الركبتين معلقًا' },
    pattern: 'core',
    minLevel: 'intermediate',
    equipment: 'gym',
  },
  {
    id: 'cable-crunch',
    name: { en: 'Cable crunch', ar: 'طحن بالكيبل' },
    pattern: 'core',
    minLevel: 'intermediate',
    equipment: 'gym',
  },
  {
    id: 'russian-twist',
    name: { en: 'Dumbbell Russian twist', ar: 'الالتفاف الروسي بالدمبل' },
    pattern: 'core',
    minLevel: 'beginner',
    equipment: 'dumbbells',
  },
  {
    id: 'plank',
    name: { en: 'Plank', ar: 'بلانك' },
    pattern: 'core',
    minLevel: 'beginner',
    equipment: 'bodyweight',
    notes: { en: 'Hold 30–60 seconds per set.', ar: 'اثبت من 30 إلى 60 ثانية في كل مجموعة.' },
  },
  {
    id: 'dead-bug',
    name: { en: 'Dead bug', ar: 'الحشرة الميتة' },
    pattern: 'core',
    minLevel: 'beginner',
    equipment: 'bodyweight',
    notes: { en: 'Keep your lower back pressed into the floor.', ar: 'أبقِ أسفل ظهرك ملتصقًا بالأرض.' },
  },
  {
    id: 'bicycle-crunch',
    name: { en: 'Bicycle crunch', ar: 'طحن الدراجة' },
    pattern: 'core',
    minLevel: 'beginner',
    equipment: 'bodyweight',
  },
];
