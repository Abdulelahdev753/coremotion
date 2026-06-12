import type { Direction, Locale } from './config';

/** A choice rendered as a selectable card in the MotionCore assessment. */
type OptionText = { label: string; description: string };

export type Dictionary = {
  dir: Direction;
  brand: string;
  nav: {
    products: string;
    useCases: string;
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
      };
      optional: string;
      options: {
        sex: { male: string; female: string };
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
      /** Template: {rate} is replaced with the signed kg-per-week rate. */
      paceHint: string;
      maintainHint: string;
      /** Template: {min} and {max} are replaced with the field bounds. */
      rangeError: string;
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
    };
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  ar: {
    dir: 'rtl',
    brand: 'UltraFit',
    nav: {
      products: 'المنتجات',
      useCases: 'حالات الاستخدام',
      about: 'من نحن',
      motioncore: 'MotionCore',
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
        },
        optional: 'اختياري',
        options: {
          sex: { male: 'ذكر', female: 'أنثى' },
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
        paceHint: '≈ {rate} كجم أسبوعيًا',
        maintainHint: 'الحفاظ على وزنك الحالي',
        rangeError: 'أدخل قيمة بين {min} و{max}',
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
      },
    },
  },
  en: {
    dir: 'ltr',
    brand: 'UltraFit',
    nav: {
      products: 'Products',
      useCases: 'Use Cases',
      about: 'About Us',
      motioncore: 'MotionCore',
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
        },
        optional: 'Optional',
        options: {
          sex: { male: 'Male', female: 'Female' },
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
        paceHint: '≈ {rate} kg per week',
        maintainHint: 'Hold your current weight',
        rangeError: 'Enter a value between {min} and {max}',
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
      },
    },
  },
};
