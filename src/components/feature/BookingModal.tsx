// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Loader2, CheckCircle2, Heart, Share2, Star, Gift, Eye } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, TextArea } from '../ui/Input';
import { useBookings, BookingFormData, CreateBookingData } from '../../context/BookingContext';
import { Service, SAUDI_NEIGHBORHOODS, TIME_SLOTS } from '../../types';
import { readWishlist, toggleWishlist } from '../../lib/wishlist';
import { SafeImage } from '../ui/SafeImage';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service | null;
}

const HOURLY_SERVICE_NAMES = [
    'Housekeeping / Part-time Maid',
    'Deep Cleaning',
    'Regular Cleaning',
    'Move In/Out Cleaning',
    'Party Cleaning',
    'Wash and Iron',
    'Pet Sitting',
];

const MATERIAL_SERVICE_NAMES = [
    'Deep Cleaning',
    'Regular Cleaning',
    'Move In/Out Cleaning',
    'Party Cleaning',
    'Wash and Iron',
    'Pet Sitting',
];

const calculateBookingTotal = (service: Service, formData: BookingFormData) => {
    let total = service.price;

    if (HOURLY_SERVICE_NAMES.includes(service.name)) {
        total = service.price * formData.hours * formData.numberOfWorkers;
    } else if (service.name === 'Babysitting At Home') {
        total = service.price * formData.numberOfWorkers;
    } else if (service.name === 'Floor Cleaning') {
        total = formData.numberOfRooms === 1 ? 200 : (formData.numberOfRooms === 2 ? 300 : formData.numberOfRooms * 150);
    } else if (service.name === 'Carpet Cleaning') {
        total = 200 * formData.numberOfCarpets;
    } else if (service.name === 'Mattress Cleaning') {
        total = (150 * formData.numberOfSingleMattresses) + (200 * formData.numberOfLargeMattresses);
        if (total === 0) total = 150;
    } else if (service.name === 'Sofa Cleaning') {
        total = 35 * formData.numberOfSofaSeats;
    } else if (service.name === 'Curtain Cleaning') {
        total = 200 * formData.numberOfCurtains;
    }

    if (MATERIAL_SERVICE_NAMES.includes(service.name) && formData.includeChemicals) {
        total += 30;
    }

    return total;
};

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, service }) => {
    const { addBooking } = useBookings();
    const [formData, setFormData] = useState<BookingFormData>({
        customerName: '',
        phoneNumber: '',
        neighborhood: '',
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
    const [activeDetailTab, setActiveDetailTab] = useState<'about' | 'needtoknow' | 'redeem' | 'reviews'>('about');
    const [isWishlisted, setIsWishlisted] = useState(false);

    const today = new Date();
    const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

    useEffect(() => {
        if (isOpen) {
            setShowSuccess(false);
            setFormError('');
            setSaveNotice('');
            setShareNotice('');
            setActiveDetailTab('about');
            setIsWishlisted(readWishlist().includes(service?.id || ''));
            setFormData({
                customerName: '',
                phoneNumber: '',
                neighborhood: '',
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
    }, [isOpen, todayStr, service?.id]);

    if (!service) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const normalizedPhone = formData.phoneNumber.replace(/[\s-]/g, '');
        if (!formData.customerName.trim()) {
            setFormError('Please enter your full name.');
            return;
        }
        if (!/^(05\d{8}|\+9715\d{8})$/.test(normalizedPhone)) {
            setFormError('Please enter a valid UAE mobile number, for example 05XXXXXXXX.');
            return;
        }
        if (!formData.neighborhood || !formData.date || !formData.time) {
            setFormError('Please complete your area, date, and time before booking.');
            return;
        }
        if (formData.date < todayStr) {
            setFormError('Please select today or a future date for your appointment.');
            return;
        }

        setFormError('');
        setIsSubmitting(true);

        const calculatedPrice = calculateBookingTotal(service, formData);

        const bookingData: CreateBookingData = {
            ...formData,
            serviceId: service.id,
            serviceName: service.name,
            totalPrice: calculatedPrice
        };

        try {
            const saveResult = await addBooking(bookingData);
            setSaveNotice(saveResult.synced ? '' : 'Your booking is saved only on this device. Please complete WhatsApp confirmation so our team receives it.');
            setShowSuccess(true);
        } catch {
            setFormError('We could not save your booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWhatsappRedirect = () => {
        const isHourly = HOURLY_SERVICE_NAMES.includes(service.name);
        const isDaily = service.name === 'Babysitting At Home';
        const calculatedPrice = calculateBookingTotal(service, formData);

        const messageLines = [
            `Hello, I would like to confirm my booking:`,
            `Service: ${service.name}`,
            `Name: ${formData.customerName}`,
            `Phone: ${formData.phoneNumber}`,
            `Neighborhood: ${formData.neighborhood || 'N/A'}`,
            `Date & Time: ${formData.date} at ${formData.time}`
        ];

        if (isHourly) {
            messageLines.push(`Hours: ${formData.hours}`);
            messageLines.push(`Workers: ${formData.numberOfWorkers}`);
        } else if (isDaily) {
            messageLines.push(`Workers: ${formData.numberOfWorkers}`);
        } else if (service.name === 'Floor Cleaning') {
            messageLines.push(`Rooms: ${formData.numberOfRooms}`);
        } else if (service.name === 'Carpet Cleaning') {
            messageLines.push(`Carpets: ${formData.numberOfCarpets}`);
        } else if (service.name === 'Mattress Cleaning') {
            messageLines.push(`Single Mattresses: ${formData.numberOfSingleMattresses}`);
            messageLines.push(`Large Mattresses: ${formData.numberOfLargeMattresses}`);
        } else if (service.name === 'Sofa Cleaning') {
            messageLines.push(`Sofa Seats: ${formData.numberOfSofaSeats}`);
        } else if (service.name === 'Curtain Cleaning') {
            messageLines.push(`Curtains: ${formData.numberOfCurtains}`);
        }

        if (MATERIAL_SERVICE_NAMES.includes(service.name)) {
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
        const next = toggleWishlist(service.id);
        setIsWishlisted(next.includes(service.id));
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
                setShareNotice('Service details copied.');
            } else {
                setShareNotice('Sharing is not available on this browser.');
            }
            window.setTimeout(() => setShareNotice(''), 2500);
        } catch {
            // Sharing can be cancelled by the user; no error state is needed.
        }
    };

    const finalTotalPrice = calculateBookingTotal(service, formData);
    const originalPriceDisplay = service.originalPrice || Math.round(service.price * 1.45);
    const discountPercentage = Math.round(((originalPriceDisplay - service.price) / originalPriceDisplay) * 100);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={showSuccess ? "Success" : service.name} isDismissible={false}>
            <AnimatePresence mode="wait">
                {showSuccess ? (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="py-3 space-y-4"
                    >
                        {/* Header */}
                        <div className="flex flex-col items-center gap-2 text-center pb-4 border-b border-gray-100">
                            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <CheckCircle2 size={34} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Booking Received!</h3>
                                <p className="text-xs text-gray-500 font-semibold mt-0.5">One last step to confirm your appointment →</p>
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
                                    <span className="text-sm font-black text-emerald-900 block">Done ✓</span>
                                    <span className="text-[11px] text-emerald-800 font-semibold leading-snug block mt-0.5">Your booking details<br/>have been saved</span>
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
                                    <span className="text-sm font-black text-amber-900 block">Action Required</span>
                                    <span className="text-[11px] text-amber-800 font-semibold leading-snug block mt-0.5">Tap below to open WhatsApp<br/>& finalize your booking</span>
                                </div>
                            </div>
                        </div>

                        {/* Big CTA */}
                        <Button
                            onClick={handleWhatsappRedirect}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-600/25 py-4 text-sm rounded-2xl flex items-center justify-center gap-2.5"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-none" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Open WhatsApp to Confirm Booking
                        </Button>
                        <p className="text-center text-[10px] text-gray-500 font-semibold">
                            Your booking is not final until confirmed via WhatsApp.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-12 md:gap-6">

                        {/* LEFT COLUMN: Groupon Detail View (Title, Subtitle, Image Gallery, Tabs, Descriptions) */}
                        <div className="space-y-3 md:col-span-7 md:space-y-4">
                            {/* Service Header Info */}
                            <div className="space-y-2">
                                <h2 className="text-lg font-black leading-tight tracking-tight text-gray-900 sm:text-2xl">
                                    {service.name} <span className="text-emerald-700 font-extrabold text-lg sm:text-xl">(Up to {discountPercentage}% Off)</span>
                                </h2>

                                {/* Merchant & Location Bar */}
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-800 font-bold">
                                    <span className="text-gray-900 font-extrabold">Purity Home Services</span>
                                    <span>•</span>
                                    <span className="text-gray-800">Dubai, UAE</span>
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
                                    <span>Popular Verified Service</span>
                                </div>
                            </div>

                            {/* Service Hero Image & Action Overlay (16:9 Aspect Ratio Maintained) */}
                            <div className="relative aspect-[16/9] max-h-44 w-full rounded-xl overflow-hidden shadow-xs group">
                                <SafeImage src={service.image} alt={service.name} loading="eager" className="w-full h-full object-cover object-center" />
                                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                                    <button
                                        type="button"
                                        onClick={handleWishlist}
                                        aria-label={isWishlisted ? 'Remove service from wishlist' : 'Add service to wishlist'}
                                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                        className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-rose-600 shadow-sm transition-all"
                                    >
                                        <Heart size={14} fill={isWishlisted ? '#e11d48' : 'none'} className={isWishlisted ? 'text-rose-600' : ''} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        aria-label="Share service"
                                        title="Share service"
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
                                    About
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveDetailTab('needtoknow')}
                                    className={`pb-2 transition-colors border-b-2 ${activeDetailTab === 'needtoknow' ? 'border-primary-600 text-gray-900 font-black' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
                                >
                                    Need To Know Info
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveDetailTab('redeem')}
                                    className={`pb-2 transition-colors border-b-2 ${activeDetailTab === 'redeem' ? 'border-primary-600 text-gray-900 font-black' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
                                >
                                    Where To Redeem
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveDetailTab('reviews')}
                                    className={`pb-2 transition-colors border-b-2 ${activeDetailTab === 'reviews' ? 'border-primary-600 text-gray-900 font-black' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
                                >
                                    Reviews
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
                                            <h4 className="font-extrabold text-gray-900 text-xs">What We Offer:</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {[
                                                    "Professional Vetted Staff",
                                                    "Hotel Standard Cleaning",
                                                    "Eco-Friendly Materials",
                                                    "Flexible Time Slots"
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
                                        <p className="font-bold text-gray-900">• Please ensure access to electricity and clean water on site.</p>
                                        <p className="font-bold text-gray-900">• Free cancellation up to 2 hours prior to scheduled appointment time.</p>
                                        <p className="font-bold text-gray-900">• All cleaners undergo daily health and safety screening.</p>
                                    </div>
                                )}

                                {activeDetailTab === 'redeem' && (
                                    <div className="space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-gray-800">
                                        <span className="font-extrabold text-gray-900 block">Available Across All Dubai Neighborhoods:</span>
                                        <p className="text-gray-700">Downtown Dubai, Dubai Marina, JBR, Palm Jumeirah, Business Bay, JLT, Arabian Ranches, Mirdif, and more.</p>
                                    </div>
                                )}

                                {activeDetailTab === 'reviews' && (
                                    <div className="space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-amber-500">
                                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                            </div>
                                            <span className="font-black text-gray-900">4.9 out of 5</span>
                                            <span className="text-gray-700 font-bold">(Based on 120+ verified bookings)</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Groupon Booking & Pricing Side Panel (~42% width) */}
                        <div className="space-y-3 md:col-span-5 md:space-y-4">
                            {/* Groupon Option Card Container */}
                            <div className="relative space-y-2 rounded-xl border-2 border-primary-600/90 bg-white p-2.5 shadow-sm md:space-y-3 md:rounded-2xl md:p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-xs font-black text-gray-900 block leading-tight">{service.name}</span>
                                        <span className="text-[10px] font-bold text-gray-700 block mt-0.5">Instant Online Booking</span>
                                    </div>
                                    {/* Pricing Stack */}
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <span className="text-xs text-gray-500 font-bold line-through">AED{originalPriceDisplay}</span>
                                            <span className="text-base font-black text-emerald-700">AED{service.price}</span>
                                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded">-{discountPercentage}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-[10px] font-bold text-gray-700 border-t border-gray-100 pt-2 flex items-center justify-between">
                                    <span>120+ bought</span>
                                    <span className="text-emerald-700 font-extrabold">Instant Confirmation</span>
                                </div>
                            </div>

                            {/* Booking Form Inputs (100% UNTOUCHED INPUT COMPONENTS!) */}
                            <form onSubmit={handleSubmit} className="space-y-2 rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm md:space-y-3 md:rounded-2xl md:p-4">
                                <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
                                    <h4 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-gray-900 md:text-xs">
                                        <Calendar size={13} className="text-primary-600 md:h-3.5 md:w-3.5" /> Enter Booking Details
                                    </h4>
                                    <span className="text-[10px] font-bold text-gray-500">Step 1 of 1</span>
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
                                            label="Full Name"
                                            placeholder="John Doe"
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            required
                                        />
                                        <Input
                                            label="Phone Number"
                                            placeholder="05XXXXXXXX"
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {/* Row 2: Location */}
                                    <Select
                                        label="Neighborhood"
                                        value={formData.neighborhood}
                                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                        options={[
                                            { value: '', label: 'Select Area' },
                                            ...SAUDI_NEIGHBORHOODS.map(n => ({ value: n, label: n }))
                                        ]}
                                        required
                                    />

                                    {/* Row 3: Date & Time */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            label="Date"
                                            type="date"
                                            min={todayStr}
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                        <Select
                                            label="Time"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            options={[
                                                { value: '', label: 'Select Slot' },
                                                ...TIME_SLOTS.map(t => ({ value: t, label: t }))
                                            ]}
                                            required
                                        />
                                    </div>

                                    {/* Options: Duration & Staff count */}
                                    {(['Housekeeping / Part-time Maid', 'Babysitting At Home', 'Deep Cleaning', 'Regular Cleaning', 'Move In/Out Cleaning', 'Party Cleaning', 'Wash and Iron', 'Pet Sitting'].includes(service.name)) && (
                                        <div className="space-y-2 pt-1 border-t border-gray-100">
                                            {service.name !== 'Babysitting At Home' && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-xs font-bold text-gray-900">
                                                        <span>Duration</span>
                                                        <span className="text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-full text-[11px]">{formData.hours} Hours</span>
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
                                                <span className="text-xs font-bold text-gray-900 block">Staff Count</span>
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
                                    {['Deep Cleaning', 'Regular Cleaning', 'Move In/Out Cleaning', 'Party Cleaning', 'Wash and Iron', 'Pet Sitting'].includes(service.name) && (
                                        <div className="flex gap-2 pt-1">
                                            {[{ val: false, lbl: 'I have materials' }, { val: true, lbl: 'Include materials (+30 AED)' }].map((opt) => (
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
                                        label="Notes (optional)"
                                        placeholder="Add access instructions or special requests..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                    />

                                    <div className="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100 px-3 py-2.5">
                                        <span className="text-xs font-bold text-gray-700">Estimated total</span>
                                        <strong className="text-base font-black text-primary-700">{finalTotalPrice.toFixed(2)} AED</strong>
                                    </div>

                                    {/* Urgency Counter & Submit Button */}
                                    <div className="pt-2 space-y-2 border-t border-gray-100">
                                        <div className="flex items-center justify-center gap-1.5 bg-amber-50/80 text-amber-900 border border-amber-200/80 py-1.5 px-3 rounded-xl text-[11px] font-black text-center shadow-2xs">
                                            <Eye size={13} className="text-amber-600 flex-none" />
                                            <span>Over 150 viewed today, so act now!</span>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 md:py-3.5"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Confirm & Book Now"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>

                    </div>
                )}
            </AnimatePresence>
        </Modal>
    );
};
