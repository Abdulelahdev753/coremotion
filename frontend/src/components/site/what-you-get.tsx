'use client';

import type { CSSProperties } from 'react';

import { useLanguage } from '@/components/providers/language-provider';
import type { PackageAudience } from '@/components/site/package-audience-pill';

// next/image does not apply basePath to unoptimized images in a static export,
// and plain <img> tags are never rewritten — so prefix the src manually, the
// same way the hero source marquee does.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Package mockup + tier accent per card. The captions (title/description) come
// from the i18n dictionary in this exact order: men basic/pro/elite, then
// women basic/pro/elite — so the grid reads as tier columns × gender rows.
// `audience` lets the Men/Women pill show only the matching three cards.
const cards = [
  { src: `${basePath}/packages/men-basic.webp`, rgb: '214, 236, 27', audience: 'men' },
  { src: `${basePath}/packages/men-pro.webp`, rgb: '251, 146, 60', audience: 'men' },
  { src: `${basePath}/packages/men-elite.webp`, rgb: '167, 139, 250', audience: 'men' },
  { src: `${basePath}/packages/women-basic.webp`, rgb: '214, 236, 27', audience: 'women' },
  { src: `${basePath}/packages/women-pro.webp`, rgb: '251, 146, 60', audience: 'women' },
  { src: `${basePath}/packages/women-elite.webp`, rgb: '167, 139, 250', audience: 'women' },
] as const;

type WhatYouGetProps = {
  /** Which set of three package cards to show. */
  audience?: PackageAudience;
};

export function WhatYouGet({ audience = 'men' }: WhatYouGetProps) {
  const { t } = useLanguage();
  const w = t.whatYouGet;

  return (
    <section id="what-you-get" className="getit-stage scroll-mt-28">
      <div className="getit-stage__intro">
        <h2 className="getit-stage__heading">{w.heading}</h2>
        <p className="getit-stage__subheading">{w.subheading}</p>
      </div>

      <div className="getit-grid" aria-label={w.heading}>
        {cards
          // Pair each card with its caption before filtering so the dictionary
          // index stays aligned, then keep only the selected audience's three.
          .map((card, i) => ({ card, item: w.items[i] }))
          .filter(({ card }) => card.audience === audience)
          .map(({ card, item }) => (
            <figure
              key={card.src}
              className="getit-card"
              style={{ '--tier-rgb': card.rgb } as CSSProperties}
            >
              <div className="getit-card__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.src} alt={item.title} loading="lazy" />
              </div>
              <figcaption className="getit-card__body">
                <h3 className="getit-card__title">{item.title}</h3>
                <p className="getit-card__text">{item.description}</p>
              </figcaption>
            </figure>
          ))}
      </div>
    </section>
  );
}
