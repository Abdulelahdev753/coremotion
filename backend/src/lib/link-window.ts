/**
 * The download window: how long a paid order's download link stays live, and
 * how that window is worded to the buyer.
 *
 * One module owns both halves on purpose. The window used to be enforced in
 * `/api/download` while the email hardcoded "7 days" in four places, so any
 * change to the TTL silently turned the email into a lie. Everything now
 * derives from `ttlSeconds`: the endpoints ask `isWithinDownloadWindow`, the
 * email asks `formatDuration`, and the two cannot disagree.
 *
 * Deliberately free of env and network access so the rule is unit-testable.
 */

/** Default window: 2 hours after payment. */
export const DEFAULT_DOWNLOAD_LINK_TTL_SECONDS = 7200;

/**
 * Is this order's download still inside its window?
 *
 * Fails open in the two ambiguous cases — no `paid_at` yet (markOrderPaid
 * stamps it in a second write, so a just-confirmed order can be read between
 * the two) and an unparseable stamp. A buyer who paid seconds ago must never be
 * shown an expiry page because of a write ordering detail.
 */
export function isWithinDownloadWindow(
  paidAt: string | null | undefined,
  ttlSeconds: number,
  now: number = Date.now(),
): boolean {
  if (!paidAt) return true;
  const paidAtMs = Date.parse(paidAt);
  if (!Number.isFinite(paidAtMs)) return true;
  return now - paidAtMs <= ttlSeconds * 1000;
}

type Unit = 'day' | 'hour' | 'minute';

const UNIT_SECONDS: Record<Unit, number> = { day: 86400, hour: 3600, minute: 60 };

/**
 * Arabic counted-noun forms. Arabic does not pluralise like English: 2 takes a
 * dual form ("ساعتين", not "2 ساعات"), 3–10 take the plural, and 11+ go back to
 * the singular. Writing `${n} ساعات` for every n reads as broken Arabic to the
 * AR-first audience this email is written for.
 */
const AR_FORMS: Record<Unit, { one: string; two: string; few: string; many: string }> = {
  day: { one: 'يوم', two: 'يومين', few: 'أيام', many: 'يومًا' },
  hour: { one: 'ساعة', two: 'ساعتين', few: 'ساعات', many: 'ساعة' },
  minute: { one: 'دقيقة', two: 'دقيقتين', few: 'دقائق', many: 'دقيقة' },
};

const EN_NOUNS: Record<Unit, string> = { day: 'day', hour: 'hour', minute: 'minute' };

/** Largest whole unit that divides the window evenly; minutes as the floor. */
function splitDuration(ttlSeconds: number): { unit: Unit; count: number } {
  const total = Math.max(60, Math.round(ttlSeconds));
  for (const unit of ['day', 'hour', 'minute'] as const) {
    if (total % UNIT_SECONDS[unit] === 0) return { unit, count: total / UNIT_SECONDS[unit] };
  }
  // Not a whole number of minutes (never in practice) — round rather than lie.
  return { unit: 'minute', count: Math.max(1, Math.round(total / 60)) };
}

/**
 * The window as buyer-facing duration text, e.g. 7200 → `ساعتين` / `2 hours`.
 * Used to build the email's validity line in both languages.
 */
export function formatDuration(ttlSeconds: number): { ar: string; en: string } {
  const { unit, count } = splitDuration(ttlSeconds);
  const forms = AR_FORMS[unit];

  let ar: string;
  if (count === 1) ar = forms.one;
  else if (count === 2) ar = forms.two;
  else if (count <= 10) ar = `${count} ${forms.few}`;
  else ar = `${count} ${forms.many}`;

  const noun = EN_NOUNS[unit];
  return { ar, en: `${count} ${noun}${count === 1 ? '' : 's'}` };
}
