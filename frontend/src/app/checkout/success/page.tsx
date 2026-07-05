'use client';

import { Check, Download, Loader2, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useLanguage } from '@/components/providers/language-provider';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

const COPY = {
  ar: {
    loading: 'جارٍ تأكيد عملية الدفع…',
    title: 'تم الدفع بنجاح!',
    body: 'برنامجك جاهز — التحميل سيبدأ تلقائيًا خلال لحظات.',
    order: 'رقم الطلب',
    download: (kind: string) => `تحميل البرنامج (${kind})`,
    emailNote: 'ستصلك المنتجات أيضًا على بريدك الإلكتروني قريبًا.',
    manual: 'لم يبدأ التحميل؟ اضغط الزر بالأعلى.',
    home: 'العودة للرئيسية',
    notFoundTitle: 'لم نعثر على الطلب',
    notFoundBody: 'تحقق من الرابط، أو تواصل مع الدعم إذا كنت متأكدًا من إتمام الدفع.',
  },
  en: {
    loading: 'Confirming your payment…',
    title: 'Payment successful!',
    body: 'Your program is ready — the download will start automatically in a moment.',
    order: 'Order number',
    download: (kind: string) => `Download program (${kind})`,
    emailNote: 'You will also receive the products in your email soon.',
    manual: "Download didn't start? Use the button above.",
    home: 'Back to home',
    notFoundTitle: 'Order not found',
    notFoundBody: "Check the link, or contact support if you're sure the payment went through.",
  },
} as const;

type PaidStatus = {
  status: 'paid';
  download_url: string;
  order_number?: string;
  file_name?: string;
};

/**
 * Post-payment landing: confirms the order, auto-starts the file download, and
 * leaves the buyer a manual download button plus the email-delivery reminder.
 * Pending orders are handed to /checkout/processing/ which polls until ready.
 */
export default function CheckoutSuccessPage() {
  const { locale, dir } = useLanguage();
  const t = COPY[locale];
  const [state, setState] = useState<'loading' | 'ready' | 'notfound'>('loading');
  const [order, setOrder] = useState<PaidStatus | null>(null);
  const autoStarted = useRef(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      window.location.replace('/');
      return;
    }

    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/checkout/status?token=${encodeURIComponent(token)}`,
        );
        if (!active) return;
        if (res.ok) {
          const data = (await res.json()) as {
            status?: string;
            download_url?: string;
            order_number?: string;
            file_name?: string;
          };
          if (data.status === 'paid' && data.download_url) {
            setOrder(data as PaidStatus);
            setState('ready');
            return;
          }
          if (data.status === 'pending') {
            window.location.replace(`/checkout/processing/?token=${encodeURIComponent(token)}`);
            return;
          }
        }
        setState('notfound');
      } catch {
        if (active) setState('notfound');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Kick off the download once, shortly after the confirmation renders so the
  // buyer sees the success state before the browser's download UI appears.
  useEffect(() => {
    if (state !== 'ready' || !order || autoStarted.current) return;
    autoStarted.current = true;
    const timer = setTimeout(() => {
      const a = document.createElement('a');
      a.href = order.download_url;
      a.download = order.file_name ?? '';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }, 700);
    return () => clearTimeout(timer);
  }, [state, order]);

  const fileKind = order?.file_name?.toLowerCase().endsWith('.zip') ? 'ZIP' : 'PDF';

  return (
    <main dir={dir} className="checkout-result">
      {state === 'loading' && (
        <div className="checkout-result__card" role="status">
          <Loader2 size={36} strokeWidth={2.5} className="animate-spin" aria-hidden />
          <p className="checkout-result__body">{t.loading}</p>
        </div>
      )}

      {state === 'ready' && order && (
        <div className="checkout-result__card">
          <span className="checkout-result__badge checkout-result__badge--success" aria-hidden>
            <Check size={34} strokeWidth={3} />
          </span>
          <h1 className="checkout-result__title">{t.title}</h1>
          {order.order_number && (
            <p className="checkout-result__order" dir="ltr">
              {t.order}: <strong>{order.order_number}</strong>
            </p>
          )}
          <p className="checkout-result__body">{t.body}</p>
          <div className="checkout-result__actions">
            <a
              className="checkout-result__btn checkout-result__btn--primary"
              href={order.download_url}
              download={order.file_name ?? true}
            >
              <Download size={18} strokeWidth={2.5} aria-hidden />
              {t.download(fileKind)}
            </a>
            <a className="checkout-result__btn checkout-result__btn--ghost" href="/">
              {t.home}
            </a>
          </div>
          <p className="checkout-result__note">
            <Mail size={16} strokeWidth={2.5} aria-hidden />
            {t.emailNote}
          </p>
          <p className="checkout-result__hint">{t.manual}</p>
        </div>
      )}

      {state === 'notfound' && (
        <div className="checkout-result__card">
          <h1 className="checkout-result__title">{t.notFoundTitle}</h1>
          <p className="checkout-result__body">{t.notFoundBody}</p>
          <div className="checkout-result__actions">
            <a className="checkout-result__btn checkout-result__btn--ghost" href="/">
              {t.home}
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
