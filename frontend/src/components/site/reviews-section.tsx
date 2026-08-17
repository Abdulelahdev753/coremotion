'use client';

import { useEffect, useRef } from 'react';

import { useLanguage } from '@/components/providers/language-provider';

/** Google Form that collects new reviews — opened by "Write a review". */
const REVIEW_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfykoMk4-eYDd4-hxsu2pcoKylLxXUnC0m8YLtiOwqYjWNDzA/viewform?usp=header';

// Every review we publish is a five-star one, so the score and each card's star
// row are constants rather than per-review data. The review *count* is derived
// from the dictionary so the summary line can never drift from the cards.
const RATING = 5;

// Avatar tints, cycled by card index — the four Google brand colours, so the
// initials read as part of the same visual language as the Forms mark.
const AVATAR_TINTS = ['#1a73e8', '#188038', '#e37400', '#a142f4'];

/**
 * The Google Forms mark — the reviews are collected through the form linked
 * below, so this is the badge on the heading and on every card. Inline, so the
 * section still costs no extra request.
 */
function FormsMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 64" aria-hidden="true" focusable="false">
      {/* Sheet, then the lighter folded corner. */}
      <path fill="#7248b9" d="M29 0H6a6 6 0 0 0-6 6v52a6 6 0 0 0 6 6h36a6 6 0 0 0 6-6V19L29 0z" />
      <path fill="#b39ddb" d="M29 0v13a6 6 0 0 0 6 6h13L29 0z" />
      {/* Three checked rows. */}
      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11.5 30.5l2.8 2.8 5.4-5.4" />
        <path d="M24.5 31h12" />
        <path d="M11.5 41.5l2.8 2.8 5.4-5.4" />
        <path d="M24.5 42h12" />
        <path d="M11.5 52.5l2.8 2.8 5.4-5.4" />
        <path d="M24.5 53h12" />
      </g>
    </svg>
  );
}

// Centring text centres its *line box*, which leaves a glyph looking off unless
// its ink happens to fill the em box symmetrically. Latin capitals do; Arabic
// letters do not, and not by a shared amount — at 44px each, "ع" lands ~3.7px
// low, "ن" ~2.2px low and "ف" ~0.8px high. So the shift is measured per glyph
// and cached; one canvas measurement per distinct initial, reused thereafter.
const inkShifts = new Map<string, number>();
let measureCanvas: HTMLCanvasElement | null = null;

/** How far the glyph's ink centre sits below the line box centre, in px. */
function measureInkShift(char: string, font: string) {
  const key = `${font}|${char}`;
  const cached = inkShifts.get(key);
  if (cached !== undefined) return cached;

  measureCanvas ??= document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) return 0;
  ctx.font = font;
  const m = ctx.measureText(char);
  const shift =
    // The em box itself is lopsided (ascent ≠ descent)…
    (m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2 +
    // …and so is this particular glyph's ink within it.
    (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2;
  inkShifts.set(key, shift);
  return shift;
}

/** The tinted circle with the reviewer's initial, optically centred. */
function Avatar({ initial, tint }: { initial: string; tint: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cancelled = false;
    const apply = () => {
      const el = ref.current;
      if (cancelled || !el) return;
      const cs = getComputedStyle(el);
      const shift = measureInkShift(
        initial,
        `${cs.fontWeight} ${parseFloat(cs.fontSize)}px ${cs.fontFamily}`,
      );
      el.style.transform = `translateY(${(-shift).toFixed(2)}px)`;
    };
    apply();
    // The metrics change when the webfont swaps in, so measure again once the
    // fonts have settled.
    document.fonts?.ready.then(apply);
    return () => {
      cancelled = true;
    };
  }, [initial]);

  return (
    <span className="reviews-avatar" style={{ background: tint }} aria-hidden="true">
      <span className="reviews-avatar__initial" ref={ref}>
        {initial}
      </span>
    </span>
  );
}

/**
 * Five stars, drawn as five `<use>` references to the single `#uf-star` symbol
 * defined once per page — one copy of the path for the whole section.
 */
function StarRow({ label }: { label: string }) {
  return (
    <svg className="reviews-stars" viewBox="0 0 128 24" role="img" aria-label={label}>
      {[0, 1, 2, 3, 4].map((i) => (
        <use key={i} href="#uf-star" x={i * 26} />
      ))}
    </svg>
  );
}

/**
 * "Our Google Forms reviews" — a rating summary, a link out to the form that
 * collects new reviews, and a grid of review cards. Deliberately static: plain
 * CSS, inline SVG, no images to fetch and nothing that animates on scroll.
 */
export function ReviewsSection() {
  const { t } = useLanguage();
  const r = t.reviews;
  const starsLabel = r.starsLabel.replace('{rating}', String(RATING));

  return (
    <section id="reviews" className="reviews-section scroll-mt-28">
      {/* The star path, defined once and referenced by every StarRow above. */}
      <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
        <symbol id="uf-star" viewBox="0 0 24 24" width="24" height="24">
          <path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.1 6.1 20.2l1.2-6.6L2.5 9l6.6-.9z" />
        </symbol>
      </svg>

      <div className="reviews-head">
        <h2 className="reviews-title">
          <FormsMark className="reviews-title__mark" />
          {r.heading}
        </h2>

        <div className="reviews-summary">
          <span className="reviews-score">{RATING.toFixed(1)}</span>
          <StarRow label={starsLabel} />
          <span className="reviews-count">
            {r.ratingSummary.replace('{count}', String(r.items.length))}
          </span>
        </div>

        <a
          className="reviews-cta"
          href={REVIEW_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {r.writeCta}
        </a>
      </div>

      <ul className="reviews-grid">
        {r.items.map((item, i) => (
          <li key={item.name} className="reviews-card">
            <div className="reviews-card__head">
              {/* Array.from, not [0], so an Arabic name's first glyph is
                  taken as a whole code point. */}
              <Avatar
                initial={Array.from(item.name)[0]}
                tint={AVATAR_TINTS[i % AVATAR_TINTS.length]}
              />
              <span className="reviews-name">{item.name}</span>
              <FormsMark className="reviews-card__mark" />
            </div>
            <StarRow label={starsLabel} />
            <p className="reviews-text">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
