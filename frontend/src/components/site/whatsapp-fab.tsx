'use client';

import { motion, useReducedMotion } from 'motion/react';

import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { useLanguage } from '@/components/providers/language-provider';
import { trackContactSupport } from '@/lib/analytics';
import { whatsappUrl } from '@/lib/site-links';

/**
 * Floating "chat with us" button, mounted once in the root layout so customer
 * service is one tap away on every page.
 *
 * Anchored bottom-right in both writing directions rather than to the logical
 * inline-end: a WhatsApp widget sits bottom-right on essentially every site
 * that has one, and pinning it there stops the button from leaping across the
 * viewport when a visitor flips the language toggle. The hover/focus label
 * therefore always expands leftwards, into the page, which is why its offsets
 * are physical (`right-full`) and not logical.
 *
 * The link is a plain `<a target="_blank">` — see `whatsappUrl` for why wa.me
 * is what actually hands the visitor off to the installed app.
 */
export function WhatsappFab() {
  const { t } = useLanguage();
  const label = t.support.whatsappLabel;
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      // Delayed so the button settles in after the hero has painted instead of
      // competing with it for attention on first load.
      initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 0.5, bounce: 0.35, delay: 0.9 }}
      className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6 print:hidden"
    >
      <a
        href={whatsappUrl(t.support.generalMessage)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        onClick={() => trackContactSupport('floating_button')}
        // `group` drives the label reveal; `peer` is unused so hover and
        // keyboard focus share one state via group-hover/group-focus-visible.
        className="group relative flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_10px_28px_rgba(37,211,102,0.45)] outline-none transition-transform duration-200 ease-out hover:scale-105 active:scale-95 focus-visible:ring-4 focus-visible:ring-[#25d366]/40 motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        {/* Soft pulse ring, purely decorative. */}
        <span
          aria-hidden
          className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25d366]/40 [animation-duration:2.4s] motion-reduce:hidden"
        />
        <WhatsappIcon className="size-7" />

        {/* Hover/focus label. Hidden from assistive tech — the anchor already
            carries the same string as its accessible name. */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-black/85 px-3.5 py-2 text-sm font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 sm:block motion-reduce:transition-none"
        >
          {label}
        </span>
      </a>
    </motion.div>
  );
}
