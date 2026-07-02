/**
 * Supabase access for the orders table + private PDF buckets.
 *
 * Uses the service (secret) key, so it bypasses RLS — the `orders` table is
 * deny-all to anon/authenticated and is only ever read/written here on the
 * server. Never expose this client or key to the browser.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from './env';
import type { PackageConfig } from '../config/packages';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;
  const env = getEnv();
  client = createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export type OrderRow = {
  id: string;
  order_number: string;
  order_token: string;
  package_key: string;
  audience: string;
  tier: string;
  bucket: string;
  amount: number | null;
  currency: string;
  status: 'pending' | 'paid';
  customer_name: string | null;
  customer_phone: string | null;
  stream_payment_link_id: string | null;
  stream_invoice_id: string | null;
  stream_payment_id: string | null;
  stream_org_invoice_number: number | null;
  created_at: string;
  paid_at: string | null;
};

/** Insert a freshly-created (unpaid) order. */
export async function insertPendingOrder(args: {
  orderNumber: string;
  orderToken: string;
  pkg: PackageConfig;
  streamPaymentLinkId: string;
}): Promise<void> {
  const { error } = await getClient().from('orders').insert({
    order_number: args.orderNumber,
    order_token: args.orderToken,
    package_key: args.pkg.key,
    audience: args.pkg.audience,
    tier: args.pkg.tier,
    bucket: args.pkg.bucket,
    amount: args.pkg.priceSar,
    currency: 'SAR',
    status: 'pending',
    stream_payment_link_id: args.streamPaymentLinkId,
  });
  if (error) throw new Error(`Failed to insert order: ${error.message}`);
}

export async function getOrderByToken(token: string): Promise<OrderRow | null> {
  const { data, error } = await getClient()
    .from('orders')
    .select('*')
    .eq('order_token', token)
    .maybeSingle();
  if (error) throw new Error(`Failed to load order: ${error.message}`);
  return (data as OrderRow | null) ?? null;
}

/** Fallback lookup used by the webhook when no order_token is present. */
export async function getOrderByPaymentLinkId(linkId: string): Promise<OrderRow | null> {
  const { data, error } = await getClient()
    .from('orders')
    .select('*')
    .eq('stream_payment_link_id', linkId)
    .maybeSingle();
  if (error) throw new Error(`Failed to load order by link: ${error.message}`);
  return (data as OrderRow | null) ?? null;
}

/**
 * Mark an order paid and (best-effort) enrich it with customer + StreamPay
 * identifiers. Idempotent: matching on the token and only setting paid_at when
 * it isn't already set means duplicate webhooks / a redirect racing the webhook
 * can't corrupt the record.
 */
export async function markOrderPaid(
  token: string,
  fields: {
    customerName?: string | null;
    customerPhone?: string | null;
    streamInvoiceId?: string | null;
    streamPaymentId?: string | null;
    streamOrgInvoiceNumber?: number | null;
  } = {},
): Promise<void> {
  const patch: Record<string, unknown> = { status: 'paid' };
  // Only set non-null values so a sparse redirect-confirm doesn't wipe
  // customer data the webhook may have already written (and vice versa).
  if (fields.customerName != null) patch.customer_name = fields.customerName;
  if (fields.customerPhone != null) patch.customer_phone = fields.customerPhone;
  if (fields.streamInvoiceId != null) patch.stream_invoice_id = fields.streamInvoiceId;
  if (fields.streamPaymentId != null) patch.stream_payment_id = fields.streamPaymentId;
  if (fields.streamOrgInvoiceNumber != null) {
    patch.stream_org_invoice_number = fields.streamOrgInvoiceNumber;
  }

  // Idempotent: set status + any known customer/stream fields on every call.
  const { error } = await getClient().from('orders').update(patch).eq('order_token', token);
  if (error) throw new Error(`Failed to mark order paid: ${error.message}`);

  // Stamp paid_at once, preserving the first confirmation time across the
  // redirect/webhook race and duplicate webhook deliveries.
  const { error: stampError } = await getClient()
    .from('orders')
    .update({ paid_at: new Date().toISOString() })
    .eq('order_token', token)
    .is('paid_at', null);
  if (stampError) throw new Error(`Failed to stamp paid_at: ${stampError.message}`);
}

/**
 * Create a time-limited signed URL for a private bucket object. Returns an
 * absolute URL the browser can be redirected to. Expiry is in seconds.
 */
export async function createSignedDownloadUrl(
  bucket: string,
  object: string,
  ttlSeconds: number,
): Promise<string> {
  const { data, error } = await getClient()
    .storage.from(bucket)
    .createSignedUrl(object, ttlSeconds);
  if (error || !data?.signedUrl) {
    throw new Error(`Failed to sign ${bucket}/${object}: ${error?.message ?? 'no url'}`);
  }
  return data.signedUrl;
}
