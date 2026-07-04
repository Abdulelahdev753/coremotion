'use client';

import { Download, FlaskConical, PlayCircle, Users } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import type { ComponentType } from 'react';

import { useLanguage } from '@/components/providers/language-provider';

// Icons for the four value tiles, in the dictionary's `about.values` order:
// research-based, men & women, instant delivery, every movement explained.
const valueIcons: Array<ComponentType<{ className?: string }>> = [
  FlaskConical,
  Users,
  Download,
  PlayCircle,
];

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
      className="relative scroll-mt-28 overflow-hidden border-t border-white/[0.06] px-6 py-24"
    >
      {/* Faint brand glow anchored behind the narrative column */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 start-[-10%] h-96 w-[36rem] rounded-full bg-brand/[0.05] blur-3xl"
      />

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
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white/60 rtl:tracking-normal"
          >
            <span className="size-1.5 rounded-full bg-brand shadow-[0_0_10px_#d6ec1b]" />
            {a.eyebrow}
          </motion.span>

          <motion.h2
            variants={riseVariants}
            className="mt-6 max-w-xl text-balance text-3xl font-bold leading-tight text-white sm:text-4xl rtl:leading-snug"
          >
            {a.headingLead} <span className="text-brand">{a.headingAccent}</span>
          </motion.h2>

          <motion.p
            variants={riseVariants}
            className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/80 rtl:leading-loose"
          >
            {a.lead}
          </motion.p>
          <motion.p
            variants={riseVariants}
            className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/55 rtl:leading-loose"
          >
            {a.body}
          </motion.p>

          {/* Stat strip */}
          <motion.dl
            variants={riseVariants}
            className="mt-10 flex max-w-xl flex-wrap divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] rtl:divide-x-reverse"
          >
            {a.stats.map((stat) => (
              <div key={stat.label} className="flex min-w-32 flex-1 flex-col gap-1 px-5 py-4">
                <dd className="order-first font-mono text-2xl font-bold text-brand sm:text-3xl">
                  {stat.value}
                </dd>
                <dt className="text-xs leading-snug text-white/50">{stat.label}</dt>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Value tiles — second column offset for rhythm on large screens */}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5">
          {a.values.map((value, index) => {
            const Icon = valueIcons[index] ?? FlaskConical;
            return (
              <motion.article
                key={value.title}
                variants={tileVariants}
                className={
                  'group rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-colors duration-300 hover:border-brand/30 hover:bg-white/[0.05]' +
                  (index % 2 === 1 ? ' sm:translate-y-6' : '')
                }
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand transition-shadow duration-300 group-hover:shadow-[0_0_24px_-8px_#d6ec1b]">
                  <Icon aria-hidden className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-white">{value.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55 rtl:leading-loose">
                  {value.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
