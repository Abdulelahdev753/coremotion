/**
 * Thin wrapper over the GA4 gtag.js tag loaded in the root layout.
 *
 * Every call here is best-effort and must never break the page: `gtag` is
 * absent whenever the tag is blocked (ad blockers stop a large share of
 * visitors), still loading, or running during SSG. All entry points therefore
 * swallow their own errors — an analytics failure must never take the checkout
 * flow down with it.
 */

type GtagParams = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Currency for every transaction — the StreamPay products are priced in SAR. */
export const CURRENCY = 'SAR';

/**
 * Tier prices in SAR, mirroring `backend/src/config/packages.ts` (the source of
 * truth, which is itself pinned to the live StreamPay products).
 *
 * Duplicated here only because `add_to_cart` fires on the "Buy now" click,
 * before any backend round-trip exists to supply the real figure. The two
 * server-confirmed events — begin_checkout and purchase — take their value from
 * the API response instead, so revenue reporting never depends on this map. If
 * prices change, update the backend catalogue and this map together.
 */
const TIER_PRICES_SAR: Record<string, number> = {
  basic: 39.99,
  pro: 49.99,
  elite: 59.99,
};

function track(event: string, params: GtagParams): void {
  try {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('event', event, params);
  } catch {
    // Never let analytics surface an error to the buyer.
  }
}

/**
 * Record which language version of the site the visitor is actually reading.
 *
 * GA4's built-in "Language" dimension reports the *browser* locale, which on a
 * bilingual Arabic-default site says nothing about whether someone read the
 * Arabic or the English page — a Saudi visitor on an English-configured phone
 * looks identical either way. This user property makes that split reportable,
 * so conversion can be compared between the two versions.
 */
export function setSiteLanguage(locale: string): void {
  try {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('set', 'user_properties', { site_language: locale });
  } catch {
    // Never let analytics surface an error to the visitor.
  }
}

/** One catalogue line item in the shape GA4 ecommerce reports expect. */
function toItem(packageKey: string, priceSar: number): GtagParams {
  // package_key is `<audience>-<tier>`, e.g. "men-elite".
  const [audience, tier] = packageKey.split('-');
  return {
    item_id: packageKey,
    item_name: `UltraFit ${tier ?? ''} — ${audience ?? ''}`.trim(),
    item_category: audience,
    item_variant: tier,
    price: priceSar,
    quantity: 1,
  };
}

/**
 * Buyer pressed "Buy now", before the email dialog opens. This is the only
 * signal for shoppers who see the email ask and back out — begin_checkout
 * fires after that dialog, so without this step the drop-off there is
 * invisible. Price comes from the local map since no backend call has happened
 * yet; treat it as funnel volume, not revenue.
 */
export function trackAddToCart(audience: string, tier: string): void {
  const price = TIER_PRICES_SAR[tier];
  if (typeof price !== 'number') return;
  const packageKey = `${audience}-${tier}`;
  track('add_to_cart', {
    currency: CURRENCY,
    value: price,
    items: [toItem(packageKey, price)],
  });
}

/**
 * Buyer confirmed their email and we're about to hand them to StreamPay.
 * Fired with the price the backend actually resolved, not the rounded figure
 * shown on the card, so funnel value matches revenue.
 */
export function trackBeginCheckout(packageKey: string, priceSar: number): void {
  track('begin_checkout', {
    currency: CURRENCY,
    value: priceSar,
    items: [toItem(packageKey, priceSar)],
  });
}

/**
 * Payment confirmed. De-duplicated per order because the success page is
 * reloadable and re-openable from the delivery email — without this guard a
 * refresh would double-count revenue. GA4 also de-dupes on transaction_id, but
 * only within a limited window, so we don't rely on it alone.
 */
export function trackPurchase(
  orderNumber: string,
  packageKey: string,
  priceSar: number,
): void {
  try {
    if (typeof window === 'undefined') return;
    const guardKey = `ga_purchase_sent:${orderNumber}`;
    // localStorage (not session) so a later revisit from the emailed link
    // doesn't re-report the same sale.
    if (window.localStorage.getItem(guardKey)) return;
    window.localStorage.setItem(guardKey, '1');
  } catch {
    // Private mode / storage disabled: fall through and still report once for
    // this page load. Over-reporting a blocked-storage edge case beats losing
    // the conversion entirely.
  }

  track('purchase', {
    transaction_id: orderNumber,
    currency: CURRENCY,
    value: priceSar,
    items: [toItem(packageKey, priceSar)],
  });
}
