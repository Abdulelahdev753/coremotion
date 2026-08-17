/**
 * Copy for the two legal pages (/privacy and /terms).
 *
 * Kept out of `dictionaries.ts` because it is an order of magnitude longer than
 * anything else in there and changes on a different cadence — legal text is
 * revised as the business changes, not as the UI does. Same shape in both
 * locales so `LegalDocument` renders either one without branching.
 *
 * Everything here describes what the site actually does today: StreamPay takes
 * the payment, Supabase stores the order row and the PDFs, Resend sends the
 * delivery email, GA4 measures traffic, and the MotionCore assessment never
 * leaves the browser (see `lib/motioncore/storage.ts`). If any of those change,
 * this file has to change with them.
 */
import type { Locale } from './config';

/** One numbered section of a legal document. */
export type LegalSection = {
  heading: string;
  /** Lead paragraphs, rendered above the bullets. */
  body?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  /** Route metadata (static export renders this in the default locale). */
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  updatedLabel: string;
  /** Human-readable, per locale — the ISO date for <time> lives in the component. */
  updatedDate: string;
  intro: string;
  sections: LegalSection[];
  contact: { heading: string; body: string; cta: string };
  backToHome: string;
};

/** ISO form of `updatedDate`, for the <time dateTime> attribute. */
export const LEGAL_UPDATED_ISO = '2026-08-17';

