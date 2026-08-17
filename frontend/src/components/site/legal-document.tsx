'use client';

import Link from 'next/link';

import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { useLanguage } from '@/components/providers/language-provider';
import { legalDocuments, LEGAL_UPDATED_ISO, type LegalDocumentKey } from '@/i18n/legal';
import { whatsappUrl } from '@/lib/site-links';

/**
 * Renders one legal document (/privacy or /terms) from `i18n/legal`.
 *
 * Deliberately static — no scroll-reveal here. The rest of the site animates
 * content in on view, but a policy is a document people skim, search with
 * ⌘F, and print; blurred-out sections below the fold would fight all three.
 *
 * Sections are numbered from the array index rather than the content, so
 * reordering or translating never leaves the two locales numbered differently.
 */
export function LegalDocument({ doc: key }: { doc: LegalDocumentKey }) {
  const { locale, t } = useLanguage();
  const doc = legalDocuments[key][locale];

  return (
    <main className="px-6 pb-24 pt-32 sm:px-8 lg:pt-36">
      <article className="mx-auto max-w-3xl">
        <header className="border-b border-black/[0.08] pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand rtl:tracking-normal">
            {doc.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-black sm:text-5xl rtl:leading-snug">
            {doc.title}
          </h1>
          <p className="mt-4 text-sm text-black/45">
            {doc.updatedLabel}:{' '}
            <time dateTime={LEGAL_UPDATED_ISO} className="font-semibold text-black/60">
              {doc.updatedDate}
            </time>
          </p>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-black/70 rtl:leading-loose">
            {doc.intro}
          </p>
        </header>

        {doc.sections.map((section, index) => (
          <section key={section.heading} className="mt-12">
            <h2 className="text-xl font-bold leading-snug text-black sm:text-2xl">
              {/* No dir override here: the marker has to inherit the document's
                  direction. Forcing LTR pins the full stop to the outer edge of
                  the line in Arabic, leaving the bare digit against the heading
                  — the bidi algorithm puts it on the inner side by itself. */}
              <span className="text-brand tabular-nums">{index + 1}.</span>{' '}
              {section.heading}
            </h2>

            {section.body?.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-4 text-pretty text-base leading-relaxed text-black/65 rtl:leading-loose"
              >
                {paragraph}
              </p>
            ))}

            {section.bullets && (
              <ul className="mt-4 space-y-3">
                {section.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="relative text-pretty ps-5 text-base leading-relaxed text-black/65 rtl:leading-loose"
                  >
                    {/* `start-0` + `ps-5` so the marker flips sides with the
                        document direction; the top offset centres it on the
                        first line at both line-heights. */}
                    <span
                      aria-hidden
                      className="absolute start-0 top-[0.6em] size-1.5 rounded-full bg-brand/70"
                    />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* Closing contact block — a policy that names WhatsApp as the way to
            exercise your rights has to actually hand you the chat. */}
        <aside className="mt-14 rounded-2xl border border-black/10 bg-black/[0.03] p-6 sm:p-8">
          <h2 className="text-lg font-bold text-black">{doc.contact.heading}</h2>
          <p className="mt-2 text-base leading-relaxed text-black/65 rtl:leading-loose">
            {doc.contact.body}
          </p>
          <div className="mt-6">
            <a
              href={whatsappUrl(t.support.generalMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-opacity duration-200 ease-out hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#f0f2f2] sm:w-auto"
            >
              <WhatsappIcon className="size-[18px]" />
              {doc.contact.cta}
            </a>
          </div>
        </aside>

        <div className="mt-10">
          {/* Link (not <a>) so the basePath of the Pages build is applied. */}
          <Link
            href="/"
            className="inline-flex rounded text-sm font-semibold text-black/50 transition-colors duration-200 ease-out hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
          >
            {doc.backToHome}
          </Link>
        </div>
      </article>
    </main>
  );
}
