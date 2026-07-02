import type { PackageAudience } from '@/components/site/package-audience-pill';
import type { PricingTierId } from '@/lib/payment-links';

/**
 * Base URL for the Express API. Empty by default so calls are same-origin in
 * production (the backend serves the static export). Set NEXT_PUBLIC_API_URL
 * during local dev when the frontend dev server and backend run on different ports.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * Ask the backend to mint a single-use StreamPay checkout link for the chosen
 * package and return its hosted-checkout URL. The caller redirects the buyer to
 * it; after payment StreamPay sends them back to our /api/checkout/return.
 */
export async function startCheckout(
  audience: PackageAudience,
  tier: PricingTierId,
): Promise<string> {
  const res = await fetch(`${API_BASE}/api/checkout/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audience, tier }),
  });
  if (!res.ok) {
    throw new Error(`Failed to start checkout (${res.status})`);
  }
  const data = (await res.json()) as { url?: string };
  if (!data.url) {
    throw new Error('Checkout did not return a URL');
  }
  return data.url;
}