const privacyAr: LegalDocument = {
  meta: {
    title: 'UltraFit — سياسة الخصوصية',
    description: 'كيف تجمع UltraFit بياناتك وتستخدمها وتحميها.',
  },
  eyebrow: 'الشؤون القانونية',
  title: 'سياسة الخصوصية',
  updatedLabel: 'آخر تحديث',
  updatedDate: '17 أغسطس 2026',
  intro:
    'توضّح هذه السياسة البيانات التي نجمعها عند استخدامك لموقع ultrafits.com وشرائك لأي من باقات UltraFit، وكيف نستخدم هذه البيانات ومع من نشاركها وما هي حقوقك تجاهها.',
  sections: [
    {
      heading: 'من نحن',
      body: [
        'UltraFit منشأة مسجّلة في المملكة العربية السعودية برقم سجل تجاري 7053618372 صادر من وزارة التجارة. نبيع أدلة تدريب وتغذية رقمية على شكل ملفات PDF قابلة للتحميل عبر موقع ultrafits.com.',
        'نحن الجهة المتحكّمة في البيانات الشخصية التي تُجمع عبر الموقع.',
      ],
    },
    {
      heading: 'البيانات التي نجمعها',
      body: ['نجمع الحد الأدنى اللازم لإتمام طلبك وتشغيل الموقع:'],
      bullets: [
        'بريدك الإلكتروني — تُدخله عند الشراء لنرسل لك رابط تحميل البرنامج.',
        'بيانات الطلب — الباقة المشتراة، والمبلغ والعملة، وحالة الدفع، ورقم الطلب، ومعرّف رابط الدفع، وتواريخ الإنشاء والدفع.',
        'بيانات استخدام الموقع — الصفحات التي تزورها والأحداث الأساسية (فتح الدفع، إتمام الشراء) عبر Google Analytics 4، إضافةً إلى ما يجمعه مزوّد الاستضافة تلقائيًا مثل عنوان IP ونوع المتصفح.',
        'تفضيل اللغة — يُحفظ محليًا في متصفحك لتظهر لك الصفحة بلغتك في الزيارات القادمة.',
      ],
    },
    {
      heading: 'ما لا نجمعه',
      bullets: [
        'بيانات بطاقتك البنكية — تُدخل مباشرةً لدى بوابة الدفع StreamPay ولا تمرّ عبر خوادمنا ولا نحتفظ بها في أي وقت.',
        'بيانات تقييم MotionCore — الطول والوزن والعمر والهدف وسجل الوزن تُحفظ في متصفحك أنت فقط (localStorage) ولا تُرسل إلى خوادمنا. مسح بيانات المتصفح يمسحها نهائيًا.',
        'لا نطلب إنشاء حساب ولا كلمة مرور، ولا نجمع بيانات صحية حسّاسة أو هوية وطنية.',
      ],
    },
    {
      heading: 'لماذا نستخدم بياناتك',
      bullets: [
        'تنفيذ طلبك: إنشاء رابط دفع، وتأكيد السداد، وتسليم ملف البرنامج، وإعادة إرساله عند الحاجة.',
        'خدمة العملاء: الرد على استفساراتك ومعالجة طلبات الاسترداد.',
        'الالتزام النظامي: حفظ سجلات المبيعات كما تتطلبه الأنظمة المحاسبية والتجارية في المملكة.',
        'تحسين الموقع: قياس أداء الصفحات ومعرفة ما يحتاج إلى تطوير، بشكل إجمالي لا فردي.',
      ],
    },
    {
      heading: 'الأساس النظامي للمعالجة',
      body: [
        'نعالج بياناتك الشخصية استنادًا إلى أسس نظامية محدّدة وفق نظام حماية البيانات الشخصية:',
      ],
      bullets: [
        'تنفيذ العقد: معالجة بريدك وبيانات طلبك لازمة لتسليم المنتج الذي اشتريته.',
        'الالتزام النظامي: حفظ سجلات البيع كما تتطلبه الأنظمة المحاسبية والتجارية.',
        'المصلحة المشروعة: قياس أداء الموقع وحماية الملفات من إعادة النشر، بما لا يمسّ حقوقك.',
        'الموافقة: في الحالات التي نطلب فيها موافقتك صراحةً، ولك سحبها في أي وقت دون أن يؤثر ذلك على مشروعية المعالجة السابقة.',
      ],
    },
    {
      heading: 'مزوّدو الخدمة ونقل البيانات خارج المملكة',
      body: [
        'نشارك القدر اللازم فقط من بياناتك مع مزوّدين يعالجونها نيابةً عنّا ووفق تعليماتنا:',
      ],
      bullets: [
        'StreamPay — معالجة المدفوعات وتأكيدها.',
        'Supabase — استضافة قاعدة بيانات الطلبات وملفات البرامج.',
        'Resend — إرسال رسائل تسليم البرنامج إلى بريدك.',
        'Google Analytics 4 — قياس زيارات الموقع.',
        'مزوّد الاستضافة — تشغيل الموقع وتقديم صفحاته.',
        'بعض هؤلاء المزوّدين يشغّلون خوادمهم خارج المملكة، ما يعني أن جزءًا من بياناتك قد يُعالَج أو يُخزَّن خارجها. يتم ذلك في أضيق الحدود اللازمة لتقديم الخدمة، ووفق الضوابط التي تفرضها لوائح نقل البيانات الشخصية خارج المملكة الصادرة عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)، ودون أن يمسّ ذلك بمستوى حماية بياناتك.',
      ],
    },
    {
      heading: 'ملفات تعريف الارتباط والتخزين المحلي',
      body: [
        'نستخدم ملف تعريف ارتباط واحدًا لحفظ لغتك المختارة، وملفات Google Analytics لقياس الزيارات. كما نستخدم التخزين المحلي في متصفحك لحفظ تفضيل اللغة وبيانات تقييم MotionCore ومؤشّر يمنع احتساب عملية الشراء أكثر من مرة في التقارير.',
        'زوّار المنطقة الاقتصادية الأوروبية والمملكة المتحدة يُعامَلون افتراضيًا بوضع «الموافقة المرفوضة» في Google Analytics، فلا تُحفظ لهم ملفات تتبّع إعلانية.',
        'يمكنك حذف هذه الملفات أو منعها من إعدادات متصفحك؛ قد يؤدي ذلك إلى عودة الموقع للغته الافتراضية وفقدان بيانات تقييمك.',
      ],
    },
    {
      heading: 'مدة الاحتفاظ بالبيانات',
      bullets: [
        'سجلات الطلبات والفواتير: تُحفظ للمدة التي تفرضها الأنظمة المحاسبية والتجارية السعودية.',
        'روابط التحميل: تنتهي صلاحيتها بعد مدة محدودة من إتمام الدفع، ويظل بإمكانك طلب إعادة الإرسال من الدعم.',
        'بيانات القياس: تُحفظ وفق مدد الاحتفاظ المعتمدة في Google Analytics.',
      ],
    },
    {
      heading: 'حقوقك',
      body: [
        'يمنحك نظام حماية البيانات الشخصية في المملكة العربية السعودية الحقوق التالية على بياناتك:',
      ],
      bullets: [
        'الحق في العلم: معرفة الأساس النظامي والغرض من جمع بياناتك — وهو ما توضّحه هذه السياسة.',
        'الحق في الوصول: الاطّلاع على بياناتك الشخصية التي بحوزتنا.',
        'الحق في الحصول على نسخة: استلام بياناتك بصيغة واضحة وقابلة للقراءة.',
        'الحق في التصحيح: طلب تصحيح بياناتك أو استكمالها أو تحديثها.',
        'الحق في الإتلاف: طلب إتلاف بياناتك متى لم تعد لازمة للغرض الذي جُمعت من أجله، مع مراعاة ما يلزمنا الاحتفاظ به نظاميًا.',
        'الحق في سحب الموافقة: في أي وقت وللمستقبل، حيثما كانت المعالجة قائمة على موافقتك.',
      ],
    },
    {
      heading: 'كيف تمارس حقوقك أو تقدّم شكوى',
      body: [
        'راسلنا على واتساب عبر الزر في نهاية هذه الصفحة. نردّ خلال مدة معقولة، وقد نطلب ما يربطك بالطلب (رقم الطلب أو البريد المستخدم في الشراء) قبل تنفيذ طلبك.',
        'وإذا لم تقتنع بردّنا، فلك الحق في تقديم شكوى إلى الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) بصفتها الجهة المشرفة على تطبيق نظام حماية البيانات الشخصية.',
      ],
    },
    {
      heading: 'أمن البيانات والإبلاغ عن الحوادث',
      body: [
        'تُنقل بيانات الموقع عبر اتصال مشفّر، وتُحفظ ملفات البرامج في مستودعات خاصة غير عامة تُقدَّم عبر خوادمنا فقط بعد التحقق من سداد الطلب. ورغم ذلك لا يمكن لأي وسيلة نقل أو تخزين إلكتروني أن تكون آمنة بنسبة 100%، ولا نستطيع ضمان أمان مطلق.',
        'وفي حال وقوع تسريب أو إفشاء لبياناتك الشخصية، نبلّغ الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) خلال المدة النظامية، ونخطرك مباشرةً متى كان الحادث قد يلحق ضررًا بك أو ببياناتك.',
      ],
    },
    {
      heading: 'الأطفال',
      body: [
        'الموقع موجّه لمن أتمّ الثامنة عشرة. لا نجمع بيانات الأطفال عن قصد، وإذا علمنا بجمع بيانات قاصر دون موافقة وليّه أتلفناها.',
      ],
    },
    {
      heading: 'تعديل هذه السياسة',
      body: [
        'قد نحدّث هذه السياسة عند تغيّر خدماتنا أو الأنظمة المعمول بها. يُنشر أي تعديل على هذه الصفحة مع تحديث تاريخ «آخر تحديث» أعلاه، ويسري من تاريخ نشره.',
      ],
    },
  ],
  contact: {
    heading: 'أسئلة عن خصوصيتك؟',
    body: 'فريق UltraFit متاح على واتساب للرد على أي استفسار يخص بياناتك أو طلبك.',
    cta: 'راسلنا على واتساب',
  },
  backToHome: 'العودة للرئيسية',
};

