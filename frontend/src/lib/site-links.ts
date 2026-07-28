/**
 * External contact/social destinations, shared by the footer, the FAQ closing
 * nudge, the floating support button, the checkout result pages, and anywhere
 * else that links off-site.
 */

/**
 * Customer service line in international format, digits only — the exact shape
 * wa.me requires (no "+", no spaces, no dashes). Real number: +966 51 102 0667.
 */
export const WHATSAPP_NUMBER = '966511020667';

/** Human-readable form, for anywhere the number is shown rather than linked. */
export const WHATSAPP_DISPLAY_NUMBER = '+966 51 102 0667';

/**
 * Build a click-to-chat link to the support number, optionally prefilling the
 * buyer's first message.
 *
 * `wa.me` is used rather than `api.whatsapp.com/send` because it is the host
 * WhatsApp registers for Android App Links and iOS Universal Links: tapping it
 * on a phone hands off straight to the installed app instead of rendering the
 * "Continue to chat" web interstitial, and desktop visitors are handed to
 * WhatsApp Desktop (or Web) the same way. The `whatsapp://` custom scheme would
 * reach the app one step sooner but dead-ends on a broken page for anyone
 * without it installed, so it is deliberately not used.
 */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Plain support chat with no prefilled message (footer social icon). */
export const WHATSAPP_URL = whatsappUrl();

export const TIKTOK_URL = 'https://www.tiktok.com/@ultra.fit';

// Not live yet — the footer renders these as inert placeholders.
export const INSTAGRAM_URL = '#';
export const TWITTER_URL = '#';
