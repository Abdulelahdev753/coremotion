import { KCAL_PER_KG_PER_WEEK } from './engine';
import type { WeightEntry } from './types';

export type TrendAnalysis = {
  actualKgPerWeek: number;
  suggestedKcalDelta: number;
  status: 'onTrack' | 'tooFast' | 'tooSlow';
};

const WINDOW_DAYS = 14;
const MIN_ENTRIES = 4;
const MIN_SPAN_DAYS = 10;
/** Weekly rates within this band of the expected rate count as on track. */
const TOLERANCE_KG_PER_WEEK = 0.15;
const MAX_SUGGESTION_KCAL = 250;

/**
 * Compares the recent weigh-in trend against the plan's expected rate.
 * Returns null until there are at least 4 entries spanning 10+ days within
 * the last 14 days — shorter windows are noise, not trend.
 */
export function analyzeWeightTrend(
  entries: WeightEntry[],
  expectedKgPerWeek: number,
): TrendAnalysis | null {
  const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recent = entries
    .map((entry) => ({ time: new Date(`${entry.date}T00:00:00`).getTime(), kg: entry.weightKg }))
    .filter((point) => Number.isFinite(point.time) && point.time >= cutoff)
    .sort((a, b) => a.time - b.time);

  if (recent.length < MIN_ENTRIES) return null;
  const spanDays = (recent[recent.length - 1].time - recent[0].time) / (24 * 60 * 60 * 1000);
  if (spanDays < MIN_SPAN_DAYS) return null;

  // Least-squares slope over (day index, weight) → kg/day.
  const points = recent.map((point) => ({
    x: (point.time - recent[0].time) / (24 * 60 * 60 * 1000),
    y: point.kg,
  }));
  const n = points.length;
  const meanX = points.reduce((sum, p) => sum + p.x, 0) / n;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / n;
  const denominator = points.reduce((sum, p) => sum + (p.x - meanX) ** 2, 0);
  if (denominator === 0) return null;
  const slopePerDay =
    points.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0) / denominator;
  const actualKgPerWeek = Math.round(slopePerDay * 7 * 100) / 100;

  const gap = expectedKgPerWeek - actualKgPerWeek;
  if (Math.abs(gap) <= TOLERANCE_KG_PER_WEEK) {
    return { actualKgPerWeek, suggestedKcalDelta: 0, status: 'onTrack' };
  }

  // Negative delta = eat less (progress slower than expected), rounded to
  // 50 kcal steps and capped — this is a hint, not an automatic change.
  const rawDelta = gap * KCAL_PER_KG_PER_WEEK;
  const suggestedKcalDelta = Math.max(
    -MAX_SUGGESTION_KCAL,
    Math.min(MAX_SUGGESTION_KCAL, Math.round(rawDelta / 50) * 50),
  );

  // "Too fast" means the weight is moving beyond the planned rate in the
  // goal's own direction (losing quicker on a cut, gaining quicker on a
  // bulk). At maintenance (expected 0) any drift is faster than planned.
  const direction = Math.sign(expectedKgPerWeek);
  const tooFast = direction === 0 || (actualKgPerWeek - expectedKgPerWeek) * direction > 0;

  return {
    actualKgPerWeek,
    suggestedKcalDelta,
    status: tooFast ? 'tooFast' : 'tooSlow',
  };
}
