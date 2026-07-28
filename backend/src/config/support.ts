/**
 * Customer service contact, mirroring `frontend/src/lib/site-links.ts`.
 *
 * Duplicated rather than shared because the two packages have no common module,
 * and the backend only needs it for the handful of buyer-facing plain responses
 * that can't reach the site's own support UI. If the number changes, update
 * both files together.
 */

/** International format, digits only — the shape wa.me requires. */
export const WHATSAPP_NUMBER = '966511020667';

export const WHATSAPP_DISPLAY_NUMBER = '+966 51 102 0667';

/** Click-to-chat link, optionally prefilling the buyer's opening message. */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
