import { equipmentAccess, exercises, levelAllows } from './data/exercises';
import type {
  DaysPerWeek,
  Equipment,
  Goal,
  LocalizedText,
  MovementPattern,
  TrainingLevel,
  WorkoutDay,
  WorkoutExercise,
  WorkoutPlan,
} from './types';

/** A day template slot: movement pattern + variety offset (nth-best pick). */
type PatternSlot = { pattern: MovementPattern; offset?: number };

type DayTemplate = { title: LocalizedText; slots: PatternSlot[] };

const FULL_BODY_A: DayTemplate = {
  title: { en: 'Full body A', ar: 'جسم كامل أ' },
  slots: [
    { pattern: 'squat' },
    { pattern: 'push-h' },
    { pattern: 'pull-h' },
    { pattern: 'hinge' },
    { pattern: 'core' },
  ],
};

const FULL_BODY_B: DayTemplate = {
  title: { en: 'Full body B', ar: 'جسم كامل ب' },
  slots: [
    { pattern: 'hinge' },
    { pattern: 'push-v' },
    { pattern: 'pull-v' },
    { pattern: 'lunge' },
    { pattern: 'core' },
  ],
};

const UPPER_A: DayTemplate = {
  title: { en: 'Upper body A', ar: 'الجزء العلوي أ' },
  slots: [
    { pattern: 'push-h' },
    { pattern: 'pull-h' },
    { pattern: 'push-v' },
    { pattern: 'pull-v' },
    { pattern: 'core' },
  ],
};

const LOWER_A: DayTemplate = {
  title: { en: 'Lower body A', ar: 'الجزء السفلي أ' },
  slots: [
    { pattern: 'squat' },
    { pattern: 'hinge' },
    { pattern: 'lunge' },
    { pattern: 'core' },
  ],
};

const UPPER_B: DayTemplate = {
  title: { en: 'Upper body B', ar: 'الجزء العلوي ب' },
  slots: [
    { pattern: 'push-h', offset: 1 },
    { pattern: 'pull-h', offset: 1 },
    { pattern: 'push-v', offset: 1 },
    { pattern: 'pull-v', offset: 1 },
    { pattern: 'core', offset: 1 },
  ],
};

const LOWER_B: DayTemplate = {
  title: { en: 'Lower body B', ar: 'الجزء السفلي ب' },
  slots: [
    { pattern: 'squat', offset: 1 },
    { pattern: 'hinge', offset: 1 },
    { pattern: 'lunge', offset: 1 },
    { pattern: 'core', offset: 1 },
  ],
};

const PUSH_DAY: DayTemplate = {
  title: { en: 'Push', ar: 'دفع' },
  slots: [
    { pattern: 'push-h' },
    { pattern: 'push-v' },
    { pattern: 'push-h', offset: 1 },
    { pattern: 'core' },
  ],
};

const PULL_DAY: DayTemplate = {
  title: { en: 'Pull', ar: 'سحب' },
  slots: [
    { pattern: 'pull-v' },
    { pattern: 'pull-h' },
    { pattern: 'pull-h', offset: 1 },
    { pattern: 'core', offset: 1 },
  ],
};

const LEGS_DAY: DayTemplate = {
  title: { en: 'Legs', ar: 'أرجل' },
  slots: [
    { pattern: 'squat' },
    { pattern: 'hinge' },
    { pattern: 'lunge' },
    { pattern: 'core' },
  ],
};

const SPLITS: Record<
  DaysPerWeek,
  { name: LocalizedText; days: DayTemplate[] }
> = {
  3: {
    name: { en: '3-day full body', ar: 'جسم كامل — 3 أيام' },
    days: [FULL_BODY_A, FULL_BODY_B, FULL_BODY_A],
  },
  4: {
    name: { en: '4-day upper/lower', ar: 'علوي/سفلي — 4 أيام' },
    days: [UPPER_A, LOWER_A, UPPER_B, LOWER_B],
  },
  5: {
    name: { en: '5-day push/pull/legs + upper/lower', ar: 'دفع/سحب/أرجل + علوي/سفلي — 5 أيام' },
    days: [PUSH_DAY, PULL_DAY, LEGS_DAY, UPPER_B, LOWER_B],
  },
};

const PRESCRIPTIONS: Record<Goal, { reps: string; restSeconds: number }> = {
  fatLoss: { reps: '10–12', restSeconds: 60 },
  muscleGain: { reps: '8–12', restSeconds: 90 },
  fitness: { reps: '10–15', restSeconds: 75 },
};

const CARDIO_NOTES: Record<Goal, LocalizedText> = {
  fatLoss: {
    en: 'Add 20–30 minutes of brisk walking or light cardio 2–3 times a week.',
    ar: 'أضف 20–30 دقيقة من المشي السريع أو الكارديو الخفيف 2–3 مرات في الأسبوع.',
  },
  fitness: {
    en: 'Add 20 minutes of moderate cardio twice a week.',
    ar: 'أضف 20 دقيقة من الكارديو المعتدل مرتين في الأسبوع.',
  },
  muscleGain: {
    en: 'Optional: 1–2 light cardio sessions a week for heart health.',
    ar: 'اختياري: جلسة أو جلستان من الكارديو الخفيف أسبوعيًا لصحة القلب.',
  },
};

export function buildWorkoutPlan(
  level: TrainingLevel,
  goal: Goal,
  equipment: Equipment,
  daysPerWeek: DaysPerWeek,
): WorkoutPlan {
  const split = SPLITS[daysPerWeek];
  const sets = goal === 'muscleGain' && level !== 'beginner' ? 4 : 3;
  const { reps, restSeconds } = PRESCRIPTIONS[goal];

  const days: WorkoutDay[] = split.days.map((template) => {
    // No exercise twice in one day: with sparse equipment a variety-offset
    // slot can resolve to the same pick, in which case the slot is dropped.
    const used = new Set<string>();
    const dayExercises: WorkoutExercise[] = [];
    for (const slot of template.slots) {
      const exercise = pickExercise(slot, level, equipment, used);
      if (!exercise) continue;
      used.add(exercise.id);
      dayExercises.push({
        exerciseId: exercise.id,
        name: exercise.name,
        sets,
        reps,
        restSeconds,
        notes: exercise.notes,
      });
    }
    return { title: template.title, exercises: dayExercises };
  });

  return { splitName: split.name, days, cardioNote: CARDIO_NOTES[goal] };
}

function pickExercise(
  slot: PatternSlot,
  level: TrainingLevel,
  equipment: Equipment,
  used: Set<string>,
) {
  const allowed = equipmentAccess[equipment];
  const candidates = exercises.filter(
    (exercise) =>
      exercise.pattern === slot.pattern &&
      allowed.includes(exercise.equipment) &&
      levelAllows(level, exercise.minLevel),
  );
  if (candidates.length === 0) return null;
  const start = (slot.offset ?? 0) % candidates.length;
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[(start + i) % candidates.length];
    if (!used.has(candidate.id)) return candidate;
  }
  return null;
}
