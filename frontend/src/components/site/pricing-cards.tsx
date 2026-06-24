'use client';

import { Check } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import { useLanguage } from '@/components/providers/language-provider';

/**
 * Visual + non-translatable config per tier. The copy (names, features, button
 * labels) lives in the i18n dictionary so the cards render in Arabic and English;
 * only the price, accent color and its rgb triple are fixed here.
 */
const tierStyles = [
  { key: 'basic', price: '39', color: '#d6ec1b', rgb: '214, 236, 27' },
  { key: 'pro', price: '49', color: '#fb923c', rgb: '251, 146, 60' },
  { key: 'elite', price: '59', color: '#a78bfa', rgb: '167, 139, 250' },
] as const;

type PlanId = (typeof tierStyles)[number]['key'];

type PricingCardsProps = {
  /**
   * Cart hook. Fires with the tier id ('basic' | 'pro' | 'elite') when a card's
   * "Add to cart" button is pressed. There is no cart flow in the app yet, so
   * this is the seam to wire one into.
   */
  onAddToCart?: (planId: PlanId) => void;
  /**
   * Optional Men/Women selector, rendered centered directly above the cards.
   * The selector owns the audience state and drives the package sections.
   */
  selector?: ReactNode;
};

export function PricingCards({ onAddToCart, selector }: PricingCardsProps) {
  const { t } = useLanguage();
  const p = t.pricing;

  return (
    <section id="products" className="pricing-stage scroll-mt-28">
      <div className="pricing-stage__intro">
        <h2 className="pricing-stage__heading">{p.heading}</h2>
        <p className="pricing-stage__subheading">{p.subheading}</p>
      </div>

      {selector && <div className="pricing-stage__selector">{selector}</div>}

      <div className="tier-cards" aria-label={p.heading}>
        {tierStyles.map((style) => {
          const tier = p.tiers[style.key];
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
                    onClick={() => onAddToCart?.(style.key)}
                  >
                    <span className="tier-card__cta-label">{p.addToCart}</span>
                  </button>
                </div>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