const termsAr: LegalDocument = {
  meta: {
    title: 'UltraFit — الشروط والأحكام',
    description: 'شروط شراء واستخدام باقات UltraFit الرقمية.',
  },
  eyebrow: 'الشؤون القانونية',
  title: 'الشروط والأحكام',
  updatedLabel: 'آخر تحديث',
  updatedDate: '17 أغسطس 2026',
  intro:
    'تنظّم هذه الشروط استخدامك لموقع ultrafits.com وشراءك لأي من باقات UltraFit الرقمية. باستخدامك للموقع أو إتمامك لعملية شراء فإنك توافق على ما ورد فيها.',
  sections: [
    {
      heading: 'الأطراف والقبول',
      body: [
        'يُبرم هذا الاتفاق بينك وبين UltraFit، منشأة مسجّلة في المملكة العربية السعودية برقم سجل تجاري 7053618372.',
        'يجب أن تكون قد أتممت الثامنة عشرة، أو أن تشتري بموافقة وليّ أمرك، وأن تكون البيانات التي تدخلها صحيحة — خصوصًا بريدك الإلكتروني، لأنه وسيلة تسليم المنتج.',
      ],
    },
    {
      heading: 'ما الذي تشتريه',
      body: [
        'باقات UltraFit منتجات رقمية تُسلَّم على شكل ملفات PDF قابلة للتحميل، تضم خطة تمارين وتوجيهًا غذائيًا وشرحًا بالفيديو للحركات، بنسخة للرجال وأخرى للنساء وبثلاثة مستويات: الأساسية وبرو والنخبة.',
      ],
      bullets: [
        'لا تشمل أي باقة مدرّبًا شخصيًا أو متابعة فردية أو استشارة غذائية مباشرة.',
        'لا يوجد اشتراك شهري؛ الدفع مرة واحدة لكل باقة.',
        'الدعم على واتساب مخصّص لأمور الطلب والملفات، لا للتوجيه التدريبي الشخصي.',
      ],
    },
    {
      heading: 'الأسعار والدفع',
      bullets: [
        'جميع الأسعار معروضة بالريال السعودي (SAR) وهي أسعار نهائية شاملة لأي ضريبة مستحقة، فلا يُضاف عليك أي مبلغ عند الدفع.',
        'تُعالَج المدفوعات عبر بوابة StreamPay؛ لا نستقبل بيانات بطاقتك ولا نحتفظ بها.',
        'لا يُعدّ الطلب مكتملًا إلا بعد تأكيد البوابة لسداد المبلغ كاملًا.',
        'نحتفظ بحق تعديل الأسعار في أي وقت؛ يُطبَّق السعر المعروض وقت إتمام عملية الشراء.',
      ],
    },
    {
      heading: 'التسليم والوصول للملفات',
      bullets: [
        'فور تأكيد الدفع يُتاح لك رابط تحميل مباشر، ويُرسل إلى بريدك الإلكتروني نسخة منه.',
        'رابط التحميل صالح لمدة محدودة بعد الشراء لحماية الملفات من إعادة النشر.',
        'إذا انتهت صلاحية الرابط أو لم تصلك الرسالة، راسل الدعم على واتساب وسنعيد إرسال برنامجك دون رسوم إضافية.',
        'تسليم الملف مسؤوليتنا؛ توفير جهاز وبريد صالحين لاستقبال الملف مسؤوليتك.',
      ],
    },
    {
      heading: 'سياسة الاسترداد',
      body: [
        'يستثني نظام التجارة الإلكترونية ولائحته التنفيذية المحتوى الرقمي والبرامج التي تُحمَّل عبر الإنترنت من حق الإعادة النظامي، ومع ذلك نمنحك مهلة استرداد اختيارية:',
        'إذا لم يعجبك البرنامج، يمكنك تقديم طلب استرداد خلال يومين من تاريخ ووقت استلام المنتج.',
      ],
      bullets: [
        'تُقدَّم طلبات الاسترداد عبر واتساب مع ذكر رقم الطلب والبريد المستخدم في الشراء.',
        'تستغرق معالجة المبلغ من 5 إلى 14 يوم عمل بحسب إجراءات بوابة الدفع والبنك المصدر.',
        'إذا لم يصلك المبلغ بعد هذه المدة، تواصل معنا وسنتابع الطلب مع البوابة.',
        'لا يُقبل الاسترداد بعد انقضاء مهلة اليومين، ولا في حال إعادة نشر الملف أو مشاركته.',
      ],
    },
    {
      heading: 'الترخيص والملكية الفكرية',
      body: [
        'جميع محتويات الأدلة والفيديوهات والتصاميم والنصوص في الموقع مملوكة لـ UltraFit ومحميّة بأنظمة حقوق المؤلف.',
        'بشرائك الباقة تحصل على ترخيص شخصي غير حصري وغير قابل للتحويل باستخدام الملف لغرضك الشخصي فقط.',
      ],
      bullets: [
        'يُمنع إعادة بيع الملف أو نشره أو رفعه على أي منصة أو مشاركته مع الغير.',
        'يُمنع اقتباس محتواه أو إعادة إنتاجه تجاريًا دون إذن كتابي منّا.',
        'مخالفة ذلك تُنهي ترخيصك فورًا دون استرداد، مع حفظ حقنا في المطالبة النظامية.',
      ],
    },
    {
      heading: 'إخلاء المسؤولية الصحية',
      body: [
        'محتوى UltraFit ذو طابع تثقيفي ورياضي عام وليس استشارة طبية ولا بديلًا عنها، ولا يُقصد به تشخيص أي حالة أو علاجها.',
        'استشر طبيبك قبل بدء أي برنامج تمارين أو نظام غذائي، خصوصًا إن كنت تعاني من إصابة أو حالة صحية مزمنة أو كنتِ حاملًا. أنت مسؤول عن أدائك للتمارين ضمن حدود قدرتك، وعن التوقف عند أي ألم أو أعراض غير طبيعية.',
      ],
    },
    {
      heading: 'نظام MotionCore',
      body: [
        'نتائج تقييم MotionCore تقديرات تُحسب من المعطيات التي تدخلها بمعادلات عامة معروفة، وقد تختلف عن حالتك الفعلية. تُحفظ هذه المعطيات في متصفحك وحده ولا تُرسل إلينا، ومسح بيانات المتصفح يمسحها نهائيًا دون إمكانية استرجاعها من طرفنا.',
      ],
    },
    {
      heading: 'حدود المسؤولية',
      body: [
        'نقدّم الموقع ومحتواه «كما هو» ونبذل جهدًا معقولًا لإبقائه متاحًا ودقيقًا، دون ضمان خلوّه من الانقطاع أو الأخطاء.',
        'لا نتحمّل المسؤولية عن أي ضرر غير مباشر أو تبعي ناتج عن استخدام الموقع أو المحتوى. وفي جميع الأحوال لا تتجاوز مسؤوليتنا الإجمالية المبلغ الذي دفعته فعليًا مقابل الباقة محل النزاع. ولا يحدّ هذا البند من أي حق يكفله لك النظام السعودي ولا يجوز التنازل عنه.',
      ],
    },
    {
      heading: 'تعديل الشروط',
      body: [
        'قد نعدّل هذه الشروط عند تغيّر خدماتنا أو الأنظمة المعمول بها. تُنشر النسخة المحدّثة على هذه الصفحة مع تحديث تاريخ «آخر تحديث»، وتسري على الطلبات التي تُقدَّم بعد نشرها.',
      ],
    },
    {
      heading: 'القانون الواجب التطبيق',
      body: [
        'تخضع هذه الشروط لأنظمة المملكة العربية السعودية، بما فيها نظام التجارة الإلكترونية ولائحته التنفيذية، وتختص الجهات القضائية السعودية بالنظر في أي نزاع ينشأ عنها.',
      ],
    },
  ],
  contact: {
    heading: 'تحتاج توضيحًا؟',
    body: 'راسلنا على واتساب وسنجيبك عن أي سؤال يخص الشروط أو طلبك.',
    cta: 'راسلنا على واتساب',
  },
  backToHome: 'العودة للرئيسية',
};

