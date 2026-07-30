import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { buildEmail, isPlausibleEmail } from './delivery.ts';
import { DEFAULT_DOWNLOAD_LINK_TTL_SECONDS } from './link-window.ts';
import { PACKAGES } from '../config/packages.ts';
import type { OrderRow } from './supabase.ts';

const PKG = PACKAGES['men-elite'];
const DOWNLOAD_URL = 'https://ultrafits.com/api/download?token=abc-123';

/** A paid order, only as populated as buildEmail actually reads. */
const order = {
  order_number: 'UF-260730-K7Q4M',
  customer_name: 'Sara',
  customer_email: 'buyer@example.com',
} as OrderRow;

const build = (ttl: number = DEFAULT_DOWNLOAD_LINK_TTL_SECONDS) =>
  buildEmail(order, PKG, DOWNLOAD_URL, ttl);

describe('delivery email link validity', () => {
  test('states the 2-hour window in Arabic and English', () => {
    const { text, html } = build();
    // Arabic takes the dual form for 2; "2 ساعات" would be wrong.
    assert.match(text, /صالح لمدة ساعتين/);
    assert.match(text, /valid for 2 hours/);
    assert.match(html, /صالح لمدة <strong>ساعتين<\/strong>/);
    assert.match(html, /link valid for 2 hours/);
  });

  test('never mentions the old 7-day window', () => {
    const { text, html } = build();
    for (const body of [text, html]) {
      assert.doesNotMatch(body, /7 days/);
      assert.doesNotMatch(body, /7 أيام/);
    }
  });

  test('tracks the configured TTL instead of hardcoding a duration', () => {
    // The regression this guards: copy and enforcement drifting apart.
    const { text } = build(6 * 3600);
    assert.match(text, /صالح لمدة 6 ساعات/);
    assert.match(text, /valid for 6 hours/);
    assert.doesNotMatch(text, /ساعتين/);
    assert.doesNotMatch(text, /2 hours/);
  });

  test('tells the buyer the attachment is the permanent copy', () => {
    // With a 2-hour link this is what stops a late opener losing the product.
    const { text, html } = build();
    assert.match(text, /نسختك الدائمة/);
    assert.match(text, /permanent copy/);
    assert.match(html, /نسختك الدائمة/);
    assert.match(html, /permanent copy/);
  });
});

describe('delivery email basics', () => {
  test('carries the order number and the download URL', () => {
    const { subject, text, html } = build();
    assert.match(subject, /UF-260730-K7Q4M/);
    assert.match(text, /UF-260730-K7Q4M/);
    assert.ok(text.includes(DOWNLOAD_URL));
    assert.ok(html.includes(`href="${DOWNLOAD_URL}"`));
  });

  test('greets a named buyer and stays clean without a name', () => {
    assert.match(build().text, /شكراً لشرائك Sara!/);
    const anonymous = buildEmail(
      { ...order, customer_name: null } as OrderRow,
      PKG,
      DOWNLOAD_URL,
      DEFAULT_DOWNLOAD_LINK_TTL_SECONDS,
    );
    assert.match(anonymous.text, /شكراً لشرائك!/);
    assert.match(anonymous.text, /Thank you for your purchase!/);
  });

  test('escapes HTML in buyer-controlled fields', () => {
    const injected = buildEmail(
      { ...order, customer_name: '<script>alert(1)</script>' } as OrderRow,
      PKG,
      DOWNLOAD_URL,
      DEFAULT_DOWNLOAD_LINK_TTL_SECONDS,
    );
    assert.doesNotMatch(injected.html, /<script>/);
    assert.match(injected.html, /&lt;script&gt;/);
  });
});

describe('isPlausibleEmail', () => {
  test('accepts ordinary addresses', () => {
    assert.equal(isPlausibleEmail('buyer@example.com'), true);
    assert.equal(isPlausibleEmail('  buyer@example.com  '), true);
  });

  test('rejects malformed values', () => {
    for (const bad of ['', 'buyer', 'buyer@', '@example.com', 'a b@example.com', null, 42]) {
      assert.equal(isPlausibleEmail(bad), false);
    }
  });
});
