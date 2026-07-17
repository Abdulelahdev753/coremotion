'use client';

import { ArrowDownToLine } from 'lucide-react';
import { motion, type Variants } from 'motion/react';

import { useLanguage } from '@/components/providers/language-provider';

// On GitHub Pages the site is served from /<repo>, so public assets referenced
// in plain <img> tags must be prefixed manually (Next only rewrites next/image).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const riseVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 0.7, bounce: 0 },
  },
};

const tileVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.55, bounce: 0 } },
};

/**
 * "About us" — narrative column (eyebrow, accented heading, lead/body, stat
 * strip) beside a 2×2 grid of value tiles whose second column is nudged down
 * for an offset rhythm. Replaces the old "coming soon" placeholder; bilingual
 * + RTL via the dictionary, scroll-reveal via Motion like the footer.
 */
export function AboutSection() {
  const { t } = useLanguage();
  const a = t.about;

  return (
    <section
      id="about"
      className="relative scroll-mt-28 overflow-hidden border-t border-black/[0.08] px-6 py-24"
    >
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-12 lg:gap-10"
      >
        {/* Narrative */}
        <div className="lg:col-span-7">
          <motion.span
            variants={riseVariants}
            className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-black/5 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-black/60 rtl:tracking-normal"
          >
            <span className="size-1.5 rounded-full bg-brand shadow-[0_0_10px_#16924e]" />
            {a.eyebrow}
          </motion.span>

          <motion.h2
            variants={riseVariants}
            className="mt-6 max-w-xl text-balance text-3xl font-bold leading-tight text-black sm:text-4xl rtl:leading-snug"
          >
            {a.headingLead} <span className="text-brand">{a.headingAccent}</span>
          </motion.h2>

          <motion.p
            variants={riseVariants}
            className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-black/80 rtl:leading-loose"
          >
            {a.lead}
          </motion.p>
          <motion.p
            variants={riseVariants}
            className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-black/55 rtl:leading-loose"
          >
            {a.body}
          </motion.p>

          {/* Stat strip */}
          <motion.dl
            variants={riseVariants}
            className="mt-10 flex max-w-xl divide-x divide-black/10 rounded-2xl border border-black/10 bg-black/[0.03] rtl:divide-x-reverse"
          >
            {a.stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-1 basis-0 flex-col items-center gap-1.5 px-3 py-4 text-center sm:px-5"
              >
                <dd className="order-first flex min-h-9 items-center justify-center font-mono text-2xl font-bold text-brand sm:text-3xl">
                  {stat.value === 'PDF' ? (
                    <ArrowDownToLine aria-hidden className="size-8" strokeWidth={2.5} />
                  ) : (
                    stat.value
                  )}
                </dd>
                <dt className="text-sm font-semibold leading-snug text-black">{stat.label}</dt>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Product mockup — the phone render replaces the old value tiles */}
        <motion.div
          variants={tileVariants}
          className="relative flex justify-center lg:col-span-5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static marketing render, optimization not needed */}
          <img
            src={`${basePath}/iphone-ultrafit-mockup.webp`}
            alt={`${a.headingLead} ${a.headingAccent}`}
            width={941}
            height={1672}
            loading="lazy"
            decoding="async"
            className="h-auto w-full max-w-[17rem] drop-shadow-2xl sm:max-w-xs lg:max-w-sm"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
