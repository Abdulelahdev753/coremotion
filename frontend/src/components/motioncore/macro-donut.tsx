'use client';

import { useLanguage } from '@/components/providers/language-provider';
import { formatNumber } from '@/lib/motioncore/format';
import type { DailyTargets } from '@/lib/motioncore/types';

// Circle radius chosen so the circumference is exactly 100 — segment
// percentages map 1:1 onto stroke-dasharray units.
const R = 15.9155;

/** Three-segment SVG donut of the daily macro split. No chart library —
 * three static arcs don't justify one. */
export function MacroDonut({ targets }: { targets: DailyTargets }) {
  const { t, locale } = useLanguage();
  const td = t.motioncore.dashboard;

  const kcalFromMacros =
    targets.proteinG * 4 + targets.carbsG * 4 + targets.fatG * 9;
  const segments = [
    {
      key: 'protein',
      label: td.targets.protein,
      grams: targets.proteinG,
      pct: ((targets.proteinG * 4) / kcalFromMacros) * 100,
      color: '#d6ec1b',
    },
    {
      key: 'carbs',
      label: td.targets.carbs,
      grams: targets.carbsG,
      pct: ((targets.carbsG * 4) / kcalFromMacros) * 100,
      color: 'rgba(255,255,255,0.65)',
    },
    {
      key: 'fat',
      label: td.targets.fat,
      grams: targets.fatG,
      pct: ((targets.fatG * 9) / kcalFromMacros) * 100,
      color: 'rgba(255,255,255,0.28)',
    },
  ];

  let cumulative = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 36 36" className="size-36 shrink-0" role="img" aria-label={td.macrosTitle}>
        <circle cx="18" cy="18" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.8" />
        {segments.map((segment) => {
          const offset = cumulative;
          cumulative += segment.pct;
          return (
            <circle
              key={segment.key}
              cx="18"
              cy="18"
              r={R}
              fill="none"
              stroke={segment.color}
              strokeWidth="3.8"
              strokeDasharray={`${segment.pct} ${100 - segment.pct}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 18 18)"
              strokeLinecap="butt"
            />
          );
        })}
        <text
          x="18"
          y="17.2"
          textAnchor="middle"
          className="fill-white font-mono"
          fontSize="6"
          fontWeight="700"
        >
          {formatNumber(targets.calories, locale)}
        </text>
        <text x="18" y="23" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="3">
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
            <span className="text-white/70">{segment.label}</span>
            <span className="ms-auto font-mono text-white">
              {formatNumber(segment.grams, locale)} {t.motioncore.units.g}
            </span>
            <span className="w-12 text-end font-mono text-xs text-white/40">
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
