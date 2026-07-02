'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useLanguage } from '@/components/providers/language-provider';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 60; // ~2 minutes

const COPY = {
  ar: {
    title: 'جارٍ تجهيز التحميل…',
    body: 'نؤكد عملية الدفع ونُجهّز رابط التحميل الخاص بك. لا تُغلق هذه الصفحة.',
    timeout:
      'اكتمل الدفع، لكن التحميل يستغرق وقتًا أطول من المعتاد. حدّث الصفحة بعد قليل أو تواصل مع الدعم.',
  },
  en: {
    title: 'Preparing your download…',
    body: "We're confirming your payment and generating your download link. Please don't close this page.",
    timeout:
      'Your payment went through, but the download is taking longer than usual. Refresh in a moment or contact support.',
  },
} as const;

/**
 * Fallback landing for the rare case where the buyer returns from StreamPay
 * before payment is confirmed. Polls /api/checkout/status with the order token
 * and redirects to the signed PDF URL as soon as it's ready.
 */
export default function CheckoutProcessingPage() {
  const { locale, dir } = useLanguage();
  const t = COPY[locale];
  const [timedOut, setTimedOut] = useState(false);

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
            window.location.replace(data.download_url);
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
        background: '#0a0a0a',
        color: '#fafafa',
      }}
    >
      {!timedOut && <Loader2 size={40} strokeWidth={2.5} className="animate-spin" aria-hidden />}
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
        {timedOut ? '⏳' : t.title}
      </h1>
      <p style={{ maxWidth: '28rem', opacity: 0.8, lineHeight: 1.6, margin: 0 }}>
        {timedOut ? t.timeout : t.body}
      </p>
    </main>
  );
}
