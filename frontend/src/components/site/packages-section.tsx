'use client';

import { useCallback, useState } from 'react';

import { useLanguage } from '@/components/providers/language-provider';
import {
  PackageAudiencePill,
  type PackageAudience,
} from '@/components/site/package-audience-pill';
import { PricingCards } from '@/components/site/pricing-cards';
import { WhatYouGet } from '@/components/site/what-you-get';
import { trackBeginCheckout } from '@/lib/analytics';
import { startCheckout } from '@/lib/checkout';
import { type PricingTierId } from '@/lib/payment-links';

/**
 * Owns the Men/Women audience selection and shares it across the packages
 * experience: the pill renders above the pricing cards, and the same value
 * filters "What You'll Get" down to that audience's three packages.
 */
export function PackagesSection() {
  const { t } = useLanguage();
  const [audience, setAudience] = useState<PackageAudience>('men');

  // "Buy now" collects the buyer's email (for PDF delivery), then mints a
  // single-use StreamPay link on the backend for the live audience (Men/Women)
  // + pressed tier and redirects the buyer to it in the same tab. Reads
  // `audience` from render scope so it reflects the live pill. Errors
  // propagate to PricingCards, which re-enables the dialog.
  const handleAddToCart = useCallback(
    async (tier: PricingTierId, email: string) => {
      const { url, packageKey, priceSar } = await startCheckout(audience, tier, email);
      // Report the funnel step before handing off. trackBeginCheckout never
      // throws, so a blocked tag can't stop the redirect to StreamPay.
      if (packageKey && typeof priceSar === 'number') {
        trackBeginCheckout(packageKey, priceSar);
      }
      window.location.href = url;
    },
    [audience],
  );

  return (
    <>
      <PricingCards
        onAddToCart={handleAddToCart}
        audience={audience}
        selector={
          <PackageAudiencePill
            value={audience}
            onValueChange={setAudience}
            labels={{ men: t.packages.men, women: t.packages.women }}
            ariaLabel={t.packages.audienceLabel}
          />
        }
      />
      <WhatYouGet audience={audience} />
    </>
  );
}
