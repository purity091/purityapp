export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    rating: number;
    offerTag?: string;
    isPopular?: boolean;
    soldCount?: number;
    icon?: string;
    features?: string[];
}

export interface Booking {
    id: string;
    customerName: string;
    phoneNumber: string;
    serviceId: string;
    serviceName: string;
    neighborhood: string;
    hours: number;
    date: string;
    time: string;
    numberOfWorkers: number;
    numberOfRooms?: number;
    numberOfCarpets?: number;
    numberOfSingleMattresses?: number;
    numberOfLargeMattresses?: number;
    numberOfSofaSeats?: number;
    numberOfCurtains?: number;
    includeChemicals: boolean;
    notes?: string;
    totalPrice: number;
    status: BookingStatus;
    createdAt: string;
}

export const SAUDI_NEIGHBORHOODS = [
    'عود ميثاء — Oud Metha',
    'وسط مدينة دبي — Downtown Dubai',
    'الخليج التجاري — Business Bay',
    'شارع الشيخ زايد — Sheikh Zayed Road',
    'الوصل — Al Wasl',
    'زعبيل — Zabeel',
    'مركز دبي المالي العالمي — DIFC',
    'سيتي ووك — City Walk',
    'جميرا 1 — Jumeirah 1',
    'جميرا 2 — Jumeirah 2',
    'جميرا 3 — Jumeirah 3',
    'أم سقيم 1 — Umm Suqeim 1',
    'أم سقيم 2 — Umm Suqeim 2',
    'أم سقيم 3 — Umm Suqeim 3',
    'شاطئ جميرا — Jumeirah Beach',
    'جميرا بيتش ريزيدنس — JBR',
    'مرسى دبي — Dubai Marina',
    'لا مير — La Mer',
    'جزيرة بلوواترز — Bluewaters Island',
    'نخلة جميرا — Palm Jumeirah',
    'البرشاء 1 — Al Barsha 1',
    'البرشاء 2 — Al Barsha 2',
    'البرشاء 3 — Al Barsha 3',
    'البرشاء جنوب — Al Barsha South',
    'القوز — Al Quoz',
    'الصفا — Al Safa',
    'مردف — Mirdif',
    'الورقاء — Al Warqa',
    'الخوانيج — Al Khawaneej',
    'ند الشبا — Nad Al Sheba',
    'أبراج بحيرات جميرا — JLT',
    'دبي هيلز استيت — Dubai Hills Estate',
    'تلال الإمارات — Emirates Hills',
    'المرابع العربية — Arabian Ranches',
    'المرابع العربية 2 — Arabian Ranches 2',
    'داماك هيلز — Damac Hills',
    'داماك هيلز 2 — Damac Hills 2',
    'مدينة محمد بن راشد — MBR City',
    'ميدان — Meydan',
    'مجمع دبي للاستثمار — Dubai Investment Park (DIP)',
    'واحة دبي للسيليكون — Dubai Silicon Oasis',
    'أرجان — Arjan',
    'مجان — Majan',
    'دبي لاند — Dubailand',
    'قرية جميرا الدائرية — JVC',
    'مثلث قرية جميرا — JVT',
    'الفرجان — Al Furjan',
    'تاون سكوير — Town Square',
    'سيرينا — Serena',
    'مدينة دبي للإعلام — Dubai Media City',
    'مدينة دبي للإنترنت — Dubai Internet City',
    'مدينة دبي الطبية — Dubai Healthcare City',
    'مدينة دبي الرياضية — Dubai Sports City',
    'مدينة دبي للإنتاج — Dubai Production City',
    'دبي الجنوب — Dubai South'
];

export const TIME_SLOTS = [
    '9:00 AM – 12:00 PM',
    '12:00 PM – 3:00 PM',
    '3:00 PM – 6:00 PM'
];

export const CATEGORIES = [
    'Home Cleaning', 'Furniture', 'Flooring', 'Commercial', 'Care', 'Laundry'
];
