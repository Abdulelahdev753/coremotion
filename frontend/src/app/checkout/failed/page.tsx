'use client';

import { MessageCircle, RotateCcw, X } from 'lucide-react';

import { useLanguage } from '@/components/providers/language-provider';
import { WHATSAPP_URL } from '@/lib/site-links';

const COPY = {
  ar: {
    title: 'لم تكتمل عملية الدفع',
    body: 'تم إلغاء الدفع أو تعذّر إتمامه، ولم يتم تفعيل أي طلب. يمكنك المحاولة مرة أخرى في أي وقت.',
    retry: 'المحاولة مرة أخرى',
    support: 'تواصل مع الدعم',
  },
  en: {
    title: 'Payment not completed',
    body: 'The payment was cancelled or could not be completed, and no order was placed. You can try again any time.',
    retry: 'Try again',
    support: 'Contact support',
  },
} as const;

/** Landing for StreamPay's failure redirect — reassure and route back to buy. */
export default function CheckoutFailedPage() {
  const { locale, dir } = useLanguage();
  const t = COPY[locale];

  return (
    <main dir={dir} className="checkout-result">
      <div className="checkout-result__card">
        <span className="checkout-result__badge checkout-result__badge--failed" aria-hidden>
          <X size={34} strokeWidth={3} />
        </span>
        <h1 className="checkout-result__title">{t.title}</h1>
        <p className="checkout-result__body">{t.body}</p>
        <div className="checkout-result__actions">
          <a className="checkout-result__btn checkout-result__btn--primary" href="/#products">
            <RotateCcw size={18} strokeWidth={2.5} aria-hidden />
            {t.retry}
          </a>
          <a
            className="checkout-result__btn checkout-result__btn--ghost"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} strokeWidth={2.5} aria-hidden />
            {t.support}
          </a>
        </div>
      </div>
    </main>
  );
}
