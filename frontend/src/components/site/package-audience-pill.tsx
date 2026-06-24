'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export type PackageAudience = 'men' | 'women';

/**
 * Per-audience glow theme. Kept as a design constant (not translatable): the
 * active pill glows lime for Men and pink for Women. `rgb` is space-separated so
 * it can feed the modern `rgb(var(--active-rgb) / <alpha>)` shadow syntax below.
 */
const AUDIENCE_THEME: Record<PackageAudience, { color: string; rgb: string }> = {
  men: { color: '#cadf1a', rgb: '202 223 26' },
  women: { color: '#FC449A', rgb: '252 68 154' },
};

/** Render order of the segments, left → right (the flow flips under RTL). */
const ORDER: readonly PackageAudience[] = ['men', 'women'];

// useLayoutEffect warns during the static-export prerender; fall back to
// useEffect on the server so we still measure synchronously in the browser.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

type PackageAudiencePillProps = {
  value: PackageAudience;
  onValueChange: (value: PackageAudience) => void;
  /** Localized segment labels, e.g. { men: 'Men', women: 'Women' }. */
  labels: Record<PackageAudience, string>;
  /** Localized group label for assistive tech. */
  ariaLabel?: string;
  className?: string;
};

export function PackageAudiencePill({
  value,
  onValueChange,
  labels,
  ariaLabel = 'Choose package audience',
  className,
}: PackageAudiencePillProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const itemRefs = React.useRef<Record<PackageAudience, HTMLButtonElement | null>>({
    men: null,
    women: null,
  });

  const activeTheme = AUDIENCE_THEME[value];

  const [pill, setPill] = React.useState({ x: 4, width: 0, height: 0 });

  const updatePill = React.useCallback(() => {
    const container = containerRef.current;
    const activeItem = itemRefs.current[value];

    if (!container || !activeItem) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    setPill({
      // left-based offset works in both LTR and RTL: it tracks the active
      // button's real position relative to the container's left edge.
      x: itemRect.left - containerRect.left,
      width: itemRect.width,
      height: itemRect.height,
    });
  }, [value]);

  useIsomorphicLayoutEffect(() => {
    updatePill();

    const resizeObserver = new ResizeObserver(updatePill);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    window.addEventListener('resize', updatePill);

    // Re-measure once webfonts swap in, since label width changes the pill size.
    document.fonts?.ready.then(updatePill);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePill);
    };
  }, [updatePill]);

  return (
    <div className={cn('flex w-full justify-center', className)}>
      <div
        ref={containerRef}
        role="group"
        aria-label={ariaLabel}
        className="relative isolate inline-flex items-center rounded-full border border-slate-200/60 bg-[#050609] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.72),0_0_0_1px_rgba(255,255,255,0.08),0_18px_40px_rgba(0,0,0,0.34)]"
        style={
          {
            '--pill-x': `${pill.x}px`,
            '--pill-width': `${pill.width}px`,
            '--pill-height': `${pill.height}px`,
            '--active-color': activeTheme.color,
            '--active-rgb': activeTheme.rgb,
          } as React.CSSProperties
        }
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-1/2 z-0 rounded-full bg-[var(--active-color)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.18),0_0_20px_rgb(var(--active-rgb)/0.92),0_0_38px_rgb(var(--active-rgb)/0.52),0_10px_22px_rgb(var(--active-rgb)/0.28)] transition-[width,height,transform] duration-500 ease-out"
          style={{
            width: 'var(--pill-width)',
            height: 'var(--pill-height)',
            transform: 'translate3d(var(--pill-x), -50%, 0)',
          }}
        />

        {ORDER.map((audience) => {
          const isActive = audience === value;

          return (
            <button
              key={audience}
              ref={(node) => {
                itemRefs.current[audience] = node;
              }}
              type="button"
              aria-pressed={isActive}
              onClick={() => onValueChange(audience)}
              className={cn(
                'relative z-10 min-h-[42px] min-w-24 rounded-full px-6 py-2.5 text-sm font-black tracking-normal transition-colors duration-200',
                isActive ? 'text-[#05080c]' : 'text-white/90 hover:text-white',
              )}
            >
              {labels[audience]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
