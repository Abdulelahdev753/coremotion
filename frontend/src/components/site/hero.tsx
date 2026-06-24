'use client';

import { PlayCircle } from 'lucide-react';
import Link from 'next/link';

import { useLanguage } from '@/components/providers/language-provider';
import LogoLoop, { type LogoItem } from '@/components/LogoLoop';
import Silk from '@/components/Silk';

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
  { src: `${basePath}/logos/sbs.avif`, alt: 'Stronger By Science', title: 'Stronger By Science', href: 'https://www.strongerbyscience.com' },
];

export function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden px-6 py-28"
    >
      {/* Animated silk backdrop with a Safari-safe fallback inside Silk. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <Silk
          className="absolute inset-0"
          speed={3.5}
          scale={1.3}
          color="#1b2e10"
          noiseIntensity={1}
          rotation={0}
        />
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,rgba(214,236,27,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0b0d]/30 via-[#0a0b0d]/60 to-[#0a0b0d]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Eyebrow */}
        <span className="inline-flex animate-in fade-in slide-in-from-bottom-2 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/75 fill-mode-both duration-700">
          <span className="size-1.5 rounded-full bg-brand shadow-[0_0_10px_#d6ec1b]" />
          {t.hero.eyebrow}
        </span>

        {/* Headline */}
        <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.2] text-white ltr:tracking-tight sm:text-5xl rtl:leading-[1.4] lg:text-6xl xl:text-[4.25rem]">
          {t.hero.headlineLead}{' '}
          <span className="bg-gradient-to-br from-brand to-[#a9c20f] bg-clip-text text-transparent">
            {t.hero.headlineAccent}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg rtl:leading-loose">
          {t.hero.subheadline}
        </p>

        {/* CTAs */}
        <div className="mt-9 flex animate-in fade-in slide-in-from-bottom-3 flex-col items-center gap-3 fill-mode-both delay-300 duration-700 sm:flex-row">
          <Link
            href="/motioncore"
            className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3.5 text-base font-semibold text-black shadow-[0_10px_40px_-10px_#d6ec1b] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_50px_-8px_#d6ec1b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b0d]"
          >
            {t.hero.cta}
          </Link>
          <a
            href="#what-you-get"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-base font-medium text-white/85 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
          >
            <PlayCircle aria-hidden className="size-5 rtl:-scale-x-100" />
            {t.hero.secondaryCta}
          </a>
        </div>
      </div>

      {/* Source / research marquee pinned to the bottom of the hero. */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-4 pb-8">
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white/40">
          {t.hero.trustedBy}
        </span>
        <div className="relative w-full max-w-4xl">
          <LogoLoop
            logos={sourceLogos}
            speed={50}
            direction="left"
            logoHeight={26}
            gap={56}
            hoverSpeed={0}
            scaleOnHover
            fadeOut
            fadeOutColor="#0a0b0d"
            ariaLabel={t.hero.trustedBy}
            // The marquee math (flex + translate3d) assumes LTR. Force LTR so the
            // loop renders identically under the site's RTL (Arabic) direction.
            style={{ direction: 'ltr' }}
            renderItem={(item) => {
              const logo = item as Extract<LogoItem, { src: string }>;
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
                    className="w-auto opacity-60 brightness-0 invert transition-opacity duration-300 hover:opacity-100"
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
