'use client';

import { Check, Download, Gift, Infinity as InfinityIcon, Headset, Loader2, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useState, type CSSProperties, type ReactNode } from 'react';

import { useLanguage } from '@/components/providers/language-provider';
import { CheckoutEmailDialog } from '@/components/site/checkout-email-dialog';
import type { PackageAudience } from '@/components/site/package-audience-pill';
import { trackAddToCart } from '@/lib/analytics';

/**
 * Visual + non-translatable config per tier. The copy (names, features, button
 * labels) lives in the i18n dictionary so the cards render in Arabic and English;
 * only the prices, accent color and its rgb triple are fixed here. `wasPrice` is
 * the pre-discount price shown struck through next to the live one.
 */
const tierStyles = [
  { key: 'basic', price: '39', wasPrice: '59', color: '#16924e', rgb: '22, 146, 78' },
  { key: 'pro', price: '49', wasPrice: '69', color: '#16924e', rgb: '22, 146, 78' },
  { key: 'elite', price: '59', wasPrice: '79', color: '#16924e', rgb: '22, 146, 78' },
] as const;

type PlanId = (typeof tierStyles)[number]['key'];

/** Icons for the trust bar, in the same order as the dictionary's `trust` copy. */
const trustIcons = [ShieldCheck, Download, InfinityIcon, Headset] as const;

// GitHub Pages serves the site from /<repo>; next/image does not apply basePath
// to unoptimized images, so plain <img> sources are prefixed by hand.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

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

      <div className="pricing-promo">
        <p className="pricing-promo__eyebrow">
          <span className="pricing-promo__dash" aria-hidden="true" />
          {p.promo[audience].eyebrow}
          <span className="pricing-promo__dash" aria-hidden="true" />
        </p>
        <h3 className="pricing-promo__heading">{p.promo[audience].heading}</h3>
        <p className="pricing-promo__subheading">{p.promo[audience].subheading}</p>
      </div>

      {/* Gym-only notice: sits between the promo header and the cards so buyers
          read it before picking a tier. */}
      <p className="pricing-note">
        <strong className="pricing-note__label">{p.note.label}:</strong> {p.note.text}
      </p>

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
              <span className={`tier-card__audience tier-card__audience--${audience}`}>
                {audience === 'men' ? t.packages.men : t.packages.women}
              </span>

              <header className="tier-card__header">
                <p className="tier-card__badge">{tier.badge}</p>
                <h3 className="tier-card__name">{tier.name}</h3>
                <div className="tier-card__pricing">
                  <p className="tier-card__price">
                    {style.price} <span>{p.currency}</span>
                  </p>
                  <p className="tier-card__was">
                    {/* Strike only the number so the currency stays legible. */}
                    <span className="tier-card__was-price">
                      <s>{style.wasPrice}</s>
                      <span>{p.currency}</span>
                    </span>
                    <span className="tier-card__was-note">{p.discountNote}</span>
                  </p>
                </div>
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
                {/* Free bonus, identical across tiers and audiences. Gold on
                    purpose so it reads as a gift, not as another tier feature. */}
                <li className="tier-card__gift">
                  <span className="tier-card__gift-icon" aria-hidden="true">
                    <Gift size={24} strokeWidth={2.25} />
                  </span>
                  <span className="tier-card__gift-text">{p.gift.text}</span>
                  <span className="tier-card__gift-label">{p.gift.label}</span>
                </li>
              </ul>

              <footer className="tier-card__footer">
                {tier.note && <p className="tier-card__note">{tier.note}</p>}
                <div className="tier-card__actions">
                  <button
                    type="button"
                    className="tier-card__cta tier-card__cta--add"
                    onClick={() => {
                      if (!onAddToCart || loadingTier) return;
                      // Record the intent before the dialog opens, so shoppers
                      // who abandon at the email ask are still counted.
                      trackAddToCart(audience, style.key);
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

      <ul className="pricing-trust" aria-label={p.heading}>
        {p.trust.map((item, i) => {
          const Icon = trustIcons[i] ?? ShieldCheck;
          return (
            <li key={item.title} className="pricing-trust__item">
              <span className="pricing-trust__icon" aria-hidden="true">
                <Icon size={26} strokeWidth={2} />
              </span>
              <div className="pricing-trust__text">
                <p className="pricing-trust__title">{item.title}</p>
                <p className="pricing-trust__desc">{item.description}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Charity note: Ehsan platform logo plus the donation pledge. */}
      <div className="pricing-charity">
        <Image
          className="pricing-charity__logo"
          src={`${basePath}/logos/ehsan.svg`}
          alt={p.charity.logoAlt}
          width={500}
          height={581}
        />
        <p className="pricing-charity__text">
          {p.charity.before}
          <strong>{p.charity.platform}</strong>
          {p.charity.after}
        </p>
      </div>

      {/* Mounted only while open, so the email field resets on every open. */}
      {emailTier !== null && (
        <CheckoutEmailDialog
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
      )}
    </section>
  );
}
