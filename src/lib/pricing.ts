import { Service } from '../types';
import { Language } from '../context/LanguageContext';

const MAX_DISPLAY_DISCOUNT = 25;

export const getPricePresentation = (service: Service) => {
    const sourceOriginalPrice = Number(service.originalPrice);
    const hasComparePrice = Number.isFinite(sourceOriginalPrice) && sourceOriginalPrice > service.price;

    if (!hasComparePrice) return { originalPrice: undefined, discount: 0 };

    // Keep the storefront offer credible even if an imported legacy value is too high.
    const maximumDisplayOriginal = Math.floor(service.price / (1 - MAX_DISPLAY_DISCOUNT / 100));
    const originalPrice = Math.max(service.price + 1, Math.min(sourceOriginalPrice, maximumDisplayOriginal));
    return {
        originalPrice,
        discount: Math.round(((originalPrice - service.price) / originalPrice) * 100),
    };
};

export const getPriceUnitLabel = (service: Service, language: Language = 'en') => {
    const unit = service.priceUnit?.trim().toLowerCase();
    const key = unit === 'per seat' && service.slug === 'sofa-cleaning' ? 'perSeat' :
        unit === 'per hour' ? 'perHour' : unit === 'per day' ? 'perDay' : unit === 'per carpet' ? 'perCarpet' :
            unit === 'per mattress' ? 'perMattress' : unit === 'per seat' ? 'perSeat' : unit === 'per curtain' ? 'perCurtain' :
                unit === 'starts from' ? 'startsFrom' : /package|offer|deal|value pack/i.test(`${service.slug || ''} ${service.category}`) ? 'perPackage' : 'perService';
    const labels: Record<Language, Record<string, string>> = {
        en: { perHour: 'per hour', perDay: 'per day', perCarpet: 'per carpet', perMattress: 'per mattress', perSeat: service.slug === 'sofa-cleaning' ? 'per sofa seat' : 'per seat', perCurtain: 'per curtain', perPackage: 'per package', perService: 'per service', startsFrom: 'starts from' },
        fr: { perHour: 'par heure', perDay: 'par jour', perCarpet: 'par tapis', perMattress: 'par matelas', perSeat: service.slug === 'sofa-cleaning' ? 'par siège de canapé' : 'par siège', perCurtain: 'par rideau', perPackage: 'par forfait', perService: 'par service', startsFrom: 'à partir de' },
        hi: { perHour: 'प्रति घंटा', perDay: 'प्रति दिन', perCarpet: 'प्रति कालीन', perMattress: 'प्रति गद्दा', perSeat: service.slug === 'sofa-cleaning' ? 'प्रति सोफा सीट' : 'प्रति सीट', perCurtain: 'प्रति परदा', perPackage: 'प्रति पैकेज', perService: 'प्रति सेवा', startsFrom: 'से शुरू' },
    };
    return labels[language][key];
};
