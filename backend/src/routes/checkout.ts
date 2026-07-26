/**
 * Checkout flow endpoints.
 *
 *   POST /api/checkout/start   — mint a single-use StreamPay link for a package
 *   GET  /api/checkout/return  — success-redirect target → 302 to /api/download
 *   GET  /api/checkout/status  — JSON poll used by the "processing" fallback page
 *   GET  /api/download         — stream the purchased PDF for a paid order
 *
 * The download is gated on a payment confirmed against StreamPay's API (the
 * single-use link's collected amount), so it never leaks to non-payers and never
 * depends on the webhook having arrived yet. The PDF is proxied through this
 * server (never a Supabase signed URL) so buyers only ever see our own domain.
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
  downloadObject,
  type OrderRow,
} from '../lib/supabase';
import { maybeSendDeliveryEmail, isPlausibleEmail, buildDownloadUrl } from '../lib/delivery';

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
 * Confirm the order is paid, checking StreamPay directly when the webhook
 * hasn't landed yet. Marks the order paid (idempotently) the first time
 * StreamPay confirms it; customer name/phone enrichment is left to the webhook.
 */
async function confirmPaid(order: OrderRow): Promise<boolean> {
  if (order.status === 'paid') return true;
  if (!order.stream_payment_link_id) return false;
  const paid = await isPaymentLinkPaid(order.stream_payment_link_id);
  if (paid) await markOrderPaid(order.order_token);
  return paid;
}

/** Bucket + object for an order's file, tolerating retired package keys. */
function resolvePackageFile(order: OrderRow): { bucket: string; object: string } {
  const pkg = PACKAGES[order.package_key as PackageConfig['key']];
  return {
    bucket: pkg?.bucket ?? order.bucket,
    object: pkg?.object ?? `${order.bucket}.pdf`,
  };
}

checkoutRouter.post('/checkout/start', async (req, res) => {
  try {
    const { audience, tier, email } = (req.body ?? {}) as {
      audience?: unknown;
      tier?: unknown;
      email?: unknown;
    };
    const pkg = resolvePackage(audience, tier);
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid audience or tier.' });
    }
    // Optional so a stale pre-email frontend can still sell; without it the
    // buyer simply gets no delivery email (the paid redirect still downloads).
    const customerEmail = isPlausibleEmail(email) ? email.trim() : null;

    const env = getEnv();
    const orderToken = crypto.randomUUID();
    const orderNumber = generateOrderNumber();

    const link = await createPaymentLink({
      productId: pkg.productId,
      name: `${pkg.label} (${orderNumber})`,
      successUrl: `${env.publicBaseUrl}/api/checkout/return?token=${orderToken}`,
      failureUrl: `${env.publicBaseUrl}/checkout/failed/`,
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
      customerEmail,
    });

    // packageKey/priceSar let the frontend report begin_checkout to GA4 with
    // the price actually charged rather than the rounded figure on the card.
    return res.json({
      url: link.url,
      orderNumber,
      packageKey: pkg.key,
      priceSar: pkg.priceSar,
    });
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

    if (await confirmPaid(order)) {
      // Fire-and-forget: email the PDF too (no-op if already sent). Never
      // blocks the redirect — maybeSendDeliveryEmail handles its own errors.
      void maybeSendDeliveryEmail(order.order_token);
      return res.redirect(
        302,
        `${env.publicBaseUrl}/checkout/success/?token=${encodeURIComponent(token)}`,
      );
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

/**
 * Buyer-facing download. Streams the PDF through our server so the URL never
 * exposes Supabase (project ref, bucket names, signed-URL tokens). The order
 * token is single-purchase and unguessable (UUID); the link stays valid for
 * `emailLinkTtlSeconds` after payment to match the email's "7 days" promise.
 */
checkoutRouter.get('/download', async (req, res) => {
  try {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    const order = token ? await getOrderByToken(token) : null;
    if (!order || !(await confirmPaid(order))) {
      return res.status(404).send('Download not found.');
    }

    const paidAtMs = order.paid_at ? Date.parse(order.paid_at) : Date.now();
    if (Date.now() - paidAtMs > getEnv().emailLinkTtlSeconds * 1000) {
      return res
        .status(410)
        .send('This download link has expired. Please contact support with your order number.');
    }

    const { bucket, object } = resolvePackageFile(order);
    const file = await downloadObject(bucket, object);

    const contentType = object.toLowerCase().endsWith('.zip')
      ? 'application/zip'
      : 'application/pdf';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${object}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    return res.send(file);
  } catch (err) {
    console.error('download failed:', err);
    return res.status(500).send('Download failed. Please try again.');
  }
});

checkoutRouter.get('/checkout/status', async (req, res) => {
  try {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    const order = token ? await getOrderByToken(token) : null;
    if (!order) return res.status(404).json({ status: 'unknown' });

    if (await confirmPaid(order)) {
      // Fire-and-forget email, same as the return redirect (no-op if sent).
      void maybeSendDeliveryEmail(order.order_token);
      // package_key/price_sar feed the GA4 purchase event on the success page.
      // Read from the order row + catalogue (never the client) so reported
      // revenue can't be tampered with via the URL.
      const paidPkg = PACKAGES[order.package_key as PackageConfig['key']];
      return res.json({
        status: 'paid',
        download_url: buildDownloadUrl(order.order_token),
        order_number: order.order_number,
        file_name: resolvePackageFile(order).object,
        package_key: order.package_key,
        price_sar: paidPkg?.priceSar ?? null,
      });
    }
    return res.json({ status: 'pending' });
  } catch (err) {
    console.error('checkout/status failed:', err);
    return res.status(500).json({ status: 'error' });
  }
});
