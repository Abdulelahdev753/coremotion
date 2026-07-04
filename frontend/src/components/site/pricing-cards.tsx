'use client';

import { Check, Loader2 } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';

import { useLanguage } from '@/components/providers/language-provider';
import { CheckoutEmailDialog } from '@/components/site/checkout-email-dialog';
import type { PackageAudience } from '@/components/site/package-audience-pill';

/**
 * Visual + non-translatable config per tier. The copy (names, features, button
 * labels) lives in the i18n dictionary so the cards render in Arabic and English;
 * only the price, accent color and its rgb triple are fixed here.
 */
const tierStyles = [
  { key: 'basic', price: '39.99', color: '#d6ec1b', rgb: '214, 236, 27' },
  { key: 'pro', price: '49.99', color: '#fb923c', rgb: '251, 146, 60' },
  { key: 'elite', price: '59.99', color: '#a78bfa', rgb: '167, 139, 250' },
] as const;

type PlanId = (typeof tierStyles)[number]['key'];

type PricingCardsProps = {
  /**
   * Checkout hook. Fires with the tier id ('basic' | 'pro' | 'elite') and the
   * buyer's email (collected by the pre-checkout dialog — the PDF is emailed
   * there after payment). May be async (it kicks off a backend call to mint
   * the StreamPay link); the dialog keeps its spinner until the promise
   * settles and the browser navigates away.
   */
  onAddToCart?: (planId: PlanId, email: string) => void | Promise<void>;
  /**
   * Optional Men/Women selector, rendered centered directly above the cards.
   * The selector owns the audience state and drives the package sections.
   */
  selector?: ReactNode;
  /** Which audience's tier copy to render (the dictionary has one set each). */
  audience?: PackageAudience;
};

export function PricingCards({ onAddToCart, selector, audience = 'men' }: PricingCardsProps) {
  const { t } = useLanguage();
  const p = t.pricing;
  const tiers = p.tiers[audience];
  // Which tier is mid-redirect. The card stays mounted while the browser loads
  // the StreamPay page, so the spinner shows for the whole hand-off.
  const [loadingTier, setLoadingTier] = useState<PlanId | null>(null);
  // Tier whose "Buy now" was pressed — the email dialog is open while set.
  const [emailTier, setEmailTier] = useState<PlanId | null>(null);

  return (
    <section id="products" className="pricing-stage scroll-mt-28">
      <div className="pricing-stage__intro">
        <h2 className="pricing-stage__heading">{p.heading}</h2>
        <p className="pricing-stage__subheading">{p.subheading}</p>
      </div>

      {selector && <div className="pricing-stage__selector">{selector}</div>}

      <div className="tier-cards" aria-label={p.heading}>
        {tierStyles.map((style) => {
          const tier = tiers[style.key];
          return (
            <article
              key={style.key}
              className="tier-card glass-shell"
              style={
                {
                  '--tier-color': style.color,
                  '--tier-rgb': style.rgb,
                } as CSSProperties
              }
            >
              <header className="tier-card__header">
                <p className="tier-card__badge">{tier.badge}</p>
                <h3 className="tier-card__name">{tier.name}</h3>
                <p className="tier-card__price">
                  {style.price} <span>{p.currency}</span>
                </p>
                <p className="tier-card__tagline">{tier.tagline}</p>
              </header>

              <div className="tier-card__divider" aria-hidden="true" />

              <ul className="tier-card__features">
                {tier.includes && <li className="tier-card__includes">{tier.includes}</li>}
                {tier.features.map((feature) => (
                  <li key={feature} className="tier-card__feature">
                    <span className="tier-card__check" aria-hidden="true">
                      <Check size={14} strokeWidth={3.5} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <footer className="tier-card__footer">
                {tier.note && <p className="tier-card__note">{tier.note}</p>}
                <div className="tier-card__actions">
                  <button
                    type="button"
                    className="tier-card__cta tier-card__cta--add"
                    onClick={() => {
                      if (!onAddToCart || loadingTier) return;
                      // Ask for the buyer's email first; checkout starts on submit.
                      setEmailTier(style.key);
                    }}
                    disabled={loadingTier === style.key}
                    aria-busy={loadingTier === style.key}
                  >
                    {loadingTier === style.key ? (
                      <span className="tier-card__cta-spinner">
                        <Loader2 size={18} strokeWidth={3} aria-hidden="true" />
                        <span className="sr-only">{p.buyNow}</span>
                      </span>
                    ) : (
                      <span className="tier-card__cta-label">{p.buyNow}</span>
                    )}
                  </button>
                </div>
              </footer>
            </article>
          );
        })}
      </div>

      <CheckoutEmailDialog
        open={emailTier !== null}
        busy={loadingTier !== null}
        onCancel={() => {
          if (!loadingTier) setEmailTier(null);
        }}
        onSubmit={(email) => {
          if (!onAddToCart || !emailTier || loadingTier) return;
          const tier = emailTier;
          setLoadingTier(tier);
          // On success the browser navigates away (spinner persists);
          // on failure, re-enable the dialog so the buyer can retry.
          Promise.resolve(onAddToCart(tier, email)).catch((err) => {
            console.error('Checkout failed:', err);
            setLoadingTier(null);
          });
        }}
      />
    </section>
  );
}
