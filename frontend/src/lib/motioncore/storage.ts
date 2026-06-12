import type { AssessmentInput, WeightEntry } from './types';

const PROFILE_KEY = 'motioncore.profile.v1';
const WEIGHT_LOG_KEY = 'motioncore.weightlog.v1';

export type StoredProfile = {
  version: 1;
  assessment: AssessmentInput;
  createdAt: string;
  updatedAt: string;
};

type StoredWeightLog = {
  version: 1;
  entries: WeightEntry[];
};

// When localStorage is unavailable (private mode), shadow it in memory so the
// flow keeps working for the session. Unlike the locale (a 2-byte cookie read
// at first paint), the profile and weight log are too large for a cookie
// fallback to be worth sending to GitHub Pages on every request.
const memoryStore = new Map<string, string>();

function readRaw(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key) ?? memoryStore.get(key) ?? null;
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

function writeRaw(key: string, value: string) {
  memoryStore.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode — the in-memory copy carries the session */
  }
}

function removeRaw(key: string) {
  memoryStore.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

// Shape guards: corrupt or outdated storage must read as "nothing saved",
// never crash the dashboard.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const SEXES = ['male', 'female'];
const ACTIVITIES = ['sedentary', 'light', 'moderate', 'very', 'athlete'];
const GOALS = ['fatLoss', 'muscleGain', 'fitness'];
const PACES = ['gentle', 'standard', 'aggressive'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const EQUIPMENT = ['none', 'dumbbells', 'gym'];
const EXCLUSIONS = ['dairy', 'eggs', 'nuts', 'gluten', 'seafood'];

function isAssessmentInput(value: unknown): value is AssessmentInput {
  if (!isRecord(value)) return false;
  return (
    SEXES.includes(value.sex as string) &&
    typeof value.age === 'number' &&
    typeof value.heightCm === 'number' &&
    typeof value.weightKg === 'number' &&
    ACTIVITIES.includes(value.activity as string) &&
    LEVELS.includes(value.trainingLevel as string) &&
    GOALS.includes(value.goal as string) &&
    PACES.includes(value.pace as string) &&
    EQUIPMENT.includes(value.equipment as string) &&
    [3, 4, 5].includes(value.daysPerWeek as number) &&
    Array.isArray(value.exclusions) &&
    value.exclusions.every((item) => EXCLUSIONS.includes(item as string))
  );
}

function isWeightEntry(value: unknown): value is WeightEntry {
  return (
    isRecord(value) &&
    typeof value.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
    typeof value.weightKg === 'number' &&
    Number.isFinite(value.weightKg)
  );
}

function parseJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadProfile(): StoredProfile | null {
  const parsed = parseJson(readRaw(PROFILE_KEY));
  if (
    isRecord(parsed) &&
    parsed.version === 1 &&
    isAssessmentInput(parsed.assessment) &&
    typeof parsed.createdAt === 'string' &&
    typeof parsed.updatedAt === 'string'
  ) {
    return parsed as StoredProfile;
  }
  return null;
}

export function saveProfile(assessment: AssessmentInput): StoredProfile {
  const now = new Date().toISOString();
  const profile: StoredProfile = {
    version: 1,
    assessment,
    createdAt: loadProfile()?.createdAt ?? now,
    updatedAt: now,
  };
  writeRaw(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function clearProfile() {
  removeRaw(PROFILE_KEY);
}

export function loadWeightLog(): WeightEntry[] {
  const parsed = parseJson(readRaw(WEIGHT_LOG_KEY));
  if (isRecord(parsed) && parsed.version === 1 && Array.isArray(parsed.entries)) {
    return parsed.entries.filter(isWeightEntry);
  }
  return [];
}

/** Upserts by date (one weigh-in per day), keeps the log sorted, persists. */
export function addWeightEntry(entry: WeightEntry): WeightEntry[] {
  const entries = [
    ...loadWeightLog().filter((existing) => existing.date !== entry.date),
    entry,
  ].sort((a, b) => a.date.localeCompare(b.date));
  const log: StoredWeightLog = { version: 1, entries };
  writeRaw(WEIGHT_LOG_KEY, JSON.stringify(log));
  return entries;
}
