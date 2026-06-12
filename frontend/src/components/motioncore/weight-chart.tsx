'use client';

import { useLanguage } from '@/components/providers/language-provider';
import { formatDate, formatNumber } from '@/lib/motioncore/format';
import type { WeightEntry } from '@/lib/motioncore/types';

const W = 600;
const H = 200;
const PAD_X = 14;
const PAD_Y = 24;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Hand-rolled SVG trend chart: actual weigh-ins as a lime line, the plan's
 * expected trajectory as a dashed overlay. Needs >= 2 entries (the parent
 * renders a placeholder otherwise).
 */
export function WeightChart({
  entries,
  expectedKgPerWeek,
}: {
  entries: WeightEntry[];
  expectedKgPerWeek: number;
}) {
  const { t, locale } = useLanguage();

  const points = entries.map((entry) => ({
    time: new Date(`${entry.date}T00:00:00`).getTime(),
    kg: entry.weightKg,
  }));
  const minTime = points[0].time;
  const maxTime = points[points.length - 1].time;
  const spanMs = Math.max(maxTime - minTime, DAY_MS);

  // Expected trajectory from the first weigh-in to the end of the window.
  const expectedEndKg = points[0].kg + (expectedKgPerWeek * (spanMs / DAY_MS)) / 7;

  const kgValues = [...points.map((point) => point.kg), expectedEndKg];
  const minKg = Math.min(...kgValues) - 0.5;
  const maxKg = Math.max(...kgValues) + 0.5;

  const x = (time: number) => PAD_X + ((time - minTime) / spanMs) * (W - PAD_X * 2);
  const y = (kg: number) => PAD_Y + ((maxKg - kg) / (maxKg - minKg)) * (H - PAD_Y * 2);

  const actualPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${x(point.time).toFixed(1)},${y(point.kg).toFixed(1)}`)
    .join(' ');
  const last = points[points.length - 1];

  return (
    // Time axes read left-to-right even in Arabic (same convention as the
    // hero marquee), so the chart container is pinned to LTR.
    <div dir="ltr" style={{ direction: 'ltr' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={t.motioncore.dashboard.weight.title}
      >
        {/* Horizontal gridlines */}
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={PAD_Y + fraction * (H - PAD_Y * 2)}
            y2={PAD_Y + fraction * (H - PAD_Y * 2)}
            stroke="rgba(255,255,255,0.06)"
          />
        ))}

        {/* Expected trajectory */}
        <line
          x1={x(minTime)}
          y1={y(points[0].kg)}
          x2={x(maxTime)}
          y2={y(expectedEndKg)}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />

        {/* Actual weigh-ins */}
        <path d={actualPath} fill="none" stroke="#d6ec1b" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((point) => (
          <circle key={point.time} cx={x(point.time)} cy={y(point.kg)} r="3" fill="#0a0b0d" stroke="#d6ec1b" strokeWidth="2" />
        ))}

        {/* Latest weight callout */}
        <circle cx={x(last.time)} cy={y(last.kg)} r="5" fill="none" stroke="#d6ec1b" strokeOpacity="0.4" strokeWidth="2" />
        <text
          x={x(last.time)}
          y={y(last.kg) - 10}
          textAnchor="end"
          className="fill-white font-mono"
          fontSize="12"
          fontWeight="600"
        >
          {formatNumber(last.kg, locale, { maximumFractionDigits: 1 })} {t.motioncore.units.kg}
        </text>

        {/* Axis date labels */}
        <text x={PAD_X} y={H - 6} fill="rgba(255,255,255,0.4)" fontSize="11">
          {formatDate(entries[0].date, locale)}
        </text>
        <text x={W - PAD_X} y={H - 6} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="11">
          {formatDate(entries[entries.length - 1].date, locale)}
        </text>
      </svg>

      <div className="mt-2 flex items-center gap-4 text-xs text-white/45" dir="auto">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-0.5 w-5 rounded bg-brand" />
          {t.motioncore.dashboard.weight.latest}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-0 w-5 border-t-2 border-dashed border-white/35" />
          {t.motioncore.dashboard.weight.expectedTrend}
        </span>
      </div>
    </div>
  );
}
