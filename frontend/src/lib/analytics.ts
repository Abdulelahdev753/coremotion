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

function track(event: string, params: GtagParams): void {
  try {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('event', event, params);
  } catch {
    // Never let analytics surface an error to the buyer.
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
