/**
 * Canonical catalogue of the six UltraFit packages — the single source of truth
 * that ties together the public audience/tier the frontend speaks, the StreamPay
 * product that gets charged, and the private Supabase bucket the PDF lives in.
 *
 * Keep this in sync with StreamPay (product IDs) and Supabase Storage (buckets).
 * Each bucket holds exactly one object named `<bucket>.pdf`.
 */

export type Audience = 'men' | 'women';
export type Tier = 'basic' | 'pro' | 'elite';

/** Stable key used in order rows and checkout tokens, e.g. `men-basic`. */
export type PackageKey = `${Audience}-${Tier}`;

export type PackageConfig = {
  key: PackageKey;
  audience: Audience;
  tier: Tier;
  /** StreamPay ONE_OFF product charged by the per-purchase link. */
  productId: string;
  /** Private Supabase Storage bucket holding this package's PDF. */
  bucket: string;
  /** Object path inside the bucket (one PDF per bucket). */
  object: string;
  /** Price in SAR (VAT-exempt), matches the StreamPay product price. */
  priceSar: number;
  /** Human label used in the StreamPay link name. */
  label: string;
};

function pkg(
  audience: Audience,
  tier: Tier,
  productId: string,
  priceSar: number,
): PackageConfig {
  // Frontend speaks men/women; buckets + StreamPay products use male/female.
  const sex = audience === 'men' ? 'male' : 'female';
  const bucket = `ultrafit-${sex}-${tier}`;
  const titleAudience = audience === 'men' ? 'Men' : 'Women';
  const titleTier = tier.charAt(0).toUpperCase() + tier.slice(1);
  return {
    key: `${audience}-${tier}`,
    audience,
    tier,
    productId,
    bucket,
    object: `${bucket}.pdf`,
    priceSar,
    label: `UltraFit ${titleTier} — ${titleAudience}`,
  };
}

// Product IDs belong to the StreamPay organization tied to the backend's REST
// API key (the live UltraFit "ultrafitprod" account that owns the webhook,
// org eb8b5ca2). Verified live: ONE_OFF, SAR, VAT-exempt, priced 39.99/49.99/
// 59.99. If products are recreated, refresh these IDs and prices together.
export const PACKAGES: Record<PackageKey, PackageConfig> = {
  'men-basic': pkg('men', 'basic', '6043b68a-36f8-407b-9ebf-adac7fcc8132', 39.99),
  'men-pro': pkg('men', 'pro', '6f6b5269-d4d5-4077-bb7f-f0a0dae5300b', 49.99),
  'men-elite': pkg('men', 'elite', 'd154c568-0e99-4ab4-87f6-c4adf4c0c8b9', 59.99),
  'women-basic': pkg('women', 'basic', 'bc17bb64-02fc-42b7-8ffa-a280122587a4', 39.99),
  'women-pro': pkg('women', 'pro', '6dda1606-9cbd-40f7-8a8e-716e0fa3f2ae', 49.99),
  'women-elite': pkg('women', 'elite', 'e0ddb9c9-d201-40ef-beb9-4ad6f8aa8ea2', 59.99),
};

const AUDIENCES: readonly Audience[] = ['men', 'women'];
const TIERS: readonly Tier[] = ['basic', 'pro', 'elite'];

export function isAudience(value: unknown): value is Audience {
  return typeof value === 'string' && (AUDIENCES as readonly string[]).includes(value);
}

export function isTier(value: unknown): value is Tier {
  return typeof value === 'string' && (TIERS as readonly string[]).includes(value);
}

/** Resolve a package from a raw audience/tier pair, or null if invalid. */
export function resolvePackage(audience: unknown, tier: unknown): PackageConfig | null {
  if (!isAudience(audience) || !isTier(tier)) return null;
  return PACKAGES[`${audience}-${tier}`];
}

/** Reverse lookup from a StreamPay product id (used by the webhook as a fallback). */
export function packageByProductId(productId: string): PackageConfig | undefined {
  return Object.values(PACKAGES).find((p) => p.productId === productId);
}
