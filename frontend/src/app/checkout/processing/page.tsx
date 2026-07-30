'use client';

import { Loader2, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useLanguage } from '@/components/providers/language-provider';
import { trackContactSupport } from '@/lib/analytics';
import { whatsappUrl } from '@/lib/site-links';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 60; // ~2 minutes

const COPY = {
  ar: {
    title: 'جارٍ تجهيز التحميل…',
    body: 'نؤكد عملية الدفع ونُجهّز رابط التحميل الخاص بك. لا تُغلق هذه الصفحة.',
    timeout:
      'اكتمل الدفع، لكن التحميل يستغرق وقتًا أطول من المعتاد. حدّث الصفحة بعد قليل أو تواصل مع الدعم.',
    expiredTitle: 'انتهت صلاحية رابط التحميل',
    expired:
      'برنامجك مرفق في رسالة البريد التي أرسلناها لك. راسلنا على واتساب وسنعيد إرسال البرنامج.',
  },
  en: {
    title: 'Preparing your download…',
    body: "We're confirming your payment and generating your download link. Please don't close this page.",
    timeout:
      'Your payment went through, but the download is taking longer than usual. Refresh in a moment or contact support.',
    expiredTitle: 'Your download link has expired',
    expired:
      "Your program is attached to the email we sent you. Message us on WhatsApp and we'll resend it.",
  },
} as const;

/**
 * Fallback landing for the rare case where the buyer returns from StreamPay
 * before payment is confirmed. Polls /api/checkout/status with the order token
 * and hands off to /checkout/success/ as soon as the payment is confirmed.
 */
export default function CheckoutProcessingPage() {
  const { locale, dir, t: dict } = useLanguage();
  const t = COPY[locale];
  const [timedOut, setTimedOut] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      window.location.replace('/');
      return;
    }

    let attempts = 0;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(
          `${API_BASE}/api/checkout/status?token=${encodeURIComponent(token)}`,
        );
        if (res.ok) {
          const data = (await res.json()) as { status?: string; download_url?: string };
          if (data.status === 'paid' && data.download_url) {
            window.location.replace(`/checkout/success/?token=${encodeURIComponent(token)}`);
            return;
          }
          // A reloaded processing URL from hours ago: the window has closed, so
          // stop polling now instead of spinning for two minutes first.
          if (data.status === 'expired') {
            setExpired(true);
            return;
          }
        }
      } catch {
        /* transient network error — keep polling */
      }
      if (!active) return;
      if (attempts >= MAX_ATTEMPTS) {
        setTimedOut(true);
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <main
      dir={dir}
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
        background: '#f0f2f2',
        color: '#0a0b0d',
      }}
    >
      {!timedOut && !expired && (
        <Loader2 size={40} strokeWidth={2.5} className="animate-spin" aria-hidden />
      )}
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
        {expired ? t.expiredTitle : timedOut ? '⏳' : t.title}
      </h1>
      <p style={{ maxWidth: '28rem', opacity: 0.8, lineHeight: 1.6, margin: 0 }}>
        {expired ? t.expired : timedOut ? t.timeout : t.body}
      </p>
      {/* Only once polling has given up or the window has closed: until then the
          download is still expected to arrive on its own and support has nothing
          to fix. The button classes are global (globals.css), so they work
          outside the .checkout-result wrapper the other result pages use. */}
      {(timedOut || expired) && (
        <a
          className="checkout-result__btn checkout-result__btn--primary"
          href={whatsappUrl(dict.support.orderIssueMessage)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackContactSupport(expired ? 'checkout_link_expired' : 'checkout_processing_timeout')
          }
        >
          <MessageCircle size={18} strokeWidth={2.5} aria-hidden />
          {dict.support.cta}
        </a>
      )}
    </main>
  );
}
