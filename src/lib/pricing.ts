import { Service } from '../types';

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

export const getPriceUnitLabel = (service: Service) => {
    const unit = service.priceUnit?.trim().toLowerCase();
    if (unit === 'per seat' && /sofa/i.test(service.name)) return 'per sofa seat';
    if (unit) return service.priceUnit!.trim();
    if (/package|offer|deal|value pack/i.test(`${service.name} ${service.category}`)) return 'per package';
    return 'per service';
};
