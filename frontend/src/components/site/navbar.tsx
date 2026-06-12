'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useLanguage } from '@/components/providers/language-provider';
import { LanguageToggle } from '@/components/site/language-toggle';
import GlassSurface from '@/components/ui/glass-surface';
import { cn } from '@/lib/utils';

// On GitHub Pages the site is served from /<repo>. next/image does not apply
// basePath to unoptimized images (used for static export), so prefix manually.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function Navbar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  // "/#section" (not bare "#section") so the anchors also work from the
  // MotionCore subpages; Link applies basePath automatically.
  const links = [
    { href: '/motioncore', label: t.nav.motioncore },
    { href: '/#products', label: t.nav.products },
    { href: '/#use-cases', label: t.nav.useCases },
    { href: '/#about', label: t.nav.about },
  ];

  // Close the mobile menu on Escape and when the viewport grows to desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const mql = window.matchMedia('(min-width: 768px)');
    const onChange = () => mql.matches && setOpen(false);
    window.addEventListener('keydown', onKey);
    mql.addEventListener('change', onChange);
    return () => {
      window.removeEventListener('keydown', onKey);
      mql.removeEventListener('change', onChange);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[80]">
      <div className="relative mx-auto max-w-6xl px-4 pt-3 sm:px-6 sm:pt-4">
        <GlassSurface className="relative z-20" height={64} borderRadius={22} backgroundOpacity={0.06}>
          <nav
            aria-label="Primary"
            className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-5"
          >
            {/* Brand */}
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
            >
              <Image
                src={`${basePath}/logos/green-logo-transparent.svg`}
                alt=""
                width={36}
                height={36}
                priority
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-[1.05rem] font-semibold tracking-tight text-white">
                {t.brand}
              </span>
            </Link>

            {/* Desktop links */}
            <ul className="hidden items-center justify-center gap-1 md:flex">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
              <LanguageToggle />
              <Link
                href="/motioncore"
                className="hidden items-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-black shadow-[0_0_24px_-8px_#d6ec1b] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:inline-flex"
              >
                {t.hero.cta}
              </Link>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? t.actions.closeMenu : t.actions.openMenu}
                className="relative z-30 inline-flex size-9 touch-manipulation select-none items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors [-webkit-tap-highlight-color:transparent] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 md:hidden"
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </nav>
        </GlassSurface>

        {/* Mobile menu */}
        <div
          id="mobile-nav"
          className={cn(
            'relative z-30 origin-top overflow-hidden transition-all duration-300 ease-out md:hidden',
            open
              ? 'pointer-events-auto mt-2 max-h-96 opacity-100'
              : 'pointer-events-none max-h-0 opacity-0',
          )}
        >
          <div className="relative z-30 rounded-2xl border border-white/10 bg-[#0d0f12]/95 p-2 shadow-2xl backdrop-blur-xl">
            <ul className="flex flex-col">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block touch-manipulation rounded-xl px-4 py-3 text-base font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="p-2">
                <Link
                  href="/motioncore"
                  onClick={() => setOpen(false)}
                  className="block touch-manipulation rounded-xl bg-brand px-4 py-3 text-center text-base font-semibold text-black"
                >
                  {t.hero.cta}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
