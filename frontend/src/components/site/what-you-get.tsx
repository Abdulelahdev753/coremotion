'use client';

import type { CSSProperties } from 'react';

import TiltedCover from '@/components/animata/image/tilted-cover';
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

/**
 * "What You'll Get" — one animata TiltedCover per tier: the package mockup sits
 * as a cover that slides away on hover to reveal the tier description on an
 * accent-tinted panel. Tilt follows the on-screen position (left card tilts
 * left, right card tilts right, center stays flat) and is computed from the
 * layout direction so Arabic renders identically to English. Touch devices
 * can't hover, so TiltedCover also toggles the reveal on tap.
 */
export function WhatYouGet({ audience = 'men' }: WhatYouGetProps) {
  const { t } = useLanguage();
  const w = t.whatYouGet;
  // RTL grids flow right→left, so DOM index 0 sits on the visual right.
  const isRtl = t.dir === 'rtl';

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
          .map(({ card, item }, index) => {
            // 0 = visual left, 1 = center, 2 = visual right (single-column
            // mobile stacks them, where the mix of tilts reads fine).
            const visual = isRtl ? 2 - index : index;
            return (
              <figure
                key={card.src}
                className="m-0 flex min-w-0 flex-col items-center"
                style={{ '--tier-rgb': card.rgb } as CSSProperties}
              >
                <TiltedCover
                  direction={visual === 2 ? 'right' : 'left'}
                  tiltCover={visual !== 1}
                  image={{ src: card.src, alt: item.title }}
                >
                  <div
                    className="flex h-full w-full flex-col items-center justify-center p-5 text-center"
                    style={{
                      background: `radial-gradient(ellipse at 50% 120%, rgba(var(--tier-rgb), 0.22), transparent 70%), #0b0c0f`,
                    }}
                  >
                    <p className="text-xs leading-relaxed text-white/75 rtl:leading-loose">
                      {item.description}
                    </p>
                  </div>
                </TiltedCover>
                <figcaption className="mt-3 text-center">
                  <h3 className="text-base font-extrabold leading-tight text-white">
                    {item.title}
                  </h3>
                </figcaption>
              </figure>
            );
          })}
      </div>
    </section>
  );
}
