/**
 * Typed, validated access to the server-side environment. All secrets
 * (StreamPay credentials, Supabase service key, webhook secret) are read here
 * exactly once so the rest of the app never touches `process.env` directly and
 * a missing var fails fast at boot rather than mid-checkout.
 */
import { DEFAULT_DOWNLOAD_LINK_TTL_SECONDS } from './link-window';

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== '' ? value.trim() : fallback;
}

let cached: Env | null = null;

export type Env = {
  streamApiBase: string;
  /** Pre-encoded HTTP Basic token for the StreamPay `x-api-key` header. */
  streamApiKeyToken: string;
  streamWebhookSecret: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  publicBaseUrl: string;
  resendApiKey: string;
  /** RFC 5322 From for delivery emails, e.g. `UltraFit <noreply@ultrafits.com>`. */
  emailFrom: string;
  /**
   * How long the download link stays valid after payment. Enforced by
   * /api/download, /api/checkout/return and /api/checkout/status, and worded
   * into the delivery email — see lib/link-window.
   */
  downloadLinkTtlSeconds: number;
};

/**
 * Load and validate the environment. Cached after first call. Call this from
 * request handlers (not at module top-level) so importing a module never throws
 * before `dotenv` has populated `process.env`.
 */
export function getEnv(): Env {
  if (cached) return cached;

  const apiKey = required('STREAM_API_KEY');
  const apiSecret = required('STREAM_API_SECRET');
  // StreamPay uses HTTP Basic: base64("api-key:api-secret") in the x-api-key header.
  const streamApiKeyToken = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  // Download links stay valid for 2 hours after payment; the email copy is
  // generated from this same number (lib/link-window) so the two can't drift.
  //
  // Read under a new name: deployed environments still carry the old
  // EMAIL_LINK_TTL_SECONDS=604800 from when the window was 7 days, and silently
  // honouring it would keep links alive for a week after this change ships.
  if (process.env.EMAIL_LINK_TTL_SECONDS) {
    console.warn(
      'EMAIL_LINK_TTL_SECONDS is no longer read (renamed to DOWNLOAD_LINK_TTL_SECONDS) — ' +
        'delete it from the environment to avoid confusion.',
    );
  }
  const ttl = Number.parseInt(
    optional('DOWNLOAD_LINK_TTL_SECONDS', String(DEFAULT_DOWNLOAD_LINK_TTL_SECONDS)),
    10,
  );
  const downloadLinkTtlSeconds =
    Number.isFinite(ttl) && ttl > 0 ? ttl : DEFAULT_DOWNLOAD_LINK_TTL_SECONDS;

  cached = {
    streamApiBase: optional('STREAM_API_BASE', 'https://stream-app-service.streampay.sa'),
    streamApiKeyToken,
    streamWebhookSecret: required('STREAM_WEBHOOK_SECRET'),
    supabaseUrl: required('SUPABASE_URL'),
    supabaseServiceKey: required('SUPABASE_SERVICE_KEY'),
    publicBaseUrl: required('PUBLIC_BASE_URL').replace(/\/$/, ''),
    resendApiKey: required('RESEND_API_KEY'),
    emailFrom: optional('EMAIL_FROM', 'UltraFit <noreply@ultrafits.com>'),
    downloadLinkTtlSeconds,
  };
  // Logged once (getEnv caches) so the window in force is verifiable from the
  // deployment logs rather than inferred from which env vars happen to be set.
  console.log(`Download link window: ${downloadLinkTtlSeconds}s`);
  return cached;
}
