import type { Direction, Locale } from './config';

export type Dictionary = {
  dir: Direction;
  brand: string;
  nav: {
    products: string;
    useCases: string;
    about: string;
  };
  hero: {
    eyebrow: string;
    /** Headline is split so the closing phrase can be accented in brand color. */
    headlineLead: string;
    headlineAccent: string;
    subheadline: string;
    cta: string;
    secondaryCta: string;
    trustedBy: string;
  };
  sections: {
    comingSoon: string;
  };
  actions: {
    openMenu: string;
    closeMenu: string;
    switchLanguage: string;
    /** Display name of the currently active language. */
    languageName: string;
    /** Short label of the language the toggle switches TO. */
    otherLanguageShort: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  ar: {
    dir: 'rtl',
    brand: 'MotionCore',
    nav: {
      products: 'المنتجات',
      useCases: 'حالات الاستخدام',
      about: 'من نحن',
    },
    hero: {
      eyebrow: 'نظام MotionCore التدريبي',
      headlineLead: 'دليلك الكامل لتعلّم التمارين',
      headlineAccent: 'بدون أخطاء',
      subheadline:
        'بدلًا من تضييع الأشهر في التمارين الخاطئة، احصل على نظام تدريبي واضح مع شرح تفصيلي لكل حركة.',
      cta: 'احصل على الدليل',
      secondaryCta: 'شاهد كيف يعمل',
      trustedBy: 'مبني على أبحاث ومراجع موثوقة',
    },
    sections: {
      comingSoon: 'قريبًا',
    },
    actions: {
      openMenu: 'فتح القائمة',
      closeMenu: 'إغلاق القائمة',
      switchLanguage: 'التبديل إلى الإنجليزية',
      languageName: 'العربية',
      otherLanguageShort: 'EN',
    },
  },
  en: {
    dir: 'ltr',
    brand: 'MotionCore',
    nav: {
      products: 'Products',
      useCases: 'Use Cases',
      about: 'About Us',
    },
    hero: {
      eyebrow: 'The MotionCore training system',
      headlineLead: 'Your complete guide to learning every exercise,',
      headlineAccent: 'without mistakes',
      subheadline:
        'Instead of wasting months on the wrong exercises, get a clear training system with a detailed breakdown of every movement.',
      cta: 'Get the Guide',
      secondaryCta: 'See how it works',
      trustedBy: 'Built on trusted research & references',
    },
    sections: {
      comingSoon: 'Coming soon',
    },
    actions: {
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      switchLanguage: 'Switch to Arabic',
      languageName: 'English',
      otherLanguageShort: 'ع',
    },
  },
};
