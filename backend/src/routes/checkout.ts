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
 *
 * Access also expires. Every route that can hand a buyer their file — the
 * emailed link, the post-payment redirect and the status poll the success page
 * reads — checks the same download window (lib/link-window) against `paid_at`,
 * so a replayed URL cannot outlive it on one path while dying on another.
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
import { isWithinDownloadWindow } from '../lib/link-window';
import { whatsappUrl, WHATSAPP_DISPLAY_NUMBER } from '../config/support';

export const checkoutRouter = Router();

/** Is this paid order still inside its download window? */
const isLive = (order: OrderRow) =>
  isWithinDownloadWindow(order.paid_at, getEnv().downloadLinkTtlSeconds);

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

/**
 * Buyer-facing "your link expired" page.
 *
 * Served as HTML rather than the plain string it used to be so that "contact
 * support" is a tappable WhatsApp link: this is reached from a download link in
 * an email, usually on a phone, where a plain-text phone number is a dead end.
 * Bilingual because the request carries no reliable locale signal. The order
 * number is prefilled into the chat so support can find the purchase straight
 * away.
 */
function expiredDownloadPage(orderNumber: string | null): string {
  const ref = orderNumber ? escapeHtml(orderNumber) : '';
  const chat = whatsappUrl(
    orderNumber
      ? `السلام عليكم، رابط تحميل طلبي في UltraFit انتهت صلاحيته. رقم الطلب: ${orderNumber}`
      : 'السلام عليكم، رابط تحميل طلبي في UltraFit انتهت صلاحيته.',
  );
  return `<!doctype html>
<html lang="ar" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>انتهت صلاحية الرابط — UltraFit</title>
<style>
body{margin:0;min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:2rem;text-align:center;background:#f0f2f2;color:#0a0b0d;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
p{margin:0;max-width:30rem;line-height:1.7;opacity:.8}
.ref{font-weight:700;opacity:1}
a{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:12px 22px;border-radius:12px;background:#16924e;color:#fff;font-weight:800;text-decoration:none}
</style></head><body>
<h1 style="margin:0;font-size:1.5rem">انتهت صلاحية رابط التحميل</h1>
<p>راسلنا على واتساب وسنعيد إرسال برنامجك.</p>
<!-- Every Latin/numeric run carries its own dir="ltr": inside this RTL
     document the bidi algorithm otherwise flips trailing punctuation to the
     wrong end and reorders the phone number's digit groups. -->
<p dir="ltr">Your download link has expired — message us on WhatsApp and we'll resend your program.</p>
${ref ? `<p class="ref">رقم الطلب / Order: <span dir="ltr">${ref}</span></p>` : ''}
<a href="${chat}">تواصل مع الدعم · Contact support</a>
<p dir="ltr" style="font-size:.85rem">${WHATSAPP_DISPLAY_NUMBER}</p>
</body></html>`;
}

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
      // A real buyer reaches this redirect seconds after paying, so an expired
      // window here means the URL is being replayed long afterwards. Answer it
      // the same way the emailed link does rather than bouncing to a success
      // page whose download is already dead.
      if (!isLive(order)) {
        return res
          .status(410)
          .type('html')
          .send(expiredDownloadPage(order.order_number ?? null));
      }
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
 * token is single-purchase and unguessable (UUID); the link stays live only for
 * `downloadLinkTtlSeconds` after payment, which is also the window the delivery
 * email states.
 */
checkoutRouter.get('/download', async (req, res) => {
  try {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    const order = token ? await getOrderByToken(token) : null;
    if (!order || !(await confirmPaid(order))) {
      return res.status(404).send('Download not found.');
    }

    if (!isLive(order)) {
      return res
        .status(410)
        .type('html')
        .send(expiredDownloadPage(order.order_number ?? null));
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
  // This answer is time-sensitive — the same token returns `paid` before the
  // download window closes and `expired` after — so it must never be served
  // from a cache. Without this, Express's ETag alone leaves the freshness
  // heuristic to the browser, which could keep showing a download button whose
  // link has already died.
  res.setHeader('Cache-Control', 'no-store');
  try {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    const order = token ? await getOrderByToken(token) : null;
    if (!order) return res.status(404).json({ status: 'unknown' });

    if (await confirmPaid(order)) {
      // Past the window there is no link left to hand out, so the success page
      // is told to show its expired state instead of a button that 410s. No
      // delivery email either: its copy promises a live link, and sending one
      // with a dead link would be worse than the WhatsApp route out.
      if (!isLive(order)) {
        return res.json({ status: 'expired', order_number: order.order_number });
      }
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
