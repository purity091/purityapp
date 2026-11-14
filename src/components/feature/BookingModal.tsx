import React, { useRef, useState, useEffect } from 'react';
import { Calendar, MapPin, Loader2, CheckCircle2, Heart, Share2, Star, Gift, Eye } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, TextArea } from '../ui/Input';
import { useBookings, BookingFormData, CreateBookingData } from '../../context/BookingContext';
import { Service, TIME_SLOTS } from '../../types';
import { SafeImage } from '../ui/SafeImage';
import { normalizePhone, useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { Link, useNavigate } from 'react-router-dom';
import { getPricePresentation, getPriceUnitLabel } from '../../lib/pricing';
import { LocationPicker } from './LocationPicker';
import { useLanguage } from '../../context/LanguageContext';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service | null;
}

const HOURLY_SERVICE_SLUGS = [
    'housekeeping-part-time-maid', 'deep-cleaning', 'regular-cleaning', 'move-in-out-cleaning',
    'party-cleaning', 'wash-and-iron', 'pet-sitting',
];

const MATERIAL_SERVICE_SLUGS = [
    'deep-cleaning', 'regular-cleaning', 'move-in-out-cleaning', 'party-cleaning', 'wash-and-iron', 'pet-sitting',
];

const MAP_SELECTED_AREA = 'Map selected';
const MIN_VIEWER_COUNT = 30;
const MAX_VIEWER_COUNT = 50;

const randomViewerCount = () => Math.floor(Math.random() * (MAX_VIEWER_COUNT - MIN_VIEWER_COUNT + 1)) + MIN_VIEWER_COUNT;

