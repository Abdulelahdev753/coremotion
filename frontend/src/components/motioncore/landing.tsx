'use client';

import { Activity, Dumbbell, Flame, LineChart } from 'lucide-react';
import Link from 'next/link';

import { MotionCoreShell } from '@/components/motioncore/motioncore-shell';
import { useMotionCoreStore } from '@/components/motioncore/use-motioncore-store';
import { useLanguage } from '@/components/providers/language-provider';

const FEATURE_ICONS = [Flame, Activity, Dumbbell, LineChart];

export function MotionCoreLanding() {
  const { t } = useLanguage();
  const { status } = useMotionCoreStore();
  const tl = t.motioncore.landing;

  const hasProfile = status === 'ready';

  return (
    <MotionCoreShell>
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="inline-flex animate-in fade-in slide-in-from-bottom-2 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/75 fill-mode-both duration-700">
          <span className="size-1.5 rounded-full bg-brand shadow-[0_0_10px_#d6ec1b]" />
          {tl.eyebrow}
        </span>

        <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.2] text-white ltr:tracking-tight sm:text-5xl rtl:leading-[1.4]">
          {tl.headlineLead}{' '}
          <span className="bg-gradient-to-br from-brand to-[#a9c20f] bg-clip-text text-transparent">
            {tl.headlineAccent}
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg rtl:leading-loose">
          {tl.subheadline}
        </p>

        <div className="mt-9 flex animate-in fade-in slide-in-from-bottom-3 flex-col items-center gap-3 fill-mode-both delay-200 duration-700 sm:flex-row">
          <Link
            href={hasProfile ? '/motioncore/dashboard' : '/motioncore/assessment'}
            className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3.5 text-base font-semibold text-black shadow-[0_10px_40px_-10px_#d6ec1b] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_50px_-8px_#d6ec1b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b0d]"
          >
            {hasProfile ? tl.resumeCta : tl.startCta}
          </Link>
          {hasProfile ? (
            <Link
              href="/motioncore/assessment"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-base font-medium text-white/85 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
            >
              {tl.retakeCta}
            </Link>
          ) : null}
        </div>
      </div>

      {/* Feature grid */}
      <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        {tl.features.map((feature, index) => {
          const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
          return (
            <div
              key={feature.title}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-brand/30 hover:bg-white/[0.07]"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand transition-shadow group-hover:shadow-[0_0_20px_-6px_#d6ec1b]">
                <Icon aria-hidden className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-white">{feature.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55 rtl:leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-14 text-center text-xs text-white/35">{tl.disclaimer}</p>
    </MotionCoreShell>
  );
}
