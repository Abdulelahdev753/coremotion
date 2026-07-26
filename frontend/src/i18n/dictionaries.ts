import type { Direction, Locale } from './config';

/** A choice rendered as a selectable card in the MotionCore assessment. */
type OptionText = { label: string; description: string };

/** One pricing tier's translatable copy (visuals/price are set in the component). */
type PricingTier = {
  badge: string;
  name: string;
  tagline: string;
  /** Shown above the feature list on upper tiers, e.g. "Everything in Basic". */
  includes?: string;
  features: string[];
  /** Optional closing line under the features. */
  note?: string;
};

export type Dictionary = {
  dir: Direction;
  brand: string;
  nav: {
    products: string;
    whatYouGet: string;
    about: string;
    motioncore: string;
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
  /** "About us" section — narrative + value tiles + a short stat strip. */
  about: {
    eyebrow: string;
    /** Heading is split so the closing phrase can be accented in brand color. */
    headingLead: string;
    headingAccent: string;
    lead: string;
    body: string;
    /** Value tiles beside the narrative. */
    values: Array<{ title: string; description: string }>;
    /** Stat strip under the narrative. */
    stats: Array<{ value: string; label: string }>;
  };
  /** FAQ accordion — replaces the old "Get the guide" placeholder section. */
  faq: {
    eyebrow: string;
    heading: string;
    subheading: string;
    /** Each item's `id` doubles as its accordion value; the first is open by default. */
    items: Array<{ id: string; question: string; answer: string }>;
    /** Closing line + link that nudges undecided visitors back to the packages. */
    contactLead: string;
    contactCta: string;
  };
  /** Men/Women selector that drives both the pricing and "what you'll get" sections. */
  packages: {
    /** Group label for assistive tech on the audience pill. */
    audienceLabel: string;
    men: string;
    women: string;
  };
  /** "What you'll get" — package mockups (one per tier × gender) with captions. */
  whatYouGet: {
    heading: string;
    subheading: string;
    /** Six captions, ordered men: basic/pro/elite, then women: basic/pro/elite. */
    items: Array<{ title: string; description: string }>;
  };
  pricing: {
    heading: string;
    subheading: string;
    /** Currency label shown after each price. */
    currency: string;
    addToCart: string;
    buyNow: string;
    /** Pre-checkout email dialog — the PDF is emailed here after payment. */
    emailTitle: string;
    emailSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    emailInvalid: string;
    emailContinue: string;
    emailCancel: string;
    /** Trust/reassurance bar shown below the cards. Icons live in the component,
        in this same order (shield, download, infinity, headset). */
    trust: Array<{ title: string; description: string }>;
    /** Promo header between the Men/Women pill and the cards. Audience-aware so
        the wording (and Arabic gendered endings) suit men vs women. */
    promo: Record<
      'men' | 'women',
      { eyebrow: string; heading: string; subheading: string }
    >;
    /** Tier copy differs per audience — the Men/Women pill picks the set. */
    tiers: Record<
      'men' | 'women',
      {
        basic: PricingTier;
        pro: PricingTier;
        elite: PricingTier;
      }
    >;
  };
  /** Site footer — brand block, nav columns, socials, and legal links. */
  footer: {
    tagline: string;
    /** Column titles + link labels; hrefs/order live in the footer component. */
    columns: Array<{ title: string; links: string[] }>;
    legal: string[];
    /** Accessible labels for the social icons, in the component's icon order. */
    socials: string[];
    copyright: string;
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
  motioncore: {
    meta: {
      title: string;
      description: string;
    };
    landing: {
      eyebrow: string;
      /** Headline split so the closing phrase can be accented in brand color. */
      headlineLead: string;
      headlineAccent: string;
      subheadline: string;
      startCta: string;
      resumeCta: string;
      retakeCta: string;
      features: Array<{ title: string; description: string }>;
      disclaimer: string;
    };
    assessment: {
      title: string;
      /** Template: {current} and {total} are replaced with step numbers. */
      stepOf: string;
      steps: {
        basics: string;
        activity: string;
        goal: string;
        preferences: string;
      };
      fields: {
        sex: string;
        age: string;
        heightCm: string;
        weightKg: string;
        activity: string;
        trainingLevel: string;
        daysPerWeek: string;
        goal: string;
        pace: string;
        equipment: string;
        exclusions: string;
        bodyFatPercent: string;
        bmrFormula: string;
        currentAverageSteps: string;
      };
      optional: string;
      /** Short helper lines under the optional inputs. */
      hints: {
        bodyFat: string;
        formula: string;
        steps: string;
      };
      options: {
        sex: { male: string; female: string };
        bmrFormula: {
          auto: OptionText;
          mifflin: OptionText;
          katch: OptionText;
        };
        activity: {
          sedentary: OptionText;
          light: OptionText;
          moderate: OptionText;
          very: OptionText;
          athlete: OptionText;
        };
        trainingLevel: {
          beginner: OptionText;
          intermediate: OptionText;
          advanced: OptionText;
        };
        goal: {
          fatLoss: OptionText;
          muscleGain: OptionText;
          fitness: OptionText;
        };
        pace: {
          gentle: OptionText;
          standard: OptionText;
          aggressive: OptionText;
        };
        equipment: {
          none: OptionText;
          dumbbells: OptionText;
          gym: OptionText;
        };
        exclusions: {
          dairy: string;
          eggs: string;
          nuts: string;
          gluten: string;
          seafood: string;
        };
      };
      /** Template: {n} is replaced with the number of training days. */
      daysLabel: string;
      /** Template: {percent} is the signed % of maintenance calories. */
      paceHint: string;
      maintainHint: string;
      /** Template: {min} and {max} are replaced with the field bounds. */
      rangeError: string;
      /** Shown when Katch–McArdle is chosen without a usable body-fat reading. */
      katchNeedsBodyFat: string;
      next: string;
      back: string;
      finish: string;
    };
    dashboard: {
      title: string;
      subtitle: string;
      editAssessment: string;
      targets: {
        calories: string;
        protein: string;
        carbs: string;
        fat: string;
        water: string;
        steps: string;
      };
      /** Template: {rate} is replaced with the signed kg-per-week rate. */
      expectedRate: string;
      floorNotice: string;
      macrosTitle: string;
      /** How the calorie target was derived, shown as a labelled breakdown. */
      results: {
        title: string;
        formulaLabel: string;
        formulas: { mifflin: string; katch: string };
        bmrLabel: string;
        bmrExplanation: string;
        tdeeLabel: string;
        tdeeExplanation: string;
        goalAdjustmentLabel: string;
        goalAdjustmentExplanation: string;
        targetLabel: string;
        /** Template: {kcal} — calories rebuilt from the rounded macro grams. */
        macroCaloriesNote: string;
        warnings: { calorieMinimum: string; proteinCap: string };
      };
      hydration: {
        title: string;
        /** "Estimated daily hydration reference" — never a prescription. */
        subtitle: string;
        totalWaterLabel: string;
        beverageLabel: string;
        splitNote: string;
        doNotAddNote: string;
        increaseNote: string;
        safety: string;
        /** Thirst / urine-colour feedback bullets. */
        feedback: string[];
        sweat: {
          title: string;
          intro: string;
          fields: {
            preExerciseWeightKg: string;
            postExerciseWeightKg: string;
            exerciseDurationMinutes: string;
            fluidConsumedLiters: string;
            urineProducedLiters: string;
            hotOrHumid: string;
          };
          submit: string;
          results: {
            netSweatLoss: string;
            sweatRate: string;
            dehydration: string;
            replacement: string;
            drinkingRate: string;
          };
          replacementNote: string;
          drinkingRateNote: string;
          errors: { value: string; duration: string };
          warnings: {
            dehydration: string;
            highSweatRate: string;
            highDrinkingRate: string;
            hotConditions: string;
          };
        };
      };
      walking: {
        title: string;
        /** "Recommended daily walking target" — evidence-informed, not exact. */
        subtitle: string;
        targetLabel: string;
        /** Template: {min} and {max} are the target range bounds. */
        rangeLabel: string;
        generalReferenceLabel: string;
        currentLabel: string;
        nextTargetLabel: string;
        nextTargetHint: string;
        alreadyMeets: string;
        evidenceNote: string;
        /** Weekly physical-activity guidance bullets. */
        guidance: string[];
        intensityNote: string;
        calorieNote: string;
        weightLossNote: string;
      };
      meals: {
        title: string;
        approxNote: string;
        slots: {
          breakfast: string;
          lunch: string;
          dinner: string;
          snack: string;
          snack2: string;
        };
        total: string;
      };
      workout: {
        title: string;
        /** Template: {seconds} is replaced with the rest duration. */
        rest: string;
        sets: string;
      };
      weight: {
        title: string;
        weightLabel: string;
        dateLabel: string;
        add: string;
        empty: string;
        needMorePoints: string;
        expectedTrend: string;
        latest: string;
      };
      hints: {
        title: string;
        onTrack: string;
        tooFast: string;
        tooSlow: string;
        /** Templates: {kcal} is replaced with the suggested daily adjustment. */
        increase: string;
        reduce: string;
        needMoreData: string;
      };
      empty: {
        title: string;
        body: string;
      };
      loading: string;
    };
    units: {
      kcal: string;
      g: string;
      kg: string;
      cm: string;
      years: string;
      liters: string;
      steps: string;
      percent: string;
      minutes: string;
      litersPerHour: string;
    };
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  ar: {
    dir: 'rtl',
    brand: 'UltraFit',
    nav: {
      products: 'المنتجات',
      whatYouGet: 'ماذا ستحصل عليه',
      about: 'من نحن',
      motioncore: 'احسب سعراتك',
    },
    hero: {
      eyebrow: 'نظام MotionCore التدريبي',
      headlineLead: 'غيّر جسمك بخطة تدريب مدروسة',
      headlineAccent: 'خلال 12 أسبوع',
      subheadline:
        'برنامج تمارين متكامل، فيديو شرح لكل تمرين، كتيب بناء العضلات، وخطة كارديو.',
      cta: 'احصل على الدليل',
      secondaryCta: 'احسب سعراتك',
      trustedBy: 'مبني على أبحاث ومراجع موثوقة',
    },
    about: {
      eyebrow: 'من نحن',
      headingLead: 'تدريب مبني على العلم،',
      headingAccent: 'مصمم لهدفك',
      lead: 'UltraFit فريق شغوف بالتدريب الصحيح. نحوّل الأبحاث العلمية الموثوقة إلى أدلة تدريب وتغذية عملية وواضحة — بدون تعقيد وبدون اجتهادات عشوائية.',
      body: 'بدأنا UltraFit لأننا رأينا كثيرين يضيّعون شهورًا بين تمارين خاطئة ومعلومات متضاربة. مهمتنا أن نختصر عليك الطريق: خطط مدروسة خطوة بخطوة، شرح واضح لكل حركة، ونظام MotionCore الذي يساعدك على اختيار ما يناسب جسمك وهدفك.',
      values: [
        {
          title: 'مبني على الأبحاث',
          description: 'كل خطة مستندة إلى مراجع موثوقة مثل PubMed وNSCA وElsevier — لا اجتهادات عشوائية.',
        },
        {
          title: 'للرجال والنساء',
          description: 'كل باقة متوفرة بنسختين مصممتين خصيصًا لكل فئة وأهدافها.',
        },
        {
          title: 'تسليم فوري',
          description: 'ملفات PDF تصلك فور إتمام الدفع — بدون انتظار وبدون شحن.',
        },
        {
          title: 'شرح لكل حركة',
          description: 'روابط فيديو توضح طريقة أداء التمارين حتى تتدرب بثقة ومن دون أخطاء.',
        },
      ],
      stats: [
        { value: '12', label: 'أسبوعًا من التدرج المدروس' },
        { value: '6', label: 'باقات لكل مستوى وهدف' },
        { value: 'PDF', label: 'تسليم رقمي فوري' },
      ],
    },
    faq: {
      eyebrow: 'الأسئلة الشائعة',
      heading: 'أسئلة شائعة عن UltraFit',
      subheading:
        'كل ما تحتاج معرفته قبل أن تبدأ رحلتك مع UltraFit. لم تجد إجابتك؟ تصفّح الباقات وابدأ الآن.',
      items: [
        {
          id: 'faq-1',
          question: 'ما هو UltraFit؟',
          answer:
            'UltraFit برنامج تدريبي رقمي على شكل أدلة PDF قابلة للتحميل، تضم خطة تمارين كاملة وتوجيهًا غذائيًا وشرحًا بالفيديو لكل حركة — متوفّر للرجال والنساء ومن الباقة الأساسية إلى النخبة.',
        },
        {
          id: 'faq-2',
          question: 'كيف أستلم الدليل بعد الشراء؟',
          answer:
            'فور إتمام الدفع يصلك رابط تحميل آمن لملف الدليل (PDF) مباشرةً — بدون انتظار وبدون شحن. الرابط صالح لتحميل نسختك خلال مدة محدودة بعد الشراء.',
        },
        {
          id: 'faq-3',
          question: 'هل الباقات مناسبة للمبتدئين؟',
          answer:
            'نعم. الباقة الأساسية مصمّمة للمبتدئين بهيكل بسيط وإرشادات واضحة لأداء كل تمرين، بينما تضيف باقتا برو والنخبة برنامجًا متدرّجًا مدته 12 أسبوعًا كلما تقدّمت في مستواك.',
        },
        {
          id: 'faq-4',
          question: 'ما الفرق بين الأساسية وبرو والنخبة؟',
          answer:
            'الأساسية تمنحك خطة تمارين مخصّصة وإرشادات للأداء؛ وبرو تضيف تحوّلًا كاملًا مدته 12 أسبوعًا مع كارديو متدرّج؛ والنخبة تضيف نظامًا غذائيًا متقدّمًا وتخصيصًا كاملًا حسب هدفك.',
        },
        {
          id: 'faq-5',
          question: 'هل توجد باقات للرجال والنساء؟',
          answer:
            'نعم. كل باقة متوفّرة بنسختين — واحدة للرجال وأخرى للنساء — مع تدريب وتغذية مصمّمَين خصيصًا لكل فئة.',
        },
        {
          id: 'faq-6',
          question: 'هل البرنامج مبني على أسس علمية؟',
          answer:
            'كل خطة مبنية على أبحاث ومراجع موثوقة مثل PubMed وNSCA وElsevier وغيرها، وليست مجرد اجتهادات عشوائية.',
        },
        {
          id: 'faq-7',
          question: 'ما هو نظام MotionCore؟',
          answer:
            'MotionCore هو نظام التحليل المرافق الذي يقيّم حركتك ومستواك ويساعدك على اختيار الباقة الأنسب لك قبل الشراء.',
        },
      ],
      contactLead: 'لم تجد إجابة سؤالك؟',
      contactCta: 'راسلنا على واتساب',
    },
    packages: {
      audienceLabel: 'اختر فئة الباقات',
      men: 'رجال',
      women: 'نساء',
    },
    whatYouGet: {
      heading: 'ماذا ستحصل عليه',
      subheading: 'محتوى كل باقة بالتفصيل — للرجال والنساء، من الأساسية إلى النخبة.',
      items: [
        {
          title: 'الباقة الأساسية — رجال',
          description: 'ملف تدريبي كامل + دليل تعليمي مع فيديو لكل تمرين وخطة كارديو للمبتدئين.',
        },
        {
          title: 'باقة برو — رجال',
          description: 'تحدّي 12 أسبوعًا بجداول تدريب متدرّجة والملف التعليمي الشامل المبني على الأبحاث.',
        },
        {
          title: 'باقة النخبة — رجال',
          description: 'تدريب + تغذية + تعليم في ثلاثة ملفات متكاملة لتحويل جسمك بالكامل.',
        },
        {
          title: 'الباقة الأساسية — نساء',
          description: 'جداول تدريب كاملة (3-4-5 أيام) + دليل تعليمي مبسّط مناسب للمبتدئات.',
        },
        {
          title: 'باقة برو — نساء',
          description: 'تحدّي 12 أسبوعًا لنحت الجسم خطوة بخطوة مع دليل تدريبي وتعليمي متكامل.',
        },
        {
          title: 'باقة النخبة — نساء',
          description: 'تدريب وتغذية وتعليم متقدّم — النظام المتكامل للوصول إلى هدفك.',
        },
      ],
    },
    pricing: {
      heading: 'اختر باقة UltraFit المناسبة لك',
      subheading: 'ثلاث باقات مبنية حول هدفك — ابدأ ببساطة أو انطلق بالكامل.',
      currency: 'ر.س',
      addToCart: 'أضف إلى السلة',
      buyNow: 'اشترِ الآن',
      emailTitle: 'أين نرسل برنامجك؟',
      emailSubtitle: 'سنرسل ملف البرنامج (PDF) إلى بريدك مباشرة بعد إتمام الدفع.',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'name@example.com',
      emailInvalid: 'يرجى إدخال بريد إلكتروني صحيح.',
      emailContinue: 'المتابعة للدفع',
      emailCancel: 'إلغاء',
      trust: [
        { title: 'دفع آمن 100%', description: 'جميع عمليات الدفع مشفرة وآمنة' },
        { title: 'تحميل فوري', description: 'استلم ملفاتك مباشرة بعد الدفع' },
        { title: 'وصول مدى الحياة', description: 'يمكنك الوصول لملفاتك في أي وقت' },
        { title: 'دعم سريع', description: 'نحن هنا لمساعدتك في أي وقت' },
      ],
      promo: {
        men: {
          eyebrow: 'اختر الباقة المناسبة لك',
          heading: 'تحدي 12 أسبوع لتحقيق أفضل نسخة منك',
          subheading: 'ثلاث باقات مصممة لتناسب أهدافك وميزانيتك',
        },
        women: {
          eyebrow: 'اختاري الباقة المناسبة لكِ',
          heading: 'تحدي 12 أسبوع لتحقيق أفضل نسخة منكِ',
          subheading: 'ثلاث باقات مصممة لتناسب أهدافكِ وميزانيتكِ',
        },
      },
      tiers: {
        men: {
          basic: {
            badge: 'أساسية',
            name: 'Basic',
            tagline: 'الدفع لمرة واحدة',
            features: [
              'جدول تمارين متكامل (PDF)',
              'فيديو شرح لكل تمرين',
              'جدول كارديو',
              'كتيب كامل عن بناء العضلات',
            ],
          },
          pro: {
            badge: 'برو',
            name: 'Pro',
            tagline: 'الدفع لمرة واحدة',
            includes: 'تحدي 12 أسبوع',
            features: [
              'جدول تمارين لمدة 12 أسبوع',
              'تغيير التمارين كل 4 أسابيع',
              'فيديو شرح لكل تمرين',
              'جدول كارديو',
              'كتيب كامل عن بناء العضلات',
            ],
          },
          elite: {
            badge: 'النخبة',
            name: 'Elite',
            tagline: 'الدفع لمرة واحدة',
            includes: 'التجربة الكاملة',
            features: [
              'تحدي تمارين لمدة 12 أسبوع',
              'تغيير التمارين كل 4 أسابيع',
              'فيديو شرح لكل تمرين',
              'جدول غذائي متكامل يساعدك على تحقيق هدفك (تنشيف، بناء عضلات أو المحافظة على الوزن)',
              'جدول كارديو',
              'كتيب كامل عن بناء العضلات',
            ],
          },
        },
        women: {
          basic: {
            badge: 'أساسية',
            name: 'Basic',
            tagline: 'الدفع لمرة واحدة',
            features: [
              'جدول تمارين متكامل (PDF)',
              'فيديو شرح لكل تمرين',
              'جدول كارديو',
              'كتيب كامل عن بناء العضلات',
            ],
          },
          pro: {
            badge: 'برو',
            name: 'Pro',
            tagline: 'الدفع لمرة واحدة',
            includes: 'تحدي 12 أسبوع',
            features: [
              'جدول تمارين لمدة 12 أسبوع',
              'تغيير التمارين كل 4 أسابيع',
              'فيديو شرح لكل تمرين',
              'جدول كارديو',
              'كتيب كامل عن بناء العضلات',
            ],
          },
          elite: {
            badge: 'النخبة',
            name: 'Elite',
            tagline: 'الدفع لمرة واحدة',
            includes: 'التجربة الكاملة',
            features: [
              'تحدي تمارين لمدة 12 أسبوع',
              'تغيير التمارين كل 4 أسابيع',
              'فيديو شرح لكل تمرين',
              'جدول غذائي متكامل يساعدك على تحقيق هدفك (تنشيف، بناء عضلات أو المحافظة على الوزن)',
              'جدول كارديو',
              'كتيب كامل عن بناء العضلات',
            ],
          },
        },
      },
    },
    footer: {
      tagline:
        'نظام تدريبي واضح مع شرح تفصيلي لكل حركة.\nابدأ رحلتك الرياضية بالطريقة الصحيحة.',
      columns: [
        {
          title: 'المنتجات',
          links: ['الباقات', 'ماذا ستحصل عليه', 'الأسئلة الشائعة'],
        },
        {
          title: 'MotionCore',
          links: ['نظام التحليل', 'ابدأ التقييم', 'لوحة التحكم'],
        },
        {
          title: 'الشركة',
          links: ['من نحن', 'الصفحة الرئيسية'],
        },
      ],
      legal: ['سياسة الخصوصية', 'الشروط والأحكام'],
      socials: ['انستغرام', 'إكس (تويتر)', 'تيك توك', 'واتساب'],
      copyright: '© 2026 UltraFit. جميع الحقوق محفوظة.',
    },
    actions: {
      openMenu: 'فتح القائمة',
      closeMenu: 'إغلاق القائمة',
      switchLanguage: 'التبديل إلى الإنجليزية',
      languageName: 'العربية',
      otherLanguageShort: 'EN',
    },
    motioncore: {
      meta: {
        title: 'UltraFit — MotionCore',
        description:
          'أجب عن أسئلة قصيرة واحصل على خطة غذاء وتمارين مصممة لجسمك وهدفك.',
      },
      landing: {
        eyebrow: 'تقييم MotionCore الذكي',
        headlineLead: 'خطة غذاء وتمارين مصممة',
        headlineAccent: 'خصيصًا لجسمك',
        subheadline:
          'أجب عن أسئلة قصيرة عن جسمك وهدفك، واحصل فورًا على سعراتك اليومية ووجباتك وبرنامجك التدريبي — كل ذلك مبني على معادلات علمية موثوقة.',
        startCta: 'ابدأ التقييم',
        resumeCta: 'افتح لوحتك',
        retakeCta: 'أعد التقييم',
        features: [
          {
            title: 'سعرات ومغذيات دقيقة',
            description: 'هدف يومي للسعرات والبروتين والكربوهيدرات والدهون محسوب لجسمك.',
          },
          {
            title: 'وجبات يومية جاهزة',
            description: 'وجبات من أطعمة محلية مألوفة، موزونة لتحقيق أهدافك.',
          },
          {
            title: 'برنامج تدريبي مناسب',
            description: 'تمارين تناسب مستواك ومعداتك — من البيت أو النادي.',
          },
          {
            title: 'متابعة وتعديل ذكي',
            description: 'سجّل وزنك وسيقترح النظام تعديل سعراتك حسب تقدمك الفعلي.',
          },
        ],
        disclaimer: 'إرشادات عامة وليست بديلًا عن الاستشارة الطبية.',
      },
      assessment: {
        title: 'التقييم',
        stepOf: 'الخطوة {current} من {total}',
        steps: {
          basics: 'عن جسمك',
          activity: 'نشاطك وخبرتك',
          goal: 'هدفك',
          preferences: 'تفضيلاتك',
        },
        fields: {
          sex: 'الجنس',
          age: 'العمر',
          heightCm: 'الطول',
          weightKg: 'الوزن',
          activity: 'مستوى نشاطك اليومي',
          trainingLevel: 'خبرتك في التمارين',
          daysPerWeek: 'أيام التمرين في الأسبوع',
          goal: 'هدفك الأساسي',
          pace: 'وتيرة التقدم',
          equipment: 'المعدات المتاحة',
          exclusions: 'أطعمة تفضل تجنبها',
          bodyFatPercent: 'نسبة الدهون',
          bmrFormula: 'معادلة الأيض الأساسي',
          currentAverageSteps: 'متوسط خطواتك اليومية',
        },
        optional: 'اختياري',
        hints: {
          bodyFat: 'إن عرفتها، ستُستخدم معادلة كاتش-مكاردل الأدق.',
          formula: 'التلقائي يختار كاتش-مكاردل عند إدخال نسبة دهون صحيحة.',
          steps: 'أدخل متوسط آخر 7 أيام إن أمكن.',
        },
        options: {
          sex: { male: 'ذكر', female: 'أنثى' },
          bmrFormula: {
            auto: { label: 'تلقائي', description: 'كاتش-مكاردل مع نسبة الدهون، وإلا ميفلين' },
            mifflin: { label: 'ميفلين-سانت جور', description: 'المعادلة القياسية بالطول والوزن والعمر' },
            katch: { label: 'كاتش-مكاردل', description: 'تعتمد على الكتلة الخالية من الدهون' },
          },
          activity: {
            sedentary: { label: 'خامل', description: 'عمل مكتبي وحركة قليلة' },
            light: { label: 'خفيف', description: 'مشي أو حركة خفيفة 1–3 أيام أسبوعيًا' },
            moderate: { label: 'متوسط', description: 'تمرين معتدل 3–5 أيام أسبوعيًا' },
            very: { label: 'عالي', description: 'تمرين شاق 6–7 أيام أسبوعيًا' },
            athlete: { label: 'رياضي', description: 'تدريب يومي مكثف أو عمل بدني' },
          },
          trainingLevel: {
            beginner: { label: 'مبتدئ', description: 'أقل من سنة من التمرين المنتظم' },
            intermediate: { label: 'متوسط', description: 'من سنة إلى ثلاث سنوات من التمرين' },
            advanced: { label: 'متقدم', description: 'أكثر من ثلاث سنوات من التمرين الجاد' },
          },
          goal: {
            fatLoss: { label: 'خسارة دهون', description: 'عجز سعرات مدروس مع حماية العضلات' },
            muscleGain: { label: 'بناء عضل', description: 'فائض بسيط لنمو عضلي نظيف' },
            fitness: { label: 'لياقة عامة', description: 'قوة وصحة أفضل عند وزن ثابت' },
          },
          pace: {
            gentle: { label: 'هادئة', description: 'أبطأ وأسهل التزامًا' },
            standard: { label: 'متوازنة', description: 'التوازن الموصى به' },
            aggressive: { label: 'سريعة', description: 'أسرع وتتطلب انضباطًا أعلى' },
          },
          equipment: {
            none: { label: 'بدون معدات', description: 'تمارين بوزن الجسم في أي مكان' },
            dumbbells: { label: 'دمبلات منزلية', description: 'دمبلات أو أوزان حرة بسيطة' },
            gym: { label: 'نادي رياضي', description: 'وصول كامل للأجهزة والأوزان' },
          },
          exclusions: {
            dairy: 'الألبان',
            eggs: 'البيض',
            nuts: 'المكسرات',
            gluten: 'الجلوتين',
            seafood: 'المأكولات البحرية',
          },
        },
        daysLabel: '{n} أيام',
        paceHint: '{percent}% من سعرات الثبات',
        maintainHint: 'الحفاظ على وزنك الحالي',
        rangeError: 'أدخل قيمة بين {min} و{max}',
        katchNeedsBodyFat: 'معادلة كاتش-مكاردل تتطلب نسبة دهون بين 2% و70%.',
        next: 'التالي',
        back: 'رجوع',
        finish: 'أنشئ خطتي',
      },
      dashboard: {
        title: 'لوحة MotionCore',
        subtitle: 'خطتك اليومية المبنية على تقييمك',
        editAssessment: 'عدّل التقييم',
        targets: {
          calories: 'سعرات اليوم',
          protein: 'بروتين',
          carbs: 'كربوهيدرات',
          fat: 'دهون',
          water: 'ماء',
          steps: 'خطوات',
        },
        expectedRate: '≈ {rate} كجم أسبوعيًا',
        floorNotice:
          'تم رفع سعراتك إلى الحد الأدنى الآمن، لذا سيكون التقدم أبطأ من الوتيرة المختارة.',
        macrosTitle: 'توزيع المغذيات',
        results: {
          title: 'كيف حُسبت سعراتك',
          formulaLabel: 'المعادلة المستخدمة',
          formulas: { mifflin: 'ميفلين-سانت جور', katch: 'كاتش-مكاردل' },
          bmrLabel: 'معدل الأيض الأساسي',
          bmrExplanation: 'الطاقة التقديرية التي يستهلكها جسمك وهو في راحة تامة.',
          tdeeLabel: 'سعرات الثبات',
          tdeeExplanation: 'معدل الأيض الأساسي بعد تعديله حسب مستوى نشاطك.',
          goalAdjustmentLabel: 'تعديل الهدف',
          goalAdjustmentExplanation: 'سعرات الثبات بعد تعديلها حسب الهدف الذي اخترته.',
          targetLabel: 'هدف السعرات الموصى به',
          macroCaloriesNote:
            'السعرات المعروضة ({kcal}) محسوبة من جرامات المغذيات بعد التقريب، لتتطابق الأرقام.',
          warnings: {
            calorieMinimum:
              'الهدف المحسوب كان أقل من الحد الأدنى العام للأمان في هذه الحاسبة. هذا الحد ليس نصيحة طبية مخصصة لك.',
            proteinCap:
              'تم تحديد البروتين عند 35% من السعرات ليبقى توزيع المغذيات صحيحًا رياضيًا.',
          },
        },
        hydration: {
          title: 'الماء',
          subtitle: 'مرجع تقديري لاحتياجك اليومي من السوائل',
          totalWaterLabel: 'إجمالي الماء يوميًا',
          beverageLabel: 'من المشروبات يوميًا',
          splitNote:
            'حوالي 80% من إجمالي الماء يأتي عادةً من الماء والمشروبات، وحوالي 20% من الطعام.',
          doNotAddNote:
            'إجمالي الماء يشمل ما تحصل عليه من الطعام والمشروبات معًا — لا تجمع الرقمين.',
          increaseNote:
            'التمرين والطقس الحار والحمى والارتفاع والحمل والرضاعة والتعرق الشديد قد ترفع احتياجك من السوائل. قياس فقد العرق أدق من إضافة نسبة ثابتة حسب النشاط.',
          safety:
            'من لديه مرض في الكلى أو قصور في القلب أو مرض في الكبد أو اضطراب في الأملاح أو قيود على السوائل أو يتناول أدوية تؤثر على توازن السوائل، فليتبع إرشادات طبيبه.',
          feedback: [
            'الإحساس بالعطش ولون البول مؤشران يوميان مفيدان.',
            'البول أصفر فاتح يشير عادةً إلى ترطيب كافٍ.',
            'البول عديم اللون باستمرار قد يعني شربًا زائدًا لا حاجة له.',
            'الإفراط في شرب الماء قد يكون خطيرًا.',
            'التمرين الطويل والتعرق الغزير قد يتطلبان تعويض الأملاح وليس الماء وحده.',
          ],
          sweat: {
            title: 'احسب فقد العرق أثناء التمرين',
            intro: 'زِن نفسك قبل التمرين وبعده مباشرةً بنفس الملابس تقريبًا.',
            fields: {
              preExerciseWeightKg: 'الوزن قبل التمرين',
              postExerciseWeightKg: 'الوزن بعد التمرين',
              exerciseDurationMinutes: 'مدة التمرين',
              fluidConsumedLiters: 'السوائل التي شربتها أثناء التمرين',
              urineProducedLiters: 'البول أثناء التمرين',
              hotOrHumid: 'كان الجو حارًا أو رطبًا',
            },
            submit: 'احسب',
            results: {
              netSweatLoss: 'صافي فقد العرق',
              sweatRate: 'معدل التعرق',
              dehydration: 'نسبة الجفاف',
              replacement: 'التعويض بعد التمرين',
              drinkingRate: 'أقصى معدل شرب أثناء التمرين',
            },
            replacementNote:
              'اشرب هذا المدى تدريجيًا خلال ساعات التعافي — وليس دفعة واحدة.',
            drinkingRateNote:
              'لا تشرب أثناء التمرين أسرع من معدل تعرقك المقاس.',
            errors: {
              value: 'أدخل قيمة رقمية صحيحة.',
              duration: 'أدخل مدة تمرين أكبر من صفر.',
            },
            warnings: {
              dehydration:
                'فقدت 2% أو أكثر من وزن جسمك — هذا مستوى جفاف يستحق الانتباه.',
              highSweatRate:
                'معدل تعرقك يتجاوز 1.5 لتر/ساعة؛ غالبًا ستحتاج إلى تعويض الأملاح أيضًا.',
              highDrinkingRate:
                'المعدل المطلوب يتجاوز حوالي 1 لتر/ساعة، وهو أكثر مما تستوعبه المعدة عادةً.',
              hotConditions:
                'الجو الحار أو الرطب يرفع فقد العرق؛ أعد القياس في الظروف المعتادة أيضًا.',
            },
          },
        },
        walking: {
          title: 'المشي',
          subtitle: 'هدف المشي اليومي الموصى به',
          targetLabel: 'هدفك اليومي',
          rangeLabel: 'المدى الموصى به {min}–{max}',
          generalReferenceLabel: 'المرجع الصحي العام',
          currentLabel: 'متوسطك الحالي',
          nextTargetLabel: 'هدفك التالي',
          nextTargetHint: 'زيادة تدريجية من متوسطك الحالي نحو هدفك.',
          alreadyMeets:
            'أنت تحقق هدف الخطوات اليومي العام بالفعل. لا حاجة لزيادته باستمرار.',
          evidenceNote:
            'هذه أهداف صحية مبنية على الأدلة، وليست وصفة طبية دقيقة ولا كمية مضمونة لخسارة الوزن.',
          guidance: [
            '150–300 دقيقة من النشاط الهوائي المعتدل أسبوعيًا.',
            'أو ما يعادلها من النشاط الشديد.',
            'تمارين تقوية العضلات في يومين على الأقل أسبوعيًا.',
            'المشي السريع يمكن أن يحتسب ضمن النشاط المعتدل.',
          ],
          intensityNote:
            'عدد الخطوات وحده لا يعني بالضرورة نشاطًا بشدة معتدلة.',
          calorieNote:
            'لا تُضاف سعرات المشي إلى سعراتك اليومية: مستوى النشاط الذي اخترته يقدّر حركتك اليومية أصلًا، وإضافتها مجددًا تحتسب النشاط مرتين.',
          weightLossNote:
            'المشي يدعم صحتك وصرف الطاقة، لكن خسارة الوزن تعتمد أساسًا على توازن السعرات المستمر. هذه الحاسبة لا تعد بمقدار محدد من خسارة الوزن مقابل هدف الخطوات.',
        },
        meals: {
          title: 'وجبات اليوم',
          approxNote: 'الكميات تقريبية لتطابق أهدافك اليومية',
          slots: {
            breakfast: 'الفطور',
            lunch: 'الغداء',
            dinner: 'العشاء',
            snack: 'وجبة خفيفة',
            snack2: 'وجبة خفيفة ثانية',
          },
          total: 'الإجمالي',
        },
        workout: {
          title: 'برنامج الأسبوع',
          rest: 'راحة {seconds} ث',
          sets: 'جولات',
        },
        weight: {
          title: 'سجل الوزن',
          weightLabel: 'الوزن (كجم)',
          dateLabel: 'التاريخ',
          add: 'سجّل',
          empty: 'سجّل وزنك أول مرة لبدء المتابعة',
          needMorePoints: 'أضف قياسًا آخر لرسم المنحنى',
          expectedTrend: 'المسار المتوقع',
          latest: 'آخر وزن',
        },
        hints: {
          title: 'معايرة الخطة',
          onTrack: 'ممتاز! تقدمك مطابق للخطة.',
          tooFast: 'وزنك يتغير أسرع من المخطط.',
          tooSlow: 'تقدمك أبطأ من المخطط.',
          increase: 'جرّب زيادة سعراتك بحوالي {kcal} سعرة يوميًا.',
          reduce: 'جرّب تقليل سعراتك بحوالي {kcal} سعرة يوميًا.',
          needMoreData: 'سجّل 4 قياسات على الأقل خلال 10 أيام أو أكثر لتحليل تقدمك.',
        },
        empty: {
          title: 'لا توجد خطة بعد',
          body: 'أكمل التقييم القصير لإنشاء خطتك الشخصية.',
        },
        loading: 'جارٍ التحميل…',
      },
      units: {
        kcal: 'سعرة',
        g: 'جم',
        kg: 'كجم',
        cm: 'سم',
        years: 'سنة',
        liters: 'لتر',
        steps: 'خطوة',
        percent: '%',
        minutes: 'دقيقة',
        litersPerHour: 'لتر/ساعة',
      },
    },
  },
  en: {
    dir: 'ltr',
    brand: 'UltraFit',
    nav: {
      products: 'Products',
      whatYouGet: "What You'll Get",
      about: 'About Us',
      motioncore: 'Calculate your calories',
    },
    hero: {
      eyebrow: 'The MotionCore training system',
      headlineLead: 'Transform your body with a smart training plan',
      headlineAccent: 'in 12 weeks',
      subheadline:
        'A complete workout program, an explainer video for every exercise, a muscle-building booklet, and a cardio plan.',
      cta: 'Get the Guide',
      secondaryCta: 'Calculate your calories',
      trustedBy: 'Built on trusted research & references',
    },
    about: {
      eyebrow: 'About us',
      headingLead: 'Training built on science,',
      headingAccent: 'designed for your goal',
      lead: 'UltraFit is a team obsessed with training done right. We turn trusted research into clear, practical training and nutrition guides — no fluff, no guesswork.',
      body: 'We started UltraFit after watching too many people lose months to wrong exercises and conflicting advice. Our mission is to shortcut that path: structured step-by-step plans, a clear breakdown of every movement, and the MotionCore system to match you with what fits your body and goal.',
      values: [
        {
          title: 'Research-based',
          description: 'Every plan is grounded in trusted references like PubMed, NSCA, and Elsevier — never guesswork.',
        },
        {
          title: 'For men & women',
          description: 'Every package comes in two versions, each designed around its audience and goals.',
        },
        {
          title: 'Instant delivery',
          description: 'Your PDF guides arrive the moment payment completes — no waiting, no shipping.',
        },
        {
          title: 'Every movement explained',
          description: 'Video links show exactly how to perform each exercise, so you train with confidence.',
        },
      ],
      stats: [
        { value: '12', label: 'weeks of structured progression' },
        { value: '6', label: 'packages for every level and goal' },
        { value: 'PDF', label: 'instant digital delivery' },
      ],
    },
    faq: {
      eyebrow: 'FAQ',
      heading: 'Frequently asked questions',
      subheading:
        "Everything you need to know before starting your UltraFit journey. Can't find your answer? Browse the packages and get started.",
      items: [
        {
          id: 'faq-1',
          question: 'What is UltraFit?',
          answer:
            'UltraFit is a digital training program delivered as downloadable PDF guides — a complete workout plan, nutrition direction, and a video breakdown of every movement. It comes for both men and women, from Basic to Elite.',
        },
        {
          id: 'faq-2',
          question: 'How do I receive my guide after purchase?',
          answer:
            'The moment checkout completes, you get a secure download link for your PDF guide — instantly, with no waiting and no shipping. The link stays valid so you can download your copy for a limited time after purchase.',
        },
        {
          id: 'faq-3',
          question: 'Are the plans suitable for beginners?',
          answer:
            'Yes. The Basic plan is built beginner-first with a simple structure and clear guidance for every exercise, while Pro and Elite add progressive 12-week programming as you advance.',
        },
        {
          id: 'faq-4',
          question: "What's the difference between Basic, Pro, and Elite?",
          answer:
            'Basic gives you a personalized workout plan and exercise guidance; Pro adds a full 12-week transformation with progressive cardio; Elite layers in an advanced nutrition system and full goal-based customization.',
        },
        {
          id: 'faq-5',
          question: 'Do you have plans for both men and women?',
          answer:
            "Yes. Every tier comes in two versions — one for men and one for women — with training and nutrition tailored to each.",
        },
        {
          id: 'faq-6',
          question: 'Is the program based on real science?',
          answer:
            'Every plan is built on trusted research and references such as PubMed, NSCA, and Elsevier — not guesswork.',
        },
        {
          id: 'faq-7',
          question: 'What is MotionCore?',
          answer:
            'MotionCore is our companion analysis system that assesses your movement and level, helping you match to the right package before you buy.',
        },
      ],
      contactLead: "Can't find your answer?",
      contactCta: 'Message us on WhatsApp',
    },
    packages: {
      audienceLabel: 'Choose package audience',
      men: 'Men',
      women: 'Women',
    },
    whatYouGet: {
      heading: "What You'll Get",
      subheading: "Exactly what's inside each plan — for men and women, from Basic to Elite.",
      items: [
        {
          title: 'Basic — Men',
          description: 'Full training file + educational guide, with a video for every exercise and a beginner cardio plan.',
        },
        {
          title: 'Pro — Men',
          description: '12-week challenge with progressive training splits and the complete research-based guide.',
        },
        {
          title: 'Elite — Men',
          description: 'Training + nutrition + education across three complete files to transform your whole body.',
        },
        {
          title: 'Basic — Women',
          description: 'Complete training schedules (3-4-5 days) + a simplified educational guide for beginners.',
        },
        {
          title: 'Pro — Women',
          description: '12-week challenge to sculpt your body step by step, with a full training and education guide.',
        },
        {
          title: 'Elite — Women',
          description: 'Advanced training, nutrition, and education — the complete system to reach your goal.',
        },
      ],
    },
    pricing: {
      heading: 'Choose your UltraFit plan',
      subheading: 'Three plans built around your goal — start simple or go all in.',
      currency: 'SAR',
      addToCart: 'Add to cart',
      buyNow: 'Buy now',
      emailTitle: 'Where should we send your program?',
      emailSubtitle: "We'll email your program PDF right after payment.",
      emailLabel: 'Email',
      emailPlaceholder: 'name@example.com',
      emailInvalid: 'Please enter a valid email address.',
      emailContinue: 'Continue',
      emailCancel: 'Cancel',
      trust: [
        { title: '100% secure payment', description: 'All payments are encrypted and secure' },
        { title: 'Instant download', description: 'Receive your files right after payment' },
        { title: 'Lifetime access', description: 'Access your files any time you need' },
        { title: 'Fast support', description: "We're here to help you anytime" },
      ],
      promo: {
        men: {
          eyebrow: 'Choose the plan that fits you',
          heading: 'A 12-week challenge to become the best version of you',
          subheading: 'Three plans designed to fit your goals and budget',
        },
        women: {
          eyebrow: 'Choose the plan that fits you',
          heading: 'A 12-week challenge to become the best version of you',
          subheading: 'Three plans designed to fit your goals and budget',
        },
      },
      tiers: {
        men: {
          basic: {
            badge: 'Basic',
            name: 'Basic',
            tagline: 'One-time payment',
            features: [
              'Complete workout plan (PDF)',
              'Video explanation for every exercise',
              'Cardio plan',
              'Complete muscle-building handbook',
            ],
          },
          pro: {
            badge: 'Pro',
            name: 'Pro',
            tagline: 'One-time payment',
            includes: '12-week challenge',
            features: [
              '12-week workout plan',
              'Exercises rotated every 4 weeks',
              'Video explanation for every exercise',
              'Cardio plan',
              'Complete muscle-building handbook',
            ],
          },
          elite: {
            badge: 'Elite',
            name: 'Elite',
            tagline: 'One-time payment',
            includes: 'The complete experience',
            features: [
              '12-week workout challenge',
              'Exercises rotated every 4 weeks',
              'Video explanation for every exercise',
              'Complete meal plan to help you reach your goal (cutting, muscle building, or weight maintenance)',
              'Cardio plan',
              'Complete muscle-building handbook',
            ],
          },
        },
        women: {
          basic: {
            badge: 'Basic',
            name: 'Basic',
            tagline: 'One-time payment',
            features: [
              'Complete workout plan (PDF)',
              'Video explanation for every exercise',
              'Cardio plan',
              'Complete muscle-building handbook',
            ],
          },
          pro: {
            badge: 'Pro',
            name: 'Pro',
            tagline: 'One-time payment',
            includes: '12-week challenge',
            features: [
              '12-week workout plan',
              'Exercises rotated every 4 weeks',
              'Video explanation for every exercise',
              'Cardio plan',
              'Complete muscle-building handbook',
            ],
          },
          elite: {
            badge: 'Elite',
            name: 'Elite',
            tagline: 'One-time payment',
            includes: 'The complete experience',
            features: [
              '12-week workout challenge',
              'Exercises rotated every 4 weeks',
              'Video explanation for every exercise',
              'Complete meal plan to help you reach your goal (cutting, muscle building, or weight maintenance)',
              'Cardio plan',
              'Complete muscle-building handbook',
            ],
          },
        },
      },
    },
    footer: {
      tagline:
        'A clear training system with a detailed breakdown of every movement.\nStart your fitness journey the right way.',
      columns: [
        {
          title: 'Product',
          links: ['Packages', "What You'll Get", 'FAQ'],
        },
        {
          title: 'MotionCore',
          links: ['Analysis system', 'Start assessment', 'Dashboard'],
        },
        {
          title: 'Company',
          links: ['About us', 'Home'],
        },
      ],
      legal: ['Privacy Policy', 'Terms of Service'],
      socials: ['Instagram', 'X (Twitter)', 'TikTok', 'WhatsApp'],
      copyright: '© 2026 UltraFit. All rights reserved.',
    },
    actions: {
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      switchLanguage: 'Switch to Arabic',
      languageName: 'English',
      otherLanguageShort: 'ع',
    },
    motioncore: {
      meta: {
        title: 'UltraFit — MotionCore',
        description:
          'Answer a few quick questions and get a nutrition & training plan built for your body and goal.',
      },
      landing: {
        eyebrow: 'The MotionCore assessment',
        headlineLead: 'A nutrition & training plan built',
        headlineAccent: 'for your body',
        subheadline:
          'Answer a few questions about your body and goal, and instantly get your daily calories, meals, and weekly training program — all built on proven sports-science formulas.',
        startCta: 'Start the assessment',
        resumeCta: 'Open your dashboard',
        retakeCta: 'Retake the assessment',
        features: [
          {
            title: 'Precise calories & macros',
            description: 'Daily calorie, protein, carb and fat targets calculated for your body.',
          },
          {
            title: 'A ready daily meal plan',
            description: 'Familiar local foods, portioned to hit your targets.',
          },
          {
            title: 'Training that fits you',
            description: 'Exercises matched to your level and equipment — at home or in the gym.',
          },
          {
            title: 'Smart progress tracking',
            description: 'Log your weight and get calorie adjustments based on your real trend.',
          },
        ],
        disclaimer: 'General guidance — not a substitute for medical advice.',
      },
      assessment: {
        title: 'Assessment',
        stepOf: 'Step {current} of {total}',
        steps: {
          basics: 'About you',
          activity: 'Activity & experience',
          goal: 'Your goal',
          preferences: 'Your preferences',
        },
        fields: {
          sex: 'Sex',
          age: 'Age',
          heightCm: 'Height',
          weightKg: 'Weight',
          activity: 'Daily activity level',
          trainingLevel: 'Training experience',
          daysPerWeek: 'Training days per week',
          goal: 'Primary goal',
          pace: 'Pace',
          equipment: 'Available equipment',
          exclusions: 'Foods to avoid',
          bodyFatPercent: 'Body fat',
          bmrFormula: 'BMR formula',
          currentAverageSteps: 'Current average daily steps',
        },
        optional: 'Optional',
        hints: {
          bodyFat: 'If you know it, the more precise Katch–McArdle formula is used.',
          formula: 'Automatic picks Katch–McArdle when a valid body fat is entered.',
          steps: 'Enter a 7-day average when possible.',
        },
        options: {
          sex: { male: 'Male', female: 'Female' },
          bmrFormula: {
            auto: { label: 'Automatic', description: 'Katch–McArdle with body fat, otherwise Mifflin' },
            mifflin: { label: 'Mifflin–St Jeor', description: 'The standard height, weight and age equation' },
            katch: { label: 'Katch–McArdle', description: 'Based on your lean body mass' },
          },
          activity: {
            sedentary: { label: 'Sedentary', description: 'Desk job, little movement' },
            light: { label: 'Light', description: 'Light activity 1–3 days a week' },
            moderate: { label: 'Moderate', description: 'Moderate exercise 3–5 days a week' },
            very: { label: 'Very active', description: 'Hard exercise 6–7 days a week' },
            athlete: { label: 'Athlete', description: 'Daily intense training or a physical job' },
          },
          trainingLevel: {
            beginner: { label: 'Beginner', description: 'Under a year of consistent training' },
            intermediate: { label: 'Intermediate', description: '1–3 years of training' },
            advanced: { label: 'Advanced', description: '3+ years of serious training' },
          },
          goal: {
            fatLoss: { label: 'Fat loss', description: 'A careful deficit that protects muscle' },
            muscleGain: { label: 'Muscle gain', description: 'A small surplus for lean growth' },
            fitness: { label: 'Overall fitness', description: 'Stronger and healthier at a stable weight' },
          },
          pace: {
            gentle: { label: 'Gentle', description: 'Slower, easiest to sustain' },
            standard: { label: 'Standard', description: 'The recommended balance' },
            aggressive: { label: 'Aggressive', description: 'Faster, needs more discipline' },
          },
          equipment: {
            none: { label: 'No equipment', description: 'Bodyweight training anywhere' },
            dumbbells: { label: 'Dumbbells at home', description: 'Dumbbells or basic free weights' },
            gym: { label: 'Full gym', description: 'Full access to machines and weights' },
          },
          exclusions: {
            dairy: 'Dairy',
            eggs: 'Eggs',
            nuts: 'Nuts',
            gluten: 'Gluten',
            seafood: 'Seafood',
          },
        },
        daysLabel: '{n} days',
        paceHint: '{percent}% of maintenance calories',
        maintainHint: 'Hold your current weight',
        rangeError: 'Enter a value between {min} and {max}',
        katchNeedsBodyFat: 'Katch–McArdle needs a body fat between 2% and 70%.',
        next: 'Next',
        back: 'Back',
        finish: 'Build my plan',
      },
      dashboard: {
        title: 'MotionCore dashboard',
        subtitle: 'Your daily plan, built from your assessment',
        editAssessment: 'Edit assessment',
        targets: {
          calories: 'Daily calories',
          protein: 'Protein',
          carbs: 'Carbs',
          fat: 'Fat',
          water: 'Water',
          steps: 'Steps',
        },
        expectedRate: '≈ {rate} kg per week',
        floorNotice:
          'Your calories were raised to a safe minimum, so progress will be slower than the selected pace.',
        macrosTitle: 'Macro split',
        results: {
          title: 'How your calories were calculated',
          formulaLabel: 'Formula used',
          formulas: { mifflin: 'Mifflin–St Jeor', katch: 'Katch–McArdle' },
          bmrLabel: 'BMR',
          bmrExplanation: 'The energy your body is estimated to use at complete rest.',
          tdeeLabel: 'Maintenance calories (TDEE)',
          tdeeExplanation: 'Your BMR adjusted for your activity level.',
          goalAdjustmentLabel: 'Goal adjustment',
          goalAdjustmentExplanation: 'Your maintenance calories adjusted for the goal you chose.',
          targetLabel: 'Recommended calorie target',
          macroCaloriesNote:
            'The calories shown ({kcal}) are rebuilt from the rounded macro grams, so the numbers agree.',
          warnings: {
            calorieMinimum:
              "The calculated target was below the calculator's general safety minimum. This minimum is not individualized medical advice.",
            proteinCap:
              'Protein was limited to 35% of calories so the macro plan stays mathematically valid.',
          },
        },
        hydration: {
          title: 'Hydration',
          subtitle: 'Estimated daily hydration reference',
          totalWaterLabel: 'Total water per day',
          beverageLabel: 'From beverages per day',
          splitNote:
            'About 80% of total water commonly comes from water and beverages, and about 20% from food.',
          doNotAddNote:
            'Total water already includes what you get from food and all beverages — do not add the two figures together.',
          increaseNote:
            'Exercise, hot weather, fever, altitude, pregnancy, breastfeeding and heavy sweating can increase fluid needs. Sweat loss is more accurate than applying a fixed activity adjustment.',
          safety:
            "People with kidney disease, heart failure, liver disease, electrolyte disorders, fluid restrictions, or medicines affecting fluid balance should follow their clinician's advice.",
          feedback: [
            'Thirst and urine color provide useful daily feedback.',
            'Pale-yellow urine generally suggests adequate hydration.',
            'Consistently colorless urine can indicate unnecessary overconsumption.',
            'Excessive water intake can be dangerous.',
            'Prolonged exercise and heavy sweating may require electrolyte replacement, not only water.',
          ],
          sweat: {
            title: 'Calculate exercise sweat loss',
            intro: 'Weigh yourself right before and right after exercise, in similar clothing.',
            fields: {
              preExerciseWeightKg: 'Weight before exercise',
              postExerciseWeightKg: 'Weight after exercise',
              exerciseDurationMinutes: 'Exercise duration',
              fluidConsumedLiters: 'Fluid consumed during exercise',
              urineProducedLiters: 'Urine produced during exercise',
              hotOrHumid: 'Conditions were hot or humid',
            },
            submit: 'Calculate',
            results: {
              netSweatLoss: 'Net sweat loss',
              sweatRate: 'Sweat rate',
              dehydration: 'Body mass lost',
              replacement: 'Post-exercise replacement',
              drinkingRate: 'Max drinking rate during exercise',
            },
            replacementNote:
              'Drink this range gradually across your recovery hours — not all at once.',
            drinkingRateNote:
              'Do not drink during exercise faster than your measured sweat rate.',
            errors: {
              value: 'Enter a valid number.',
              duration: 'Enter an exercise duration greater than zero.',
            },
            warnings: {
              dehydration:
                'You lost 2% or more of your body mass — a level of dehydration worth acting on.',
              highSweatRate:
                'Your sweat rate is above 1.5 L/hour; you likely need electrolytes as well as water.',
              highDrinkingRate:
                'The rate needed is above roughly 1 L/hour, which is more than the stomach usually absorbs.',
              hotConditions:
                'Hot or humid conditions raise sweat loss; re-measure in typical conditions too.',
            },
          },
        },
        walking: {
          title: 'Walking',
          subtitle: 'Recommended daily walking target',
          targetLabel: 'Your daily target',
          rangeLabel: 'Recommended range {min}–{max}',
          generalReferenceLabel: 'General health reference',
          currentLabel: 'Your current average',
          nextTargetLabel: 'Your next target',
          nextTargetHint: 'A gradual step up from your current average toward your target.',
          alreadyMeets:
            'You already meet the general daily step target. You do not need to continually increase it.',
          evidenceNote:
            'These are evidence-informed health targets, not exact medical prescriptions or guaranteed weight-loss amounts.',
          guidance: [
            '150–300 minutes of moderate aerobic activity per week.',
            'Or an equivalent amount of vigorous activity.',
            'Muscle-strengthening exercise on at least 2 days per week.',
            'Brisk walking can contribute to the moderate-activity target.',
          ],
          intensityNote:
            'Total steps do not always represent moderate-intensity activity.',
          calorieNote:
            'Walking calories are not added to your daily target: the activity level you selected already estimates your normal daily movement, and adding them again would double-count it.',
          weightLossNote:
            'Walking supports health and energy expenditure, but weight loss depends primarily on sustained calorie balance. This calculator does not promise a specific amount of weight loss from a step target.',
        },
        meals: {
          title: "Today's meals",
          approxNote: 'Portions are approximate, tuned to your daily targets',
          slots: {
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            snack: 'Snack',
            snack2: 'Second snack',
          },
          total: 'Total',
        },
        workout: {
          title: 'Weekly training',
          rest: 'Rest {seconds}s',
          sets: 'sets',
        },
        weight: {
          title: 'Weight log',
          weightLabel: 'Weight (kg)',
          dateLabel: 'Date',
          add: 'Log',
          empty: 'Log your first weigh-in to start tracking',
          needMorePoints: 'Add another entry to draw the trend',
          expectedTrend: 'Expected trend',
          latest: 'Latest',
        },
        hints: {
          title: 'Plan check-in',
          onTrack: 'On track — your progress matches the plan.',
          tooFast: 'Your weight is changing faster than planned.',
          tooSlow: 'Progress is slower than planned.',
          increase: 'Consider adding about {kcal} kcal per day.',
          reduce: 'Consider cutting about {kcal} kcal per day.',
          needMoreData: 'Log at least 4 weigh-ins across 10+ days to analyze your trend.',
        },
        empty: {
          title: 'No plan yet',
          body: 'Complete the short assessment to generate your personal plan.',
        },
        loading: 'Loading…',
      },
      units: {
        kcal: 'kcal',
        g: 'g',
        kg: 'kg',
        cm: 'cm',
        years: 'years',
        liters: 'L',
        steps: 'steps',
        percent: '%',
        minutes: 'min',
        litersPerHour: 'L/h',
      },
    },
  },
};
