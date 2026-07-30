import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  DEFAULT_DOWNLOAD_LINK_TTL_SECONDS,
  formatDuration,
  isWithinDownloadWindow,
} from './link-window.ts';

const TWO_HOURS = 7200;
/** Fixed "now" so the tests never depend on the wall clock. */
const NOW = Date.parse('2026-07-30T12:00:00.000Z');
const agoMinutes = (m: number) => new Date(NOW - m * 60_000).toISOString();

describe('DEFAULT_DOWNLOAD_LINK_TTL_SECONDS', () => {
  test('is two hours', () => {
    assert.equal(DEFAULT_DOWNLOAD_LINK_TTL_SECONDS, TWO_HOURS);
  });
});

describe('isWithinDownloadWindow', () => {
  test('allows a download moments after payment', () => {
    assert.equal(isWithinDownloadWindow(agoMinutes(0), TWO_HOURS, NOW), true);
    assert.equal(isWithinDownloadWindow(agoMinutes(1), TWO_HOURS, NOW), true);
  });

  test('allows a download late in the window', () => {
    assert.equal(isWithinDownloadWindow(agoMinutes(119), TWO_HOURS, NOW), true);
  });

  test('allows the exact boundary', () => {
    assert.equal(isWithinDownloadWindow(agoMinutes(120), TWO_HOURS, NOW), true);
  });

  test('blocks one second past the boundary', () => {
    const paidAt = new Date(NOW - (TWO_HOURS * 1000 + 1000)).toISOString();
    assert.equal(isWithinDownloadWindow(paidAt, TWO_HOURS, NOW), false);
  });

  test('blocks a link opened the next day', () => {
    assert.equal(isWithinDownloadWindow(agoMinutes(60 * 25), TWO_HOURS, NOW), false);
  });

  test('the old 7-day window would still have allowed it', () => {
    // Guards the actual behaviour change: same order, old TTL, opposite answer.
    assert.equal(isWithinDownloadWindow(agoMinutes(60 * 25), 604800, NOW), true);
  });

  test('fails open when paid_at is not stamped yet', () => {
    assert.equal(isWithinDownloadWindow(null, TWO_HOURS, NOW), true);
    assert.equal(isWithinDownloadWindow(undefined, TWO_HOURS, NOW), true);
  });

  test('fails open on an unparseable stamp', () => {
    assert.equal(isWithinDownloadWindow('not-a-date', TWO_HOURS, NOW), true);
  });

  test('reads a UTC stamp as UTC, not local time', () => {
    // Postgres timestamptz round-trips through toISOString(); a naive parse
    // would shift by the server's offset and mis-expire near the boundary.
    const paidAt = '2026-07-30T10:30:00.000Z'; // 90 min before NOW
    assert.equal(isWithinDownloadWindow(paidAt, TWO_HOURS, NOW), true);
    assert.equal(isWithinDownloadWindow(paidAt, 3600, NOW), false);
  });

  test('tolerates a clock skew that puts payment in the future', () => {
    const paidAt = new Date(NOW + 60_000).toISOString();
    assert.equal(isWithinDownloadWindow(paidAt, TWO_HOURS, NOW), true);
  });
});

describe('formatDuration', () => {
  test('renders the 2-hour window as an Arabic dual', () => {
    assert.deepEqual(formatDuration(TWO_HOURS), { ar: 'ساعتين', en: '2 hours' });
  });

  test('renders a single hour without a count', () => {
    assert.deepEqual(formatDuration(3600), { ar: 'ساعة', en: '1 hour' });
  });

  test('renders 3–10 with the Arabic plural', () => {
    assert.deepEqual(formatDuration(6 * 3600), { ar: '6 ساعات', en: '6 hours' });
    assert.deepEqual(formatDuration(7 * 86400), { ar: '7 أيام', en: '7 days' });
  });

  test('renders 11+ with the Arabic singular', () => {
    assert.deepEqual(formatDuration(12 * 3600), { ar: '12 ساعة', en: '12 hours' });
    assert.deepEqual(formatDuration(14 * 86400), { ar: '14 يومًا', en: '14 days' });
  });

  test('prefers the largest unit that divides evenly', () => {
    assert.deepEqual(formatDuration(86400), { ar: 'يوم', en: '1 day' });
    assert.deepEqual(formatDuration(2 * 86400), { ar: 'يومين', en: '2 days' });
    assert.deepEqual(formatDuration(90 * 60), { ar: '90 دقيقة', en: '90 minutes' });
  });

  test('floors at one minute and rounds sub-minute remainders', () => {
    assert.deepEqual(formatDuration(30), { ar: 'دقيقة', en: '1 minute' });
    assert.deepEqual(formatDuration(7250), { ar: '121 دقيقة', en: '121 minutes' });
  });
});
