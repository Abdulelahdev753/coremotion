/**
 * The three pricing tiers, matching the keys used by the pricing cards.
 *
 * Checkout no longer uses static StreamPay links: the backend mints a single-use
 * link per purchase (see `@/lib/checkout` → `POST /api/checkout/start`), which is
 * what ties a verified payment to one buyer and one signed PDF download.
 */
export type PricingTierId = 'basic' | 'pro' | 'elite';
