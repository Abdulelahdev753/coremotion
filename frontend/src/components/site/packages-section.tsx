'use client';

import { useState } from 'react';

import { useLanguage } from '@/components/providers/language-provider';
import {
  PackageAudiencePill,
  type PackageAudience,
} from '@/components/site/package-audience-pill';
import { PricingCards } from '@/components/site/pricing-cards';
import { WhatYouGet } from '@/components/site/what-you-get';

/**
 * Owns the Men/Women audience selection and shares it across the packages
 * experience: the pill renders above the pricing cards, and the same value
 * filters "What You'll Get" down to that audience's three packages.
 */
export function PackagesSection() {
  const { t } = useLanguage();
  const [audience, setAudience] = useState<PackageAudience>('men');

  return (
    <>
      <PricingCards
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
