/**
 * Checkout flow endpoints.
 *
 *   POST /api/checkout/start   — mint a single-use StreamPay link for a package
 *   GET  /api/checkout/return  — success-redirect target → 302 to the signed PDF
 *   GET  /api/checkout/status  — JSON poll used by the "processing" fallback page
 *
 * The download is gated on a payment confirmed against StreamPay's API (the
 * single-use link's collected amount), so it never leaks to non-payers and never
 * depends on the webhook having arrived yet.
 */
import crypto from 'crypto';
import { Router } from 'express';
import { getEnv } from '../lib/env';
import { PACKAGES, resolvePackage, type PackageConfig } from '../config/packages';
import { createPaymentLink, isPaymentLinkPaid } from '../lib/stream';
import {
  insertPendingOrder,
  getOrderByToken,
  markOrderPaid,
  createSignedDownloadUrl,
  type OrderRow,
} from '../lib/supabase';

export const checkoutRouter = Router();

/** Human-friendly, collision-resistant order number, e.g. `UF-260629-K7Q4M`. */
function generateOrderNumber(): string {
  const now = new Date();
  const ymd =
    now.getUTCFullYear().toString().slice(2) +
    String(now.getUTCMonth() + 1).padStart(2, '0') +
    String(now.getUTCDate()).padStart(2, '0');
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let suffix = '';
  for (const byte of crypto.randomBytes(5)) suffix += alphabet[byte % alphabet.length];
  return `UF-${ymd}-${suffix}`;
}

/**
 * Confirm payment and return a fresh signed download URL, or null if the order
 * isn't paid yet. Marks the order paid (idempotently) the first time StreamPay
 * confirms it; customer name/phone enrichment is left to the webhook.
 */
async function resolveDownloadUrl(order: OrderRow): Promise<string | null> {
  let paid = order.status === 'paid';
  if (!paid && order.stream_payment_link_id) {
    paid = await isPaymentLinkPaid(order.stream_payment_link_id);
    if (paid) await markOrderPaid(order.order_token);
  }
  if (!paid) return null;

  const pkg = PACKAGES[order.package_key as PackageConfig['key']];
  const bucket = pkg?.bucket ?? order.bucket;
  const object = pkg?.object ?? `${order.bucket}.pdf`;
  return createSignedDownloadUrl(bucket, object, getEnv().signedUrlTtlSeconds);
}

checkoutRouter.post('/checkout/start', async (req, res) => {
  try {
    const { audience, tier } = (req.body ?? {}) as { audience?: unknown; tier?: unknown };
    const pkg = resolvePackage(audience, tier);
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid audience or tier.' });
    }

    const env = getEnv();
    const orderToken = crypto.randomUUID();
    const orderNumber = generateOrderNumber();

    const link = await createPaymentLink({
      productId: pkg.productId,
      name: `${pkg.label} (${orderNumber})`,
      successUrl: `${env.publicBaseUrl}/api/checkout/return?token=${orderToken}`,
      failureUrl: `${env.publicBaseUrl}/?checkout=failed`,
      metadata: {
        order_token: orderToken,
        package_key: pkg.key,
        order_number: orderNumber,
      },
    });

    await insertPendingOrder({
      orderNumber,
      orderToken,
      pkg,
      streamPaymentLinkId: link.id,
    });

    return res.json({ url: link.url, orderNumber });
  } catch (err) {
    console.error('checkout/start failed:', err);
    return res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
});

checkoutRouter.get('/checkout/return', async (req, res) => {
  const env = getEnv();
  try {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    const order = token ? await getOrderByToken(token) : null;
    if (!order) {
      return res.redirect(302, `${env.publicBaseUrl}/?checkout=unknown`);
    }

    const downloadUrl = await resolveDownloadUrl(order);
    if (downloadUrl) {
      return res.redirect(302, downloadUrl);
    }
    // Paid but not yet confirmed (rare redirect/webhook race): hand off to a
    // lightweight page that polls /api/checkout/status until the link is ready.
    return res.redirect(
      302,
      `${env.publicBaseUrl}/checkout/processing/?token=${encodeURIComponent(token)}`,
    );
  } catch (err) {
    console.error('checkout/return failed:', err);
    return res.redirect(302, `${env.publicBaseUrl}/?checkout=error`);
  }
});

checkoutRouter.get('/checkout/status', async (req, res) => {
  try {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    const order = token ? await getOrderByToken(token) : null;
    if (!order) return res.status(404).json({ status: 'unknown' });

    const downloadUrl = await resolveDownloadUrl(order);
    if (downloadUrl) return res.json({ status: 'paid', download_url: downloadUrl });
    return res.json({ status: 'pending' });
  } catch (err) {
    console.error('checkout/status failed:', err);
    return res.status(500).json({ status: 'error' });
  }
});
