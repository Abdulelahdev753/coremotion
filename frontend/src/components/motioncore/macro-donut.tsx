'use client';

import { useLanguage } from '@/components/providers/language-provider';
import { formatNumber } from '@/lib/motioncore/format';
import type { DailyTargets } from '@/lib/motioncore/types';

const R = 15.9155;

// Segment percentages map 1:1 onto stroke-dasharray units, which takes two
// things. `pathLength` pins the ring to exactly 100 units: a browser draws a
// circle as Bézier arcs measuring ~0.6% short of 2πr, and without the pin every
// segment ran long and the last wrapped over the first.
const PATH_LENGTH = 100;

// The second is that the ring is a <path> of two half-circle arcs rather than a
// <circle>. A <circle> is a *closed* subpath, and the last segment's dash ends
// exactly on its closing point — so the renderer joins that end back to the
// path's start and mitres the corner, spiking yellow over red at 12 o'clock.
// Whether the dash lands on the closure or a hair before it comes down to
// floating-point luck, so the same code drew a clean seam locally and a spiked
// one in production. This path is open: both ends take a butt cap and there is
// no corner to mitre. It starts at 12 o'clock and sweeps clockwise, so it also
// replaces the -90° rotation the circles needed. The two arcs meet at 6
// o'clock, where their tangents are colinear and the join is invisible.
const RING = `M 18 ${18 - R} a ${R} ${R} 0 0 1 0 ${R * 2} a ${R} ${R} 0 0 1 0 ${-R * 2}`;

/** Three-segment SVG donut of the daily macro split. No chart library —
 * three static arcs don't justify one. */
export function MacroDonut({ targets }: { targets: DailyTargets }) {
  const { t, locale } = useLanguage();
  const td = t.motioncore.dashboard;

  const kcalFromMacros =
    targets.proteinG * 4 + targets.carbsG * 4 + targets.fatG * 9;
  // The three colours are meaning-carrying and fixed: protein red, carbs blue,
  // fat yellow — the same convention nutrition apps use, so the split reads at
  // a glance without consulting the legend.
  const segments = [
    {
      key: 'protein',
      label: td.targets.protein,
      grams: targets.proteinG,
      pct: ((targets.proteinG * 4) / kcalFromMacros) * 100,
      color: '#dc2626',
    },
    {
      key: 'carbs',
      label: td.targets.carbs,
      grams: targets.carbsG,
      pct: ((targets.carbsG * 4) / kcalFromMacros) * 100,
      color: '#2563eb',
    },
    {
      key: 'fat',
      label: td.targets.fat,
      grams: targets.fatG,
      pct: ((targets.fatG * 9) / kcalFromMacros) * 100,
      color: '#eab308',
    },
  ];

  let cumulative = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 36 36" className="size-36 shrink-0" role="img" aria-label={td.macrosTitle}>
        <circle cx="18" cy="18" r={R} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="3.8" />
        {segments.map((segment) => {
          const offset = cumulative;
          cumulative += segment.pct;
          return (
            <path
              key={segment.key}
              d={RING}
              pathLength={PATH_LENGTH}
              fill="none"
              stroke={segment.color}
              strokeWidth="3.8"
              strokeDasharray={`${segment.pct} ${100 - segment.pct}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
        })}
        <text
          x="18"
          y="17.2"
          textAnchor="middle"
          className="fill-[#0a0b0d] font-mono"
          fontSize="6"
          fontWeight="700"
        >
          {formatNumber(targets.calories, locale)}
        </text>
        <text x="18" y="23" textAnchor="middle" fill="rgba(10,11,13,0.45)" fontSize="3">
          {t.motioncore.units.kcal}
        </text>
      </svg>

      <ul className="flex flex-1 flex-col gap-3">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2.5 text-sm">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-black/70">{segment.label}</span>
            <span className="ms-auto font-mono text-black">
              {formatNumber(segment.grams, locale)} {t.motioncore.units.g}
            </span>
            <span className="w-12 text-end font-mono text-xs text-black/40">
              {formatNumber(segment.pct / 100, locale, {
                style: 'percent',
                maximumFractionDigits: 0,
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
