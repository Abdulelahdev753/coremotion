/**
 * Typed, validated access to the server-side environment. All secrets
 * (StreamPay credentials, Supabase service key, webhook secret) are read here
 * exactly once so the rest of the app never touches `process.env` directly and
 * a missing var fails fast at boot rather than mid-checkout.
 */

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
  /** How long the /api/download link stays valid after payment. */
  emailLinkTtlSeconds: number;
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

  // Download links stay valid for 7 days after payment, matching the email copy.
  const emailTtl = Number.parseInt(optional('EMAIL_LINK_TTL_SECONDS', '604800'), 10);

  cached = {
    streamApiBase: optional('STREAM_API_BASE', 'https://stream-app-service.streampay.sa'),
    streamApiKeyToken,
    streamWebhookSecret: required('STREAM_WEBHOOK_SECRET'),
    supabaseUrl: required('SUPABASE_URL'),
    supabaseServiceKey: required('SUPABASE_SERVICE_KEY'),
    publicBaseUrl: required('PUBLIC_BASE_URL').replace(/\/$/, ''),
    resendApiKey: required('RESEND_API_KEY'),
    emailFrom: optional('EMAIL_FROM', 'UltraFit <noreply@ultrafits.com>'),
    emailLinkTtlSeconds: Number.isFinite(emailTtl) && emailTtl > 0 ? emailTtl : 604800,
  };
  return cached;
}
