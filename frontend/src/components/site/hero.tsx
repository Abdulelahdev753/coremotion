'use client';

import { ChartNoAxesCombined } from 'lucide-react';
import Link from 'next/link';

import { useLanguage } from '@/components/providers/language-provider';
import LogoLoop, { type LogoItem } from '@/components/LogoLoop';

// On GitHub Pages the site is served from /<repo>, so public assets referenced
// in plain <img> tags must be prefixed manually (Next only rewrites next/image).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Research bodies & journals the program draws on — rendered as a marquee. */
const sourceLogos: LogoItem[] = [
  { src: `${basePath}/logos/pubmed.svg`, alt: 'PubMed', title: 'PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov' },
  { src: `${basePath}/logos/elsevier.svg`, alt: 'Elsevier', title: 'Elsevier', href: 'https://www.elsevier.com' },
  {
    src: `${basePath}/logos/nsca.svg`,
    alt: 'National Strength and Conditioning Association',
    title: 'NSCA',
    href: 'https://www.nsca.com',
  },
  {
    src: `${basePath}/logos/taylor-and-francis.svg`,
    alt: 'Taylor & Francis',
    title: 'Taylor & Francis',
    href: 'https://taylorandfrancis.com',
  },
  { src: `${basePath}/logos/sbs.svg`, alt: 'Stronger By Science', title: 'Stronger By Science', href: 'https://www.strongerbyscience.com' },
];

/**
 * Per-logo render height (px) in the marquee. Wordmark logos fill their SVG
 * canvas and read fine at the base 40px; emblem logos bake in whitespace/captions
 * so their artwork looks tiny at 40px — bump those up so all logos match visually.
 */
const logoScale: Record<string, number> = {
  'elsevier.svg': 62,
  'nsca.svg': 66,
  'taylor-and-francis.svg': 56,
};

export function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] w-full flex-col items-center justify-start overflow-hidden px-6 pb-10 pt-28 lg:justify-center lg:px-12 lg:pb-32 lg:pt-36"
    >
      {/* Desktop backdrop: the pre-composed couple + green shape. `cover` fills
          the whole hero at every window aspect ratio — no letter-box bands or
          hard seams on the sides. Anchored bottom-right so the athletes stay
          framed on the right; the left edge it crops sits under the copy and the
          legibility wash, so nothing important is lost. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed hero art */}
        <img
          src={`${basePath}/hero-couple-desktop.webp`}
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-right-bottom"
        />
        {/* Left-hand legibility wash so the copy always reads. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f0f2f2] via-[#f0f2f2]/75 to-transparent" />
        {/* Bottom fade behind the research marquee. */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f0f2f2] to-transparent" />
      </div>

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center sm:max-w-2xl lg:mx-0 lg:mr-auto lg:max-w-md lg:items-start lg:text-start xl:max-w-lg">
        {/* Headline */}
        <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.2] text-black ltr:tracking-tight sm:text-5xl rtl:leading-[1.4] lg:text-5xl xl:text-6xl">
          {t.hero.headlineLead}{' '}
          <span className="bg-gradient-to-br from-brand to-[#0f7a3f] bg-clip-text text-transparent">
            {t.hero.headlineAccent}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-black/65 sm:text-lg rtl:leading-loose">
          {t.hero.subheadline}
        </p>

        {/* CTAs */}
        <div className="mt-9 flex animate-in fade-in slide-in-from-bottom-3 flex-col items-center gap-3 fill-mode-both delay-300 duration-700 sm:flex-row">
          <a
            href="#products"
            className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3.5 text-base font-semibold text-white transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#f0f2f2]"
          >
            {t.hero.cta}
          </a>
          <Link
            href="/motioncore"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-base font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
          >
            {t.hero.secondaryCta}
            <ChartNoAxesCombined aria-hidden className="size-5 rtl:-scale-x-100" />
          </Link>
        </div>
      </div>

      {/* Mobile / tablet: the pre-composed couple + green shape, in flow so it
          always sits below the copy (never behind it). The source art has a
          tall empty band above the heads — we crop it out with a bottom-
          anchored aspect-ratio window so there's no dead white gap. */}
      <div
        aria-hidden
        className="pointer-events-none relative z-0 mt-3 aspect-[941/1120] w-full max-w-sm overflow-hidden lg:hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- hero art */}
        <img
          src={`${basePath}/hero-couple-mobile.webp`}
          alt=""
          width={941}
          height={1672}
          fetchPriority="high"
          className="absolute inset-x-0 bottom-0 w-full select-none"
        />
      </div>

      {/* Source / research marquee — in flow beneath the couple on mobile,
          pinned to the bottom of the hero on desktop. Visible at every size. */}
      <div className="relative z-10 mt-8 flex w-full flex-col items-center gap-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:pb-8">
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-black/40">
          {t.hero.trustedBy}
        </span>
        <div className="relative w-full max-w-4xl">
          <LogoLoop
            logos={sourceLogos}
            speed={50}
            direction="left"
            logoHeight={40}
            gap={72}
            hoverSpeed={0}
            scaleOnHover
            ariaLabel={t.hero.trustedBy}
            // The marquee math (flex + translate3d) assumes LTR. Force LTR so the
            // loop renders identically under the site's RTL (Arabic) direction.
            style={{ direction: 'ltr' }}
            renderItem={(item) => {
              const logo = item as Extract<LogoItem, { src: string }>;
              // Emblem logos (a mark + caption baked into the SVG) carry a lot of
              // internal whitespace, so at the shared 40px row height their actual
              // artwork reads much smaller than the wordmarks. Nudge those up so
              // every logo lands at roughly the same *visual* size.
              const height =
                Object.entries(logoScale).find(([file]) => logo.src.includes(file))?.[1] ?? 40;
              return (
                <a
                  className="logoloop__link"
                  href={logo.href}
                  title={logo.title}
                  aria-label={logo.alt}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- marquee logos, optimization not needed */}
                  <img
                    src={logo.src}
                    alt={logo.alt ?? ''}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    style={{ height }}
                    className="w-auto max-w-[160px] object-contain opacity-60 brightness-0 transition-opacity duration-300 hover:opacity-100"
                  />
                </a>
              );
            }}
          />
        </div>
      </div>
    </section>
  );
}