const privacyEn: LegalDocument = {
  meta: {
    title: 'UltraFit — Privacy Policy',
    description: 'How UltraFit collects, uses, and protects your data.',
  },
  eyebrow: 'Legal',
  title: 'Privacy Policy',
  updatedLabel: 'Last updated',
  updatedDate: '17 August 2026',
  intro:
    'This policy explains what we collect when you use ultrafits.com or buy an UltraFit package, how we use it, who we share it with, and the rights you have over it.',
  sections: [
    {
      heading: 'Who we are',
      body: [
        'UltraFit is a business registered in the Kingdom of Saudi Arabia under commercial registration number 7053618372, issued by the Ministry of Commerce. We sell digital training and nutrition guides as downloadable PDFs through ultrafits.com.',
        'We are the controller of the personal data collected through the site.',
      ],
    },
    {
      heading: 'What we collect',
      body: ['We collect the minimum needed to complete your order and run the site:'],
      bullets: [
        'Your email address — entered at checkout so we can send you your download link.',
        'Order details — the package purchased, amount and currency, payment status, order number, payment link ID, and the created/paid timestamps.',
        'Usage data — pages visited and key events (checkout opened, purchase completed) via Google Analytics 4, plus what our hosting provider logs automatically, such as IP address and browser type.',
        'Language preference — stored in your own browser so the site opens in your language next time.',
      ],
    },
    {
      heading: 'What we do not collect',
      bullets: [
        'Card details — these are entered directly with our payment gateway, StreamPay. They never pass through our servers and we never store them.',
        'MotionCore assessment data — your height, weight, age, goal, and weight log are stored only in your own browser (localStorage) and are never sent to our servers. Clearing your browser data erases them permanently.',
        'We do not ask you to create an account or a password, and we do not collect sensitive health records or national ID information.',
      ],
    },
    {
      heading: 'Why we use your data',
      bullets: [
        'To fulfil your order: create a payment link, confirm payment, deliver your program file, and resend it when needed.',
        'To support you: answer your questions and process refund requests.',
        'To meet legal obligations: keep sales records as required by Saudi accounting and commercial regulations.',
        'To improve the site: measure page performance in aggregate, never at an individual level.',
      ],
    },
    {
      heading: 'Our legal basis for processing',
      body: [
        'We process your personal data on the specific legal bases set out in the Personal Data Protection Law:',
      ],
      bullets: [
        'Performance of a contract: your email and order details are needed to deliver the product you bought.',
        'Legal obligation: keeping sales records as required by accounting and commercial regulations.',
        'Legitimate interest: measuring site performance and protecting the files from redistribution, in a way that does not prejudice your rights.',
        'Consent: where we explicitly ask for it, and which you may withdraw at any time without affecting the lawfulness of processing carried out beforehand.',
      ],
    },
    {
      heading: 'Service providers and transfers outside the Kingdom',
      body: [
        'We share only what is necessary with providers who process data on our behalf and under our instructions:',
      ],
      bullets: [
        'StreamPay — payment processing and confirmation.',
        'Supabase — hosting the order database and the program files.',
        'Resend — sending your delivery email.',
        'Google Analytics 4 — measuring site traffic.',
        'Our hosting provider — serving the site itself.',
        'Some of these providers run their servers outside Saudi Arabia, which means part of your data may be processed or stored outside the Kingdom. This is limited to what delivering the service requires, and is done in line with the regulations on transferring personal data outside the Kingdom issued by the Saudi Data and AI Authority (SDAIA), without weakening the protection your data receives.',
      ],
    },
    {
      heading: 'Cookies and local storage',
      body: [
        'We use one cookie to remember your chosen language, and Google Analytics cookies to measure visits. We also use your browser’s local storage for the language preference, your MotionCore assessment data, and a flag that stops a purchase being counted twice in our reporting.',
        'Visitors in the EEA and the UK are defaulted to denied consent in Google Analytics, so no advertising or analytics storage is written for them until consent is given.',
        'You can clear or block these from your browser settings. Doing so resets the site to its default language and erases your saved assessment.',
      ],
    },
    {
      heading: 'How long we keep it',
      bullets: [
        'Order and invoice records: kept for as long as Saudi accounting and commercial regulations require.',
        'Download links: they expire a limited time after payment, though you can always ask support to resend your program.',
        'Analytics data: kept according to the retention period configured in Google Analytics.',
      ],
    },
    {
      heading: 'Your rights',
      body: ['The Saudi Personal Data Protection Law gives you the following rights over your data:'],
      bullets: [
        'The right to be informed: to know the legal basis and purpose for collecting your data — which is what this policy sets out.',
        'The right of access: to see the personal data we hold about you.',
        'The right to obtain a copy: to receive your data in a clear, readable format.',
        'The right to correction: to have your data corrected, completed, or updated.',
        'The right to destruction: to have your data destroyed once it is no longer needed for the purpose it was collected for, subject to what we are legally required to keep.',
        'The right to withdraw consent: at any time and going forward, where processing is based on your consent.',
      ],
    },
    {
      heading: 'Exercising your rights, and complaints',
      body: [
        'Message us on WhatsApp using the button at the end of this page. We respond within a reasonable time and may ask for something that ties you to the order — the order number or the email used at checkout — before acting on the request.',
        'If our response does not satisfy you, you have the right to complain to the Saudi Data and AI Authority (SDAIA), the body supervising the Personal Data Protection Law.',
      ],
    },
    {
      heading: 'Security and breach reporting',
      body: [
        'Traffic to the site is encrypted in transit, and program files sit in private, non-public storage that is served through our own server only after payment has been verified. No method of electronic transmission or storage is ever 100% secure, so we cannot guarantee absolute security.',
        'If your personal data is ever leaked or disclosed, we notify the Saudi Data and AI Authority (SDAIA) within the statutory period, and we notify you directly where the incident could cause harm to you or your data.',
      ],
    },
    {
      heading: 'Children',
      body: [
        'The site is intended for people aged 18 and over. We do not knowingly collect data from children, and we will destroy any data we learn was collected from a minor without their guardian’s consent.',
      ],
    },
    {
      heading: 'Changes to this policy',
      body: [
        'We may update this policy as our services or the applicable regulations change. Any update is published on this page with a revised "last updated" date above and takes effect from the date it is published.',
      ],
    },
  ],
  contact: {
    heading: 'Questions about your privacy?',
    body: 'The UltraFit team is on WhatsApp for anything about your data or your order.',
    cta: 'Message us on WhatsApp',
  },
  backToHome: 'Back to home',
};

