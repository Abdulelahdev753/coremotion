'use client';

import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Labelled group wrapper for a set of cards, chips or inputs. */
export function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div role="group" aria-label={label}>
      <p className="text-sm font-semibold text-white/85">
        {label}
        {hint ? <span className="ms-2 text-xs font-normal text-white/40">{hint}</span> : null}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** A large selectable card acting as a radio option. */
export function OptionCard({
  selected,
  onSelect,
  label,
  description,
  badge,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  description?: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'group relative w-full rounded-2xl border p-4 text-start transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70',
        selected
          ? 'border-brand/60 bg-brand/10 shadow-[0_0_28px_-12px_#d6ec1b]'
          : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.08]',
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className={cn('block text-sm font-semibold', selected ? 'text-brand' : 'text-white')}>
            {label}
          </span>
          {description ? (
            <span className="mt-1 block text-xs leading-relaxed text-white/55 rtl:leading-relaxed">
              {description}
            </span>
          ) : null}
        </span>
        <span
          aria-hidden
          className={cn(
            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
            selected ? 'border-brand bg-brand text-black' : 'border-white/25 text-transparent',
          )}
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      </span>
      {badge ? (
        <span
          className={cn(
            'mt-3 inline-block rounded-full px-2.5 py-1 font-mono text-xs',
            selected ? 'bg-brand/20 text-brand' : 'bg-white/10 text-white/60',
          )}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

/** A pill toggle for optional multi-select choices. */
export function ChipToggle({
  selected,
  onToggle,
  label,
}: {
  selected: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70',
        selected
          ? 'border-brand/60 bg-brand/15 text-brand'
          : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white',
      )}
    >
      {label}
    </button>
  );
}

/** Numeric input with a unit suffix; digits stay LTR under Arabic. */
export function NumberField({
  id,
  label,
  unit,
  value,
  onChange,
  error,
  inputMode = 'numeric',
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  inputMode?: 'numeric' | 'decimal';
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-white/85">
        {label}
      </label>
      <div
        className={cn(
          'mt-2 flex h-12 items-center overflow-hidden rounded-xl border bg-white/5 transition-colors focus-within:ring-2 focus-within:ring-brand/70',
          error ? 'border-red-400/60' : 'border-white/10 focus-within:border-brand/50',
        )}
      >
        <input
          id={id}
          dir="ltr"
          inputMode={inputMode}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-full w-full bg-transparent px-4 font-mono text-base text-white outline-none placeholder:text-white/30"
        />
        <span className="pe-4 text-sm text-white/40">{unit}</span>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
