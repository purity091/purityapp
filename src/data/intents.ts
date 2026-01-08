export type IntentType = 'learn' | 'experience' | 'discount' | 'community';

export interface IntentContent {
    id: string;
    type: IntentType;
    title: string;
    items: {
        id: string;
        title: string;
        description: string;
        image: string;
        suitableFor: string[];
        notSuitableFor: string[];
        ctaText: string;
        actionType: 'book' | 'read' | 'subscribe';
        serviceId?: string; // Link to actual booking service if applicable
    }[];
}

export const intentsData: IntentContent[] = [
    {
        id: 'learn',
        type: 'learn',
        title: 'تعلم كيف تحافظ على منزلك كالجديد',
        items: [
            {
                id: 'guide-1',
                title: 'دليل إزالة البقع الصعبة',
                description: 'وفرنا لك دليلاً شاملاً للتعامل مع بقع القهوة، الحبر، والزيوت باستخدام مواد منزلية بسيطة.',
                image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
                suitableFor: ['من يحب الحلول المنزلية السريعة', 'تنظيف الحوادث البسيطة فوراً'],
                notSuitableFor: ['البقع القديمة جداً', 'الأقمشة الحريرية أو الحساسة'],
                ctaText: 'اقرأ الدليل مجاناً',
                actionType: 'read'
            },
            {
                id: 'guide-2',
                title: 'كيف تختار مواد التنظيف الآمنة؟',
                description: 'تعرف على الفرق بين المواد التجارية والمواد الآمنة على الأطفال والحيوانات الأليفة.',
                image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800',
                suitableFor: ['العائلات مع أطفال', 'مرضى الحساسية'],
                notSuitableFor: ['من يبحث عن أقوى مواد كيميائية صناعية'],
                ctaText: 'تصفح المقال',
                actionType: 'read'
            }
        ]
    },
    {
        id: 'experience',
        type: 'experience',
        title: 'تجارب تنظيف استثنائية لمنزلك',
        items: [
            {
                id: 'srv-deep',
                title: 'جلسة "بيورتي" العميقة',
                description: 'ليست مجرد تنظيف، بل إعادة ضبط شاملة للمنزل. تشمل تلميع الأرضيات، تعقيم الجو، وتنظيف التفاصيل الدقيقة.',
                image: 'https://images.unsplash.com/photo-1581578731117-104f8a7469d0?auto=format&fit=crop&q=80&w=800',
                suitableFor: ['تجهيز المنزل للمناسبات', 'التنظيف الموسمي الشامل'],
                notSuitableFor: ['التنظيف اليومي السريع', 'زيارة أقل من 4 ساعات'],
                ctaText: 'احجز التجربة',
                actionType: 'book',
                serviceId: '1'
            },
            {
                id: 'srv-spa',
                title: 'سبا الأثاث والمفروشات',
                description: 'أعد الحياة لكنبك وسجادك مع تقنيات الغسيل بالبخار والتجفيف السريع والتعطير.',
                image: 'https://images.unsplash.com/photo-1616627581559-052e46387062?auto=format&fit=crop&q=80&w=800',
                suitableFor: ['إزالة الروائح الكريهة', 'تجديد ألوان الأثاث'],
                notSuitableFor: ['تغيير قماش الكنب الممزق'],
                ctaText: 'دلع أثاثك',
                actionType: 'book',
                serviceId: '5'
            }
        ]
    },
    {
        id: 'discount',
        type: 'discount',
        title: 'خيارات ذكية توفر عليك',
        items: [
            {
                id: 'pkg-economy',
                title: 'باقة الراحة الشهرية',
                description: 'احصل على 4 زيارات شهرية بسعر مخفض، مع تثبيت العاملة المحترفة التي تعجبك.',
                image: 'https://images.unsplash.com/photo-1527513063539-bd0f2063f9db?auto=format&fit=crop&q=80&w=800',
                suitableFor: ['من يحب الاستقرار والانتظام', 'توفير 20% من التكلفة'],
                notSuitableFor: ['من يحتاج زيارة واحدة فقط'],
                ctaText: 'اشترك الآن',
                actionType: 'book',
                serviceId: 'sub-1' // Symbolic ID
            },
            {
                id: 'offer-flash',
                title: 'ساعات السعادة (وسط الأسبوع)',
                description: 'احجز يومي الاثنين أو الثلاثاء واحصل على ساعة إضافية مجاناً لكل 4 ساعات.',
                image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=800',
                suitableFor: ['ربات البيوت والمتفرغين صباحاً'],
                notSuitableFor: ['من لا يستطيع التواجد وسط الأسبوع'],
                ctaText: 'اغتنم الفرصة',
                actionType: 'book',
                serviceId: '3'
            }
        ]
    },
    {
        id: 'community',
        type: 'community',
        title: 'كن جزءاً من عائلة بيورتي',
        items: [
            {
                id: 'comm-vip',
                title: 'عضوية النخبة (قريباً)',
                description: 'تمتع بأولوية الحجز في الأعياد، وخصومات حصرية لدى شركائنا في الصيانة والديكور.',
                image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800',
                suitableFor: ['العملاء الدائمين', 'من يبحث عن الرفاهية والسرعة'],
                notSuitableFor: ['الاستخدام النادر جداً'],
                ctaText: 'سجل اهتمامك',
                actionType: 'subscribe'
            },
            {
                id: 'comm-news',
                title: 'نشرة "بيت عامر"',
                description: 'نرسل لك نصيحة واحدة فقط أسبوعياً تجعل منزلك أجمل، دون إزعاج أو إعلانات.',
                image: 'https://images.unsplash.com/photo-1596464716127-f9a829be16fd?auto=format&fit=crop&q=80&w=800',
                suitableFor: ['محبي التنظيم والديكور'],
                notSuitableFor: ['من يكره رسائل البريد الإلكتروني'],
                ctaText: 'انضم للقائمة',
                actionType: 'subscribe'
            }
        ]
    }
];