const calculateBookingTotal = (service: Service, formData: BookingFormData) => {
    let total = service.price;

    if (HOURLY_SERVICE_SLUGS.includes(service.slug || '')) {
        total = service.price * formData.hours * formData.numberOfWorkers;
    } else if (service.slug === 'babysitting-at-home') {
        total = service.price * formData.numberOfWorkers;
    } else if (service.slug === 'floor-cleaning') {
        total = formData.numberOfRooms === 1 ? 200 : (formData.numberOfRooms === 2 ? 300 : formData.numberOfRooms * 150);
    } else if (service.slug === 'carpet-cleaning') {
        total = 200 * formData.numberOfCarpets;
    } else if (service.slug === 'mattress-cleaning') {
        total = (150 * formData.numberOfSingleMattresses) + (200 * formData.numberOfLargeMattresses);
        if (total === 0) total = 150;
    } else if (service.slug === 'sofa-cleaning') {
        total = 35 * formData.numberOfSofaSeats;
    } else if (service.slug === 'curtain-cleaning') {
        total = 200 * formData.numberOfCurtains;
    }

    if (MATERIAL_SERVICE_SLUGS.includes(service.slug || '') && formData.includeChemicals) {
        total += 30;
    }

    return total;
};

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, service }) => {
    const { addBooking } = useBookings();
    const { user } = useAuth();
    const { wishlistIds, toggleWishlist } = useWishlist();
    const { language, t } = useLanguage();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<BookingFormData>({
        customerName: '',
        phoneNumber: '',
        neighborhood: MAP_SELECTED_AREA,
        address: '',
        latitude: null,
        longitude: null,
        hours: 3,
        numberOfWorkers: 1,
        numberOfRooms: 1,
        numberOfCarpets: 1,
        numberOfSingleMattresses: 0,
        numberOfLargeMattresses: 0,
        numberOfSofaSeats: 3,
        numberOfCurtains: 1,
        includeChemicals: false,
        date: '',
        time: '',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [saveNotice, setSaveNotice] = useState('');
    const [shareNotice, setShareNotice] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [confirmedBookingPrice, setConfirmedBookingPrice] = useState<number | null>(null);
    const bookingRequestIdRef = useRef<string | null>(null);
    const [activeDetailTab, setActiveDetailTab] = useState<'about' | 'needtoknow' | 'redeem' | 'reviews'>('about');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [viewerCount, setViewerCount] = useState(randomViewerCount);

    const today = new Date();
    const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

    useEffect(() => {
        if (isOpen) {
            setShowSuccess(false);
            setFormError('');
            setSaveNotice('');
            setShareNotice('');
            setConfirmedBookingPrice(null);
            setActiveDetailTab('about');
            setAcceptedTerms(false);
            bookingRequestIdRef.current = null;
            setFormData({
                customerName: user?.fullName || '',
                phoneNumber: user?.phone || '',
                neighborhood: MAP_SELECTED_AREA,
                address: '',
                latitude: null,
                longitude: null,
                hours: 3,
                numberOfWorkers: 1,
                numberOfRooms: 1,
                numberOfCarpets: 1,
                numberOfSingleMattresses: 0,
                numberOfLargeMattresses: 0,
                numberOfSofaSeats: 3,
                numberOfCurtains: 1,
                includeChemicals: false,
                date: todayStr,
                time: '',
                notes: '',
            });
        }
    }, [isOpen, todayStr, service?.id, user?.fullName, user?.phone]);

    useEffect(() => {
        if (!isOpen) return;

        setViewerCount(randomViewerCount());
        const interval = window.setInterval(() => {
            setViewerCount(current => {
                const direction = Math.random() < 0.5 ? -1 : 1;
                const change = Math.floor(Math.random() * 3) + 1;
                return Math.min(MAX_VIEWER_COUNT, Math.max(MIN_VIEWER_COUNT, current + direction * change));
            });
        }, 7000);

        return () => window.clearInterval(interval);
    }, [isOpen, service?.id]);

    if (!service) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || user.role !== 'customer') {
            onClose();
            navigate('/account', { state: { from: '/' } });
            return;
        }

        const normalizedPhone = normalizePhone(formData.phoneNumber);
        if (!formData.customerName.trim()) {
            setFormError(t('errorFullName'));
            return;
        }
        if (!/^(05\d{8}|\+9715\d{8})$/.test(normalizedPhone)) {
            setFormError(t('errorPhone'));
            return;
        }
        if (!formData.address.trim() || formData.latitude === null || formData.longitude === null || !formData.date || !formData.time) {
            setFormError(t('errorBookingFields'));
            return;
        }
        if (formData.date < todayStr) {
            setFormError(t('errorDate'));
            return;
        }
        if (!acceptedTerms) {
            setFormError(t('errorTerms'));
            return;
        }

        setFormError('');
        setIsSubmitting(true);

        const calculatedPrice = calculateBookingTotal(service, formData);

        const bookingData: CreateBookingData = {
            ...formData,
            phoneNumber: normalizedPhone,
            serviceId: service.id,
            serviceName: service.name,
            totalPrice: calculatedPrice
        };

        try {
            bookingRequestIdRef.current ||= typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const saveResult = await addBooking(bookingData, bookingRequestIdRef.current);
            if (saveResult.error) {
                setFormError(saveResult.error);
                return;
            }
            bookingRequestIdRef.current = null;
            setConfirmedBookingPrice(saveResult.booking?.totalPrice ?? calculatedPrice);
            setSaveNotice(saveResult.synced ? '' : t('bookingSavedDevice'));
            setShowSuccess(true);
        } catch {
            setFormError(t('errorSaveBooking'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWhatsappRedirect = () => {
        const isHourly = HOURLY_SERVICE_SLUGS.includes(service.slug || '');
        const isDaily = service.slug === 'babysitting-at-home';
        const calculatedPrice = confirmedBookingPrice ?? calculateBookingTotal(service, formData);

        const messageLines = [
            `Hello, I would like to confirm my booking:`,
            `Service: ${service.name}`,
            `Name: ${formData.customerName}`,
            `Phone: ${formData.phoneNumber}`,
            `Service Address: ${formData.address || 'N/A'}`,
            `Map Location: ${formData.latitude !== null && formData.longitude !== null ? `https://www.google.com/maps?q=${formData.latitude},${formData.longitude}` : 'N/A'}`,
            `Date & Time: ${formData.date} at ${formData.time}`
        ];

        if (isHourly) {
            messageLines.push(`Hours: ${formData.hours}`);
            messageLines.push(`Workers: ${formData.numberOfWorkers}`);
        } else if (isDaily) {
            messageLines.push(`Workers: ${formData.numberOfWorkers}`);
        } else if (service.slug === 'floor-cleaning') {
            messageLines.push(`Rooms: ${formData.numberOfRooms}`);
        } else if (service.slug === 'carpet-cleaning') {
            messageLines.push(`Carpets: ${formData.numberOfCarpets}`);
        } else if (service.slug === 'mattress-cleaning') {
            messageLines.push(`Single Mattresses: ${formData.numberOfSingleMattresses}`);
            messageLines.push(`Large Mattresses: ${formData.numberOfLargeMattresses}`);
        } else if (service.slug === 'sofa-cleaning') {
            messageLines.push(`Sofa Seats: ${formData.numberOfSofaSeats}`);
        } else if (service.slug === 'curtain-cleaning') {
            messageLines.push(`Curtains: ${formData.numberOfCurtains}`);
        }

        if (MATERIAL_SERVICE_SLUGS.includes(service.slug || '')) {
            messageLines.push(`Materials: ${formData.includeChemicals ? 'Yes (+30 AED)' : 'No'}`);
        }

        if (formData.notes) {
            messageLines.push(`Notes: ${formData.notes}`);
        }

        messageLines.push(`Total Price: ${calculatedPrice.toFixed(2)} AED`);

        const fullMessage = messageLines.join('\n');
        window.location.href = `https://wa.me/971544556106?text=${encodeURIComponent(fullMessage)}`;
        onClose();
    };

    const handleWishlist = () => {
        void toggleWishlist(service.id);
    };

    const handleShare = async () => {
        const shareText = `${service.name} - Purity Home Services (${service.price} AED)`;
        try {
            if (navigator.share) {
                await navigator.share({ title: service.name, text: shareText, url: window.location.href });
                return;
            }
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareText);
                setShareNotice(t('copied'));
            } else {
                setShareNotice(t('sharingUnavailable'));
            }
            window.setTimeout(() => setShareNotice(''), 2500);
        } catch {
            // Sharing can be cancelled by the user; no error state is needed.
        }
    };

    const finalTotalPrice = calculateBookingTotal(service, formData);
    const isWishlisted = wishlistIds.includes(service.id);
    const { originalPrice: originalPriceDisplay, discount: discountPercentage } = getPricePresentation(service);
    const priceUnit = getPriceUnitLabel(service, language);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={showSuccess ? t('success') : service.name} isDismissible={false}>
            <>
                {showSuccess ? (
                    <div className="animate-fade-in space-y-4 py-3"
                    >
                        {/* Header */}
                        <div className="flex flex-col items-center gap-2 text-center pb-4 border-b border-gray-100">
                            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <CheckCircle2 size={34} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">{t('bookingReceived')}</h3>
                                <p className="text-xs text-gray-500 font-semibold mt-0.5">{t('lastStep')} →</p>
                                {saveNotice && <p className="mt-2 max-w-xs rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[10px] font-semibold leading-4 text-amber-800">{saveNotice}</p>}
                            </div>
                        </div>

                        {/* Two-column visual status cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Card 1: Done */}
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex flex-col items-center text-center gap-2">
                                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                                    <CheckCircle2 size={22} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <span className="text-sm font-black text-emerald-900 block">{t('done')} ✓</span>
                                    <span className="text-[11px] text-emerald-800 font-semibold leading-snug block mt-0.5">{t('bookingSaved')}</span>
                                </div>
                            </div>

                            {/* Card 2: Action needed */}
                            <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 flex flex-col items-center text-center gap-2 relative overflow-hidden">
                                <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                </span>
                                <div className="w-11 h-11 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                </div>
                                <div>
                                    <span className="text-sm font-black text-amber-900 block">{t('actionRequired')}</span>
                                    <span className="text-[11px] text-amber-800 font-semibold leading-snug block mt-0.5">{t('tapWhatsapp')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Big CTA */}
                        <Button
                            onClick={handleWhatsappRedirect}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-600/25 py-4 text-sm rounded-2xl flex items-center justify-center gap-2.5"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-none" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            {t('openWhatsapp')}
                        </Button>
                        <p className="text-center text-[10px] text-gray-500 font-semibold">
                            {t('bookingNotFinal')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-6 lg:gap-8">

                        {/* LEFT COLUMN: Service explanation, image, tabs, and key details (50%). */}
                        <div className="min-w-0 space-y-3 md:space-y-4">
                            {/* Service Header Info */}
                            <div className="space-y-2">
                                <h2 className="text-lg font-black leading-tight text-gray-900 sm:text-2xl">
                                    {service.name} {discountPercentage > 0 && <span className="text-emerald-700 font-extrabold text-lg sm:text-xl">({discountPercentage}% Off)</span>}
                                </h2>

                                {/* Merchant & Location Bar */}
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-800 font-bold">
                                    <span className="text-gray-900 font-extrabold">Purity Home Services</span>
                                    <span>•</span>
                                    <span className="text-gray-800">Dubai</span>
                                    <span>•</span>
                                    <span className="text-gray-800 flex items-center gap-1">
                                        <MapPin size={12} className="text-rose-500 inline" /> All Neighborhoods
                                    </span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1 text-amber-500 font-black">
                                        <Star size={13} fill="currentColor" />
                                        <span>4.9</span>
                                        <span className="text-gray-700 font-bold">(120+ reviews)</span>
                                    </div>
                                </div>

                                {/* Popular Gift Badge */}
                                <div className="flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200/80 px-2.5 py-0.5 rounded-full w-fit text-[11px] font-extrabold">
                                    <Gift size={12} />
                                    <span>{t('popularDeal')}</span>
                                </div>
                            </div>

                            {/* Service Hero Image & Action Overlay (16:9 Aspect Ratio Maintained) */}
                            <div className="relative aspect-[16/9] max-h-44 w-full rounded-xl overflow-hidden shadow-xs group">
                                <SafeImage src={service.image} alt={service.name} loading="eager" className="w-full h-full object-cover object-center" />
                                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                                    <button
                                        type="button"
                                        onClick={handleWishlist}
                                        aria-label={isWishlisted ? t('removeFromWishlist') : t('addToWishlist')}
                                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                        className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-rose-600 shadow-sm transition-all"
                                    >
                                        <Heart size={14} fill={isWishlisted ? '#e11d48' : 'none'} className={isWishlisted ? 'text-rose-600' : ''} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        aria-label={t('shareService')}
                                        title={t('shareService')}
                                        className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-primary-600 shadow-sm transition-all"
                                    >
                                        <Share2 size={14} />
                                    </button>
                                </div>
                            </div>
                            {shareNotice && (
                                <p role="status" aria-live="polite" className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[11px] font-semibold text-emerald-800">
                                    {shareNotice}
                                </p>
                            )}

                            {/* Groupon-style Section Navigation Tabs */}
                            <div className="flex gap-4 overflow-x-auto whitespace-nowrap border-b border-gray-200 pt-1 text-[11px] font-black text-gray-800 md:gap-6 md:text-xs">
                                <button
                                    type="button"
                                    onClick={() => setActiveDetailTab('about')}
                                    className={`pb-2 transition-colors border-b-2 ${activeDetailTab === 'about' ? 'border-primary-600 text-gray-900 font-black' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
                                >
                                    {t('about')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveDetailTab('needtoknow')}
                                    className={`pb-2 transition-colors border-b-2 ${activeDetailTab === 'needtoknow' ? 'border-primary-600 text-gray-900 font-black' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
                                >
                                    {t('needToKnow')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveDetailTab('redeem')}
                                    className={`pb-2 transition-colors border-b-2 ${activeDetailTab === 'redeem' ? 'border-primary-600 text-gray-900 font-black' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
                                >
                                    {t('whereToRedeem')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveDetailTab('reviews')}
                                    className={`pb-2 transition-colors border-b-2 ${activeDetailTab === 'reviews' ? 'border-primary-600 text-gray-900 font-black' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
                                >
                                    {t('reviews')}
                                </button>
                            </div>

                            {/* Tab Content Display */}
                            <div className="text-xs text-gray-800 space-y-3 font-medium">
                                {activeDetailTab === 'about' && (
                                    <div className="space-y-3">
                                        <p className="leading-relaxed text-gray-800 font-semibold">
                                            {service.description}
                                        </p>
                                        <div className="space-y-2 pt-1">
                                            <h4 className="font-extrabold text-gray-900 text-xs">{t('whatWeOffer')}:</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {[
                                                    t('professionalVettedStaff'),
                                                    t('hotelStandardCleaning'),
                                                    t('ecoFriendlyMaterials'),
                                                    t('flexibleTimeSlots')
                                                ].map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 p-2 rounded-xl">
                                                        <CheckCircle2 size={14} className="text-emerald-600 flex-none" />
                                                        <span className="font-bold text-gray-900">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeDetailTab === 'needtoknow' && (
                                    <div className="space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-gray-800">
                                        <p className="font-bold text-gray-900">• {t('electricityWater')}</p>
                                        <p className="font-bold text-gray-900">• {t('freeCancellation')}</p>
                                        <p className="font-bold text-gray-900">• {t('healthSafety')}</p>
                                    </div>
                                )}

                                {activeDetailTab === 'redeem' && (
                                    <div className="space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-gray-800">
                                        <span className="font-extrabold text-gray-900 block">{t('allDubaiNeighborhoods')}:</span>
                                        <p className="text-gray-700">Downtown Dubai, Dubai Marina, JBR, Palm Jumeirah, Business Bay, JLT, Arabian Ranches, Mirdif, and more.</p>
                                    </div>
                                )}

                                {activeDetailTab === 'reviews' && (
                                    <div className="space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                                        {service.reviewCount ? <div className="flex items-center gap-2">
                                            <div className="flex text-amber-500">
                                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.round(service.rating) ? 'currentColor' : 'none'} className={i < Math.round(service.rating) ? 'text-amber-500' : 'text-gray-300'} />)}
                                            </div>
                                            <span className="font-black text-gray-900">{service.rating.toFixed(1)} / 5.0</span>
                                            <span className="text-gray-700 font-bold">({service.reviewCount} {language === 'fr' ? 'avis vérifiés' : language === 'hi' ? 'सत्यापित समीक्षाएं' : 'verified reviews'})</span>
                                        </div> : <p className="text-sm font-bold text-gray-600">{language === 'fr' ? 'Aucun avis vérifié pour le moment.' : language === 'hi' ? 'अभी कोई सत्यापित समीक्षा नहीं है।' : 'No verified reviews for this service yet.'}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Booking form and pricing (50%). */}
                        <div className="min-w-0 space-y-3 md:space-y-4">
                            {/* Groupon Option Card Container */}
                            <div className="relative space-y-2 rounded-xl border-2 border-primary-600/90 bg-primary-50/30 p-2.5 shadow-sm md:space-y-3 md:rounded-2xl md:p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="block text-xs font-black leading-tight text-slate-950">{service.name}</span>
                                        <span className="mt-0.5 block text-[10px] font-semibold text-slate-600">{t('instantOnlineBooking')}</span>
                                    </div>
                                    {/* Pricing Stack */}
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {originalPriceDisplay && <span className="text-xs font-semibold text-slate-500 line-through">AED {originalPriceDisplay}</span>}
                                            <span className="text-base font-black text-emerald-700">AED {service.price}</span>
                                            <span className="text-[10px] font-semibold text-slate-700">{priceUnit}</span>
                                            {discountPercentage > 0 && <span className="rounded-md border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-800">-{discountPercentage}%</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-primary-100 pt-2 text-[10px] font-semibold text-slate-700">
                                    <span>120+ {t('bought')}</span>
                                    <span className="text-emerald-700 font-extrabold">{t('instantConfirmation')}</span>
                                </div>
                            </div>

                            {/* Booking Form Inputs (100% UNTOUCHED INPUT COMPONENTS!) */}
                            <form onSubmit={handleSubmit} className="space-y-2 rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm md:space-y-3 md:rounded-2xl md:p-4">
                                <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
                                    <h4 className="flex items-center gap-1.5 text-[11px] font-black uppercase text-gray-900 md:text-xs">
                                        <Calendar size={13} className="text-primary-600 md:h-3.5 md:w-3.5" /> {t('enterBookingDetails')}
                                    </h4>
                                    <span className="text-[10px] font-bold text-gray-500">{t('stepOf')}</span>
                                </div>
                                {formError && (
                                    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-[11px] font-semibold leading-4 text-red-700">
                                        {formError}
                                    </p>
                                )}

                                <div className="space-y-1.5 md:space-y-2.5">
                                    {/* Row 1: Contact (Name & Phone) */}
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <Input
                                            label={t('fullName')}
                                            placeholder="John Doe"
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            required
                                        />
                                        <Input
                                            label={t('phoneNumber')}
                                            placeholder="05XXXXXXXX"
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            disabled={!!user?.phone}
                                            required
                                        />
                                    </div>

                                    <Input
                                        label={t('serviceAddress')}
                                        placeholder={t('serviceAddressPlaceholder')}
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        required
                                    />

                                    <LocationPicker
                                        latitude={formData.latitude}
                                        longitude={formData.longitude}
                                        onChange={({ latitude, longitude }) => setFormData({ ...formData, latitude, longitude })}
                                    />

                                    {/* Row 3: Date & Time */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            label={t('date')}
                                            type="date"
                                            min={todayStr}
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                        <Select
                                            label={t('time')}
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            options={[
                                                { value: '', label: t('selectSlot') },
                                                ...TIME_SLOTS.map(t => ({ value: t, label: t }))
                                            ]}
                                            required
                                        />
                                    </div>

                                    {/* Options: Duration & Staff count */}
                                    {([...HOURLY_SERVICE_SLUGS, 'babysitting-at-home'].includes(service.slug || '')) && (
                                        <div className="space-y-2 pt-1 border-t border-gray-100">
                                            {service.slug !== 'babysitting-at-home' && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-xs font-bold text-gray-900">
                                                        <span>{t('duration')}</span>
                                                        <span className="text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-full text-[11px]">{formData.hours} {t('hours')}</span>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        {[3, 4, 5, 6].map(num => (
                                                            <button
                                                                key={num}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, hours: num })}
                                                                className={`w-8 h-8 rounded-lg text-xs font-black border transition-all ${
                                                                    formData.hours === num
                                                                        ? 'bg-primary-600 border-primary-600 text-white'
                                                                        : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                {num}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-gray-900 block">{t('staffCount')}</span>
                                                <div className="flex gap-1.5">
                                                    {[1, 2, 3].map(num => (
                                                        <button
                                                            key={num}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, numberOfWorkers: num })}
                                                            className={`w-8 h-8 rounded-lg text-xs font-black border transition-all ${
                                                                formData.numberOfWorkers === num
                                                                    ? 'bg-primary-600 border-primary-600 text-white'
                                                                    : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {num}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Chemical materials option */}
                                    {MATERIAL_SERVICE_SLUGS.includes(service.slug || '') && (
                                        <div className="flex gap-2 pt-1">
                                            {[{ val: false, lbl: t('iHaveMaterials') }, { val: true, lbl: t('includeMaterials') }].map((opt) => (
                                                <button
                                                    key={String(opt.val)}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, includeChemicals: opt.val })}
                                                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-extrabold border transition-all ${
                                                        formData.includeChemicals === opt.val
                                                            ? 'bg-primary-50 border-2 border-primary-600 text-primary-900'
                                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {opt.lbl}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <TextArea
                                        label={t('notesOptional')}
                                        placeholder={t('notesPlaceholder')}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                    />

                                    <div className="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100 px-3 py-2.5">
                                        <span className="text-xs font-bold text-gray-700">{t('estimatedTotal')}</span>
                                        <strong className="text-base font-black text-primary-700">{finalTotalPrice.toFixed(2)} AED</strong>
                                    </div>

                                    <label className="flex items-start gap-2 text-[11px] font-medium leading-5 text-gray-600">
                                        <input type="checkbox" checked={acceptedTerms} onChange={event => setAcceptedTerms(event.target.checked)} className="mt-1 h-4 w-4 accent-primary-700" required />
                                        <span>{t('agreeTo')} <Link to="/terms" target="_blank" className="font-black text-primary-700 underline">{t('terms')}</Link> {t('and')} <Link to="/privacy" target="_blank" className="font-black text-primary-700 underline">{t('privacy')}</Link>.</span>
                                    </label>

                                    {/* Urgency Counter & Submit Button */}
                                    <div className="pt-2 space-y-2 border-t border-gray-100">
                                        <div className="flex items-center justify-center gap-1.5 bg-amber-50/80 text-amber-900 border border-amber-200/80 py-1.5 px-3 rounded-xl text-[11px] font-black text-center shadow-2xs">
                                            <Eye size={13} className="text-amber-600 flex-none" />
                                            <span>{t('overViewed').replace('viewed', `${viewerCount} viewed`)}</span>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 md:py-3.5"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : t('confirmBookNow')}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>

                    </div>
                )}
            </>
        </Modal>
    );
};
