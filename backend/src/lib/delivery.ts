/**
 * Post-payment PDF delivery via Resend.
 *
 * Every payment-confirmation path (webhook, success redirect, status poll)
 * calls `maybeSendDeliveryEmail`; an atomic claim on `delivery_email_sent_at`
 * guarantees the buyer gets exactly one email no matter which path confirms
 * first or how many times StreamPay retries the webhook. The PDF (~50 KB) is
 * attached directly, with a 7-day signed download link as a fallback in the
 * body. A failed send releases the claim so the next confirmation retries.
 */
import { getEnv } from './env';
import { PACKAGES, type PackageConfig } from '../config/packages';
import {
  getOrderByToken,
  claimDeliveryEmail,
  releaseDeliveryEmailClaim,
  recordDeliveryEmailId,
  downloadObject,
  createSignedDownloadUrl,
  type OrderRow,
} from './supabase';

/** Loose-but-safe shape check; the frontend validates properly before checkout. */
export function isPlausibleEmail(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Bilingual (AR-first) order-delivery email. Kept inline: one message, no templates. */
function buildEmail(order: OrderRow, pkg: PackageConfig, downloadUrl: string) {
  const subject = `برنامجك جاهز — Your UltraFit program (${order.order_number})`;
  const greetName = order.customer_name ? ` ${order.customer_name}` : '';

  const text = [
    `شكراً لشرائك${greetName}!`,
    `برنامج ${pkg.label} جاهز — ستجده مرفقاً بهذه الرسالة (PDF).`,
    `رابط تحميل إضافي (صالح لمدة 7 أيام): ${downloadUrl}`,
    ``,
    `Thank you for your purchase${greetName}!`,
    `Your ${pkg.label} program is attached to this email as a PDF.`,
    `Backup download link (valid for 7 days): ${downloadUrl}`,
    ``,
    `Order ${order.order_number} — UltraFit (ultrafits.com)`,
  ].join('\n');

  const html = `
  <div style="font-family:-apple-system,'Segoe UI',Tahoma,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
    <h2 style="margin:0 0 4px">UltraFit</h2>
    <p style="color:#666;margin:0 0 24px">Order ${escapeHtml(order.order_number)}</p>
    <div dir="rtl" style="text-align:right;margin-bottom:24px">
      <p>شكراً لشرائك${escapeHtml(greetName)}!</p>
      <p>برنامج <strong>${escapeHtml(pkg.label)}</strong> جاهز — ستجده مرفقاً بهذه الرسالة (PDF).</p>
      <p>يمكنك أيضاً تحميله من الرابط التالي (صالح لمدة 7 أيام):</p>
    </div>
    <p style="text-align:center;margin:0 0 24px">
      <a href="${downloadUrl}" style="display:inline-block;background:#d6ec1b;color:#111;font-weight:700;padding:12px 28px;border-radius:999px;text-decoration:none">تحميل البرنامج — Download PDF</a>
    </p>
    <div style="margin-bottom:24px">
      <p>Thank you for your purchase${escapeHtml(greetName)}!</p>
      <p>Your <strong>${escapeHtml(pkg.label)}</strong> program is attached to this email as a PDF. You can also use the button above (link valid for 7 days).</p>
    </div>
    <p style="color:#999;font-size:12px">UltraFit — ultrafits.com</p>
  </div>`;

  return { subject, text, html };
}

/** Send one email through Resend's REST API. Returns the Resend message id. */
async function sendViaResend(args: {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachment: { filename: string; content: Buffer };
}): Promise<string> {
  const env = getEnv();
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.emailFrom,
      to: [args.to],
      subject: args.subject,
      text: args.text,
      html: args.html,
      attachments: [
        {
          filename: args.attachment.filename,
          content: args.attachment.content.toString('base64'),
          content_type: 'application/pdf',
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend send failed: ${res.status} ${detail.slice(0, 500)}`);
  }
  const body = (await res.json()) as { id?: string };
  if (!body.id) throw new Error('Resend send returned no id');
  return body.id;
}

/**
 * Email the purchased PDF to the buyer if (and only if) it hasn't been sent
 * yet. Safe to call from every payment-confirmation path; never throws —
 * delivery must not break the checkout redirect or make the webhook fail
 * after the order is already marked paid.
 */
export async function maybeSendDeliveryEmail(orderToken: string): Promise<void> {
  let claimed = false;
  try {
    const order = await getOrderByToken(orderToken);
    if (!order || order.status !== 'paid') return;
    if (!isPlausibleEmail(order.customer_email)) return;

    claimed = await claimDeliveryEmail(orderToken);
    if (!claimed) return; // already sent (or another path is sending right now)

    const pkg = PACKAGES[order.package_key as PackageConfig['key']];
    const bucket = pkg?.bucket ?? order.bucket;
    const object = pkg?.object ?? `${order.bucket}.pdf`;

    const [pdf, downloadUrl] = await Promise.all([
      downloadObject(bucket, object),
      createSignedDownloadUrl(bucket, object, getEnv().emailLinkTtlSeconds),
    ]);

    const { subject, text, html } = buildEmail(order, pkg ?? fallbackPkg(order), downloadUrl);
    const emailId = await sendViaResend({
      to: order.customer_email!.trim(),
      subject,
      text,
      html,
      attachment: { filename: object, content: pdf },
    });

    await recordDeliveryEmailId(orderToken, emailId);
    console.log(`Delivery email sent for ${order.order_number} (resend id ${emailId})`);
  } catch (err) {
    console.error(`Delivery email failed for order ${orderToken}:`, err);
    if (claimed) {
      await releaseDeliveryEmailClaim(orderToken).catch((releaseErr) =>
        console.error(`Failed to release delivery claim for ${orderToken}:`, releaseErr),
      );
    }
  }
}

/** Minimal label stand-in when an old order's package_key is no longer in PACKAGES. */
function fallbackPkg(order: OrderRow): PackageConfig {
  return {
    key: order.package_key as PackageConfig['key'],
    audience: order.audience as PackageConfig['audience'],
    tier: order.tier as PackageConfig['tier'],
    productId: '',
    bucket: order.bucket,
    object: `${order.bucket}.pdf`,
    priceSar: order.amount ?? 0,
    label: `UltraFit ${order.tier} — ${order.audience}`,
  };
}
