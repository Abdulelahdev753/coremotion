'use client';

import { motion, type Variants } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';

import { useLanguage } from '@/components/providers/language-provider';

// GitHub Pages serves the site from /<repo>; next/image does not apply basePath
// to unoptimized images (static export), so prefix the logo manually — same as
// the navbar and hero do.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Structure lives here (hrefs + icons); the localized labels come from the
// dictionary and are zipped in by index — the same pattern <WhatYouGet /> uses.
const columnHrefs = [
  ['/#products', '/#what-you-get', '/#faq'],
  ['/motioncore', '/motioncore/assessment', '/motioncore/dashboard'],
  ['/#about', '/'],
] as const;

const legalHrefs = ['#', '#'] as const;

type SocialKey = 'instagram' | 'twitter' | 'tiktok' | 'whatsapp';

const socialConfig: Array<{ icon: SocialKey; href: string }> = [
  { icon: 'instagram', href: '#' },
  { icon: 'twitter', href: '#' },
  { icon: 'tiktok', href: '#' },
  { icon: 'whatsapp', href: '#' },
];

// Inline brand marks (Simple Icons paths) — keeps us on lucide-only + avoids
// pulling in react-icons for four glyphs. All draw with `currentColor`.
const socialIcons: Record<SocialKey, ComponentType<{ className?: string }>> = {
  instagram: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  twitter: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  tiktok: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  whatsapp: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  ),
};

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const riseVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 0.65, bounce: 0 },
  },
};

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045 } },
};

const linkVariants: Variants = {
  hidden: { opacity: 0, y: 7 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.42, bounce: 0 } },
};

/** Internal routes use next/link (basePath + client nav); `#` placeholders stay plain anchors. */
function FooterLink({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}

/**
 * Site footer — brand block + navigation columns, with a bottom bar carrying the
 * copyright, social icons, and legal links. Bilingual + RTL via the dictionary;
 * content fades/rises in once on scroll into view (Motion).
 */
export function SiteFooter() {
  const { t } = useLanguage();
  const f = t.footer;

  const columns = f.columns.map((column, ci) => ({
    title: column.title,
    links: column.links.map((label, li) => ({ label, href: columnHrefs[ci]?.[li] ?? '#' })),
  }));
  const legal = f.legal.map((label, i) => ({ label, href: legalHrefs[i] ?? '#' }));
  const socials = f.socials.map((label, i) => ({ label, ...socialConfig[i] }));

  return (
    <footer className="relative w-full overflow-hidden bg-[#0a0b0d] text-white antialiased">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.22 }}
      >
        <div className="mx-auto max-w-6xl border-t border-white/[0.06] px-6 pt-14 pb-8 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(220px,1fr)_minmax(520px,0.98fr)] lg:gap-x-20">
            {/* Brand */}
            <motion.div variants={riseVariants} className="max-w-lg">
              <Link
                href="/"
                aria-label={`${t.brand} — home`}
                className="group inline-flex items-center gap-2.5 rounded-lg transition-transform duration-200 ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
              >
                <Image
                  src={`${basePath}/logos/green-logo-transparent.svg`}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <span className="text-lg font-semibold tracking-tight text-white">{t.brand}</span>
              </Link>
              <p className="mt-4 max-w-md whitespace-pre-line text-pretty text-sm leading-relaxed text-white/55 rtl:leading-loose">
                {f.tagline}
              </p>
            </motion.div>

            {/* Navigation */}
            <motion.nav
              variants={sectionVariants}
              aria-label={t.footer.columns[0]?.title}
              className="grid grid-cols-1 gap-8 min-[520px]:grid-cols-3 min-[520px]:gap-x-10 lg:gap-x-16"
            >
              {columns.map((column) => (
                <motion.div variants={riseVariants} key={column.title}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/80 rtl:tracking-normal">
                    {column.title}
                  </h3>
                  <motion.ul variants={listVariants} className="mt-4 space-y-2.5">
                    {column.links.map((link) => (
                      <motion.li variants={linkVariants} key={link.label}>
                        <FooterLink
                          href={link.href}
                          className="inline-flex rounded text-sm text-white/55 transition-colors duration-200 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
                        >
                          {link.label}
                        </FooterLink>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              ))}
            </motion.nav>
          </div>

          {/* Bottom bar */}
          <motion.div
            variants={riseVariants}
            className="mt-12 flex flex-col gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-xs text-white/40">{f.copyright}</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <motion.ul
                variants={listVariants}
                className="flex items-center gap-1"
                aria-label={t.footer.socials.join(', ')}
              >
                {socials.map((social) => {
                  const Icon = socialIcons[social.icon];
                  return (
                    <motion.li variants={linkVariants} key={social.icon}>
                      <FooterLink
                        href={social.href}
                        ariaLabel={social.label}
                        className="group flex size-9 items-center justify-center rounded-full text-white/50 transition-colors duration-200 ease-out hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
                      >
                        <Icon className="size-[18px] transition-transform duration-200 ease-out group-hover:scale-110" />
                      </FooterLink>
                    </motion.li>
                  );
                })}
              </motion.ul>

              <motion.ul variants={listVariants} className="flex flex-wrap items-center gap-x-5 gap-y-1">
                {legal.map((link) => (
                  <motion.li variants={linkVariants} key={link.label}>
                    <FooterLink
                      href={link.href}
                      className="inline-flex rounded text-xs text-white/50 transition-colors duration-200 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
                    >
                      {link.label}
                    </FooterLink>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
}
