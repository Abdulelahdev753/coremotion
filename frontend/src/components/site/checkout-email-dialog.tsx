'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';

import { useLanguage } from '@/components/providers/language-provider';

/** Matches the backend's plausibility check — real validation is the mailbox. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type CheckoutEmailDialogProps = {
  open: boolean;
  /** True while the checkout link is being minted; locks the form. */
  busy: boolean;
  onCancel: () => void;
  onSubmit: (email: string) => void;
};

/**
 * Pre-checkout modal that captures the buyer's email so the backend can send
 * the purchased PDF after payment. Deliberately tiny: one field, inline
 * validation, Escape/backdrop to dismiss (disabled while redirecting).
 */
export function CheckoutEmailDialog({ open, busy, onCancel, onSubmit }: CheckoutEmailDialogProps) {
  const { t } = useLanguage();
  const p = t.pricing;
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  // Fresh field + focus each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setInvalid(false);
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setInvalid(true);
      inputRef.current?.focus();
      return;
    }
    onSubmit(value);
  };

  return (
    <div
      className="checkout-email__overlay"
      onClick={() => {
        if (!busy) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="checkout-email__panel"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={titleId} className="checkout-email__title">
          {p.emailTitle}
        </h3>
        <p className="checkout-email__subtitle">{p.emailSubtitle}</p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="checkout-email__label" htmlFor={`${titleId}-input`}>
            {p.emailLabel}
          </label>
          <input
            ref={inputRef}
            id={`${titleId}-input`}
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            className="checkout-email__input"
            placeholder={p.emailPlaceholder}
            value={email}
            disabled={busy}
            aria-invalid={invalid}
            onChange={(e) => {
              setEmail(e.target.value);
              if (invalid) setInvalid(false);
            }}
          />
          {invalid && (
            <p className="checkout-email__error" role="alert">
              {p.emailInvalid}
            </p>
          )}

          <div className="checkout-email__actions">
            <button
              type="button"
              className="checkout-email__btn checkout-email__btn--ghost"
              onClick={onCancel}
              disabled={busy}
            >
              {p.emailCancel}
            </button>
            <button
              type="submit"
              className="checkout-email__btn checkout-email__btn--primary"
              disabled={busy}
              aria-busy={busy}
            >
              {busy ? (
                <span className="tier-card__cta-spinner">
                  <Loader2 size={18} strokeWidth={3} aria-hidden="true" />
                  <span className="sr-only">{p.emailContinue}</span>
                </span>
              ) : (
                p.emailContinue
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
