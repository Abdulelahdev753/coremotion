'use client';

import type { CSSProperties } from 'react';

import { useLanguage } from '@/components/providers/language-provider';

// next/image does not apply basePath to unoptimized images in a static export,
// and plain <img> tags are never rewritten — so prefix the src manually, the
// same way the hero source marquee does.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Package mockup + tier accent per card. The captions (title/description) come
// from the i18n dictionary in this exact order: men basic/pro/elite, then
// women basic/pro/elite — so the grid reads as tier columns × gender rows.
const cards = [
  { src: `${basePath}/packages/men-basic.webp`, rgb: '214, 236, 27' },
  { src: `${basePath}/packages/men-pro.webp`, rgb: '251, 146, 60' },
  { src: `${basePath}/packages/men-elite.webp`, rgb: '167, 139, 250' },
  { src: `${basePath}/packages/women-basic.webp`, rgb: '214, 236, 27' },
  { src: `${basePath}/packages/women-pro.webp`, rgb: '251, 146, 60' },
  { src: `${basePath}/packages/women-elite.webp`, rgb: '167, 139, 250' },
] as const;

export function WhatYouGet() {
  const { t } = useLanguage();
  const w = t.whatYouGet;

  return (
    <section id="what-you-get" className="getit-stage scroll-mt-28">
      <div className="getit-stage__intro">
        <h2 className="getit-stage__heading">{w.heading}</h2>
        <p className="getit-stage__subheading">{w.subheading}</p>
      </div>

      <div className="getit-grid" aria-label={w.heading}>
        {cards.map((card, i) => {
          const item = w.items[i];
          return (
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
          );
        })}
      </div>
    </section>
  );
}
