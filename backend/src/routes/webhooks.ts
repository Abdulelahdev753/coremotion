/**
 * StreamPay webhook receiver: POST /api/webhooks/streampay
 *
 * Source of truth for recording WHO bought. On a signature-verified
 * PAYMENT_SUCCEEDED, we look up the order (by our own order_token echoed in the
 * payload metadata), pull the buyer's name + phone from the invoice, and mark
 * the order paid. Mounted with a raw body parser so the HMAC sees exact bytes.
 */
import { Router, type Request, type Response } from 'express';
import { verifyWebhookSignature, getInvoice } from '../lib/stream';
import { getOrderByToken, getOrderByPaymentLinkId, markOrderPaid } from '../lib/supabase';

export const webhooksRouter = Router();

type WebhookBody = {
  event_type?: string;
  entity_id?: string;
  data?: {
    metadata?: Record<string, unknown> | null;
    payment_link?: { id?: string } | null;
    invoice?: { id?: string } | null;
    payment?: { id?: string } | null;
  };
};

webhooksRouter.post('/webhooks/streampay', async (req: Request, res: Response) => {
  // app.ts mounts this route with express.raw, so req.body is a Buffer.
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
  const signature = req.header('x-webhook-signature');

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('Rejected StreamPay webhook: invalid signature');
    return res.status(400).json({ error: 'invalid signature' });
  }

  let body: WebhookBody;
  try {
    body = JSON.parse(rawBody.toString('utf8')) as WebhookBody;
  } catch {
    return res.status(400).json({ error: 'invalid json' });
  }

  if (body.event_type !== 'PAYMENT_SUCCEEDED') {
    return res.status(200).json({ ignored: true });
  }

  try {
    const data = body.data ?? {};
    const orderToken =
      typeof data.metadata?.order_token === 'string' ? data.metadata.order_token : null;
    const linkId = data.payment_link?.id ?? null;

    const order = orderToken
      ? await getOrderByToken(orderToken)
      : linkId
        ? await getOrderByPaymentLinkId(linkId)
        : null;

    if (!order) {
      // Authentic event with nothing to attach to (e.g. a link not made by us).
      // Ack so StreamPay stops retrying.
      console.warn('StreamPay webhook: no matching order', { orderToken, linkId });
      return res.status(200).json({ ok: true, matched: false });
    }

    // Enrich from the invoice (name + phone live on its organization_consumer).
    let customerName: string | null = null;
    let customerPhone: string | null = null;
    let orgInvoiceNumber: number | null = null;
    const invoiceId = data.invoice?.id ?? null;
    if (invoiceId) {
      const invoice = await getInvoice(invoiceId);
      customerName = invoice.organization_consumer?.name ?? null;
      customerPhone = invoice.organization_consumer?.phone_number ?? null;
      orgInvoiceNumber = invoice.org_invoice_number ?? null;
    }

    await markOrderPaid(order.order_token, {
      customerName,
      customerPhone,
      streamInvoiceId: invoiceId,
      streamPaymentId: data.payment?.id ?? body.entity_id ?? null,
      streamOrgInvoiceNumber: orgInvoiceNumber,
    });

    return res.status(200).json({ ok: true, matched: true });
  } catch (err) {
    // Return 5xx so StreamPay retries (e.g. transient invoice fetch failure).
    console.error('StreamPay webhook processing failed:', err);
    return res.status(500).json({ error: 'processing failed' });
  }
});
