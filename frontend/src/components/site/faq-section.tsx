'use client';

import { useLanguage } from '@/components/providers/language-provider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { WHATSAPP_URL } from '@/lib/site-links';

/**
 * FAQ accordion answering the UltraFit offer. Replaces the old "Get the guide"
 * placeholder section and reuses the same `#faq` scroll anchor conventions as
 * the other marketing sections. Bilingual + RTL via the language dictionary.
 */
export function FaqSection() {
  const { t } = useLanguage();
  const f = t.faq;

  return (
    <section id="faq" className="scroll-mt-28 border-t border-black/[0.08] px-6 py-24">
      <div className="mx-auto w-full max-w-3xl">
        {/* Intro */}
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-black/5 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-black/60 rtl:tracking-normal">
            <span className="size-1.5 rounded-full bg-brand shadow-[0_0_10px_#16924e]" />
            {f.eyebrow}
          </span>
          <h2 className="mt-6 text-3xl font-bold text-black sm:text-4xl">{f.heading}</h2>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-black/60 rtl:leading-loose">
            {f.subheading}
          </p>
        </div>

        {/* Questions */}
        <Accordion
          multiple={false}
          defaultValue={[f.items[0]?.id]}
          className="mt-12 w-full space-y-3"
        >
          {f.items.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="overflow-hidden rounded-2xl border border-black/10 bg-black/[0.03] px-2 backdrop-blur-sm transition-colors hover:border-black/20 data-[open]:border-brand/30 data-[open]:bg-black/[0.05]"
            >
              <AccordionTrigger className="px-4 py-5 text-base text-black/90 hover:text-black hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-5 pt-0 text-sm leading-relaxed text-black/60 rtl:leading-loose">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Closing nudge → WhatsApp */}
        <p className="mt-10 text-center text-sm text-black/50">
          {f.contactLead}{' '}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
          >
            {f.contactCta}
          </a>
        </p>
      </div>
    </section>
  );
}