const termsEn: LegalDocument = {
  meta: {
    title: 'UltraFit — Terms & Conditions',
    description: 'The terms for buying and using UltraFit digital packages.',
  },
  eyebrow: 'Legal',
  title: 'Terms & Conditions',
  updatedLabel: 'Last updated',
  updatedDate: '17 August 2026',
  intro:
    'These terms govern your use of ultrafits.com and your purchase of any UltraFit digital package. By using the site or completing a purchase, you agree to them.',
  sections: [
    {
      heading: 'Parties and acceptance',
      body: [
        'This agreement is between you and UltraFit, a business registered in the Kingdom of Saudi Arabia under commercial registration number 7053618372.',
        'You must be 18 or over, or purchasing with your guardian’s consent, and the details you enter must be accurate — especially your email address, since it is how the product is delivered.',
      ],
    },
    {
      heading: 'What you are buying',
      body: [
        'UltraFit packages are digital products delivered as downloadable PDFs containing a training plan, nutrition guidance, and video demonstrations of each movement — in a men’s and a women’s edition, across three tiers: Basic, Pro, and Elite.',
      ],
      bullets: [
        'No package includes a personal trainer, one-to-one follow-up, or live nutrition consulting.',
        'There is no monthly subscription; each package is a one-time payment.',
        'WhatsApp support covers orders and files, not personal coaching.',
      ],
    },
    {
      heading: 'Prices and payment',
      bullets: [
        'All prices are shown in Saudi riyals (SAR) and are final, inclusive of any tax due — nothing is added at checkout.',
        'Payments are processed by StreamPay. We never receive or store your card details.',
        'An order is only complete once the gateway confirms the full amount has been paid.',
        'We may change prices at any time; the price shown at the moment you complete checkout is the one that applies.',
      ],
    },
    {
      heading: 'Delivery and access',
      bullets: [
        'As soon as payment is confirmed you get a direct download link, and a copy of it is emailed to you.',
        'The download link is valid for a limited period after purchase, which protects the files from redistribution.',
        'If the link expires or the email never arrives, message support on WhatsApp and we will resend your program at no extra cost.',
        'Delivering the file is our responsibility; having a working device and a valid inbox to receive it is yours.',
      ],
    },
    {
      heading: 'Refund policy',
      body: [
        'The E-Commerce Law and its implementing regulations exclude digital content and software downloaded over the internet from the statutory right of return. Even so, we give you a voluntary refund window:',
        'If the program is not for you, you may request a refund within two days of the date and time you received the product.',
      ],
      bullets: [
        'Refund requests go through WhatsApp and should include your order number and the email used at checkout.',
        'Processing takes 5 to 14 business days, depending on the payment gateway and your issuing bank.',
        'If the amount has not reached you after that window, contact us and we will follow it up with the gateway.',
        'Refunds are not available after the two-day window, or where the file has been shared or redistributed.',
      ],
    },
    {
      heading: 'Licence and intellectual property',
      body: [
        'All guides, videos, designs, and text on the site are owned by UltraFit and protected by copyright law.',
        'Buying a package grants you a personal, non-exclusive, non-transferable licence to use the file for your own personal use.',
      ],
      bullets: [
        'You may not resell, publish, upload, or share the file with anyone else.',
        'You may not reproduce or commercially exploit its content without our written permission.',
        'Breaching this terminates your licence immediately without a refund, and we reserve our legal remedies.',
      ],
    },
    {
      heading: 'Health disclaimer',
      body: [
        'UltraFit content is general fitness education. It is not medical advice, not a substitute for it, and is not intended to diagnose or treat any condition.',
        'Consult your doctor before starting any exercise or nutrition program, particularly if you have an injury, a chronic condition, or are pregnant. You are responsible for training within your own limits and for stopping if you feel pain or unusual symptoms.',
      ],
    },
    {
      heading: 'MotionCore',
      body: [
        'MotionCore results are estimates calculated from the values you enter using standard published formulas, and may differ from your actual physiology. Those values are stored in your browser alone and are never sent to us — clearing your browser data erases them permanently, and we cannot restore them.',
      ],
    },
    {
      heading: 'Limitation of liability',
      body: [
        'The site and its content are provided "as is". We make reasonable efforts to keep them available and accurate, but we do not warrant that they will be uninterrupted or error-free.',
        'We are not liable for indirect or consequential loss arising from your use of the site or its content, and in any case our total liability will not exceed the amount you actually paid for the package in dispute. Nothing here limits any right granted to you under Saudi law that cannot be waived.',
      ],
    },
    {
      heading: 'Changes to these terms',
      body: [
        'We may revise these terms as our services or the applicable regulations change. The updated version is published on this page with a revised "last updated" date and applies to orders placed after it is published.',
      ],
    },
    {
      heading: 'Governing law',
      body: [
        'These terms are governed by the laws of the Kingdom of Saudi Arabia, including the E-Commerce Law and its implementing regulations, and Saudi courts have jurisdiction over any dispute arising from them.',
      ],
    },
  ],
  contact: {
    heading: 'Need something clarified?',
    body: 'Message us on WhatsApp and we will answer any question about these terms or your order.',
    cta: 'Message us on WhatsApp',
  },
  backToHome: 'Back to home',
};

export const legalDocuments: Record<'privacy' | 'terms', Record<Locale, LegalDocument>> = {
  privacy: { ar: privacyAr, en: privacyEn },
  terms: { ar: termsAr, en: termsEn },
};

export type LegalDocumentKey = keyof typeof legalDocuments;
