/**
 * Minimal StreamPay (streampay.sa) REST client + webhook verification.
 *
 * We use plain `fetch` rather than an SDK so the webhook route keeps full control
 * of the raw request body (required for HMAC signature verification). Auth is
 * HTTP Basic: base64("api-key:api-secret") sent in the `x-api-key` header.
 */
import crypto from 'crypto';
import { getEnv } from './env';

/** Subset of the StreamPay payment-link object we rely on. */
export type StreamPaymentLink = {
  id: string;
  url: string;
  status: string;
  amount_collected_in_smallest_unit: number;
};

/** Subset of the StreamPay invoice object we rely on. */
export type StreamInvoice = {
  id: string;
  org_invoice_number?: number | null;
  organization_consumer?: {
    name?: string | null;
    phone_number?: string | null;
    email?: string | null;
  } | null;
  payments?: Array<{ id: string }> | null;
};

async function streamFetch<T>(
  path: string,
  init: { method: string; body?: unknown } = { method: 'GET' },
): Promise<T> {
  const env = getEnv();
  const res = await fetch(`${env.streamApiBase}${path}`, {
    method: init.method,
    headers: {
      'x-api-key': env.streamApiKeyToken,
      'Content-Type': 'application/json',
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`StreamPay ${init.method} ${path} failed: ${res.status} ${detail.slice(0, 500)}`);
  }
  return (await res.json()) as T;
}

/**
 * Create a single-use hosted-checkout link for one product. The opaque
 * `metadata.order_token` is echoed back to us in the success redirect and the
 * webhook payload, letting us tie a verified payment to exactly one order.
 */
export async function createPaymentLink(args: {
  productId: string;
  name: string;
  successUrl: string;
  failureUrl: string;
  metadata: Record<string, string>;
}): Promise<StreamPaymentLink> {
  return streamFetch<StreamPaymentLink>('/api/v2/payment_links', {
    method: 'POST',
    body: {
      name: args.name,
      currency: 'SAR',
      contact_information_type: 'PHONE',
      max_number_of_payments: 1,
      items: [{ product_id: args.productId, quantity: 1 }],
      success_redirect_url: args.successUrl,
      failure_redirect_url: args.failureUrl,
      custom_metadata: args.metadata,
    },
  });
}

export async function getPaymentLink(id: string): Promise<StreamPaymentLink> {
  return streamFetch<StreamPaymentLink>(`/api/v2/payment_links/${id}`);
}

export async function getInvoice(id: string): Promise<StreamInvoice> {
  return streamFetch<StreamInvoice>(`/api/v2/invoices/${id}`);
}

/**
 * Has this (single-use) link been paid? Any collected amount means our one
 * allowed buyer completed payment. Source of truth for issuing the download,
 * independent of webhook timing.
 */
export async function isPaymentLinkPaid(id: string): Promise<boolean> {
  const link = await getPaymentLink(id);
  return (link.amount_collected_in_smallest_unit ?? 0) > 0 || link.status === 'COMPLETED';
}

/**
 * Verify a StreamPay webhook `X-Webhook-Signature` header against the raw body.
 * Header format: `t=<unix>,v1=<hex hmac>` where the HMAC is
 * HMAC-SHA256(secret, `${t}.${rawBody}`). Also rejects stale timestamps to
 * blunt replay attacks. Returns true only for an authentic, fresh signature.
 */
export function verifyWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  maxAgeSeconds = 300,
): boolean {
  if (!signatureHeader) return false;

  const parts: Record<string, string> = {};
  for (const segment of signatureHeader.split(',')) {
    const idx = segment.indexOf('=');
    if (idx === -1) continue;
    parts[segment.slice(0, idx).trim()] = segment.slice(idx + 1).trim();
  }

  const timestamp = parts.t;
  const provided = parts.v1;
  if (!timestamp || !provided) return false;

  // Freshness: reject signatures whose timestamp is too old/far in the future.
  const tsSeconds = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(tsSeconds)) return false;
  const ageSeconds = Math.abs(Date.now() / 1000 - tsSeconds);
  if (ageSeconds > maxAgeSeconds) return false;

  const env = getEnv();
  const message = `${timestamp}.${rawBody.toString('utf8')}`;
  const expected = crypto
    .createHmac('sha256', env.streamWebhookSecret)
    .update(message)
    .digest('hex');

  const expectedBuf = Buffer.from(expected, 'utf8');
  const providedBuf = Buffer.from(provided, 'utf8');
  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}
