// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Loader2, CheckCircle2, User, Phone, FileText, Tag, Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, TextArea } from '../ui/Input';
import { useBookings, BookingFormData, CreateBookingData } from '../../context/BookingContext';
import { Service, SAUDI_NEIGHBORHOODS, TIME_SLOTS } from '../../types';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service | null;
}

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
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'book'>('book');
    const [showNotes, setShowNotes] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowSuccess(false);
            setActiveTab('book');
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
                date: '',
                time: '',
                notes: '',
            });
        }
    }, [isOpen]);

    if (!service) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const isHourly = ['Housekeeping / Part-time Maid', 'Deep Cleaning', 'Regular Cleaning', 'Move In/Out Cleaning', 'Party Cleaning', 'Wash and Iron', 'Pet Sitting'].includes(service.name);
        const isDaily = service.name === 'Babysitting At Home';

        let calculatedPrice = 0;

        if (isHourly) {
            calculatedPrice = service.price * formData.hours * formData.numberOfWorkers;
        } else if (isDaily) {
            calculatedPrice = service.price * formData.numberOfWorkers;
        } else if (service.name === 'Floor Cleaning') {
            calculatedPrice = formData.numberOfRooms === 1 ? 200 : (formData.numberOfRooms === 2 ? 300 : formData.numberOfRooms * 150);
        } else if (service.name === 'Carpet Cleaning') {
            calculatedPrice = 200 * formData.numberOfCarpets;
        } else if (service.name === 'Mattress Cleaning') {
            calculatedPrice = (150 * formData.numberOfSingleMattresses) + (200 * formData.numberOfLargeMattresses);
            if (calculatedPrice === 0) calculatedPrice = 150; // Fallback
        } else if (service.name === 'Sofa Cleaning') {
            calculatedPrice = 35 * formData.numberOfSofaSeats;
        } else if (service.name === 'Curtain Cleaning') {
            calculatedPrice = 200 * formData.numberOfCurtains;
        } else {
            calculatedPrice = service.price;
        }

        // Add 30 AED for materials if selected (For Cleaning, Laundry, and Care services)
        if (['Deep Cleaning', 'Regular Cleaning', 'Move In/Out Cleaning', 'Party Cleaning', 'Wash and Iron', 'Pet Sitting'].includes(service.name) && formData.includeChemicals) {
            calculatedPrice += 30;
        }

        const bookingData: CreateBookingData = {
            ...formData,
            serviceId: service.id,
            serviceName: service.name,
            totalPrice: calculatedPrice
        };

        await new Promise(resolve => setTimeout(resolve, 1500));

        addBooking(bookingData);
        setIsSubmitting(false);
        setShowSuccess(true);
    };

    const handleWhatsappRedirect = () => {
        const message = `Hello, I would like to confirm my booking:%0A` +
            `Service: ${service.name}%0A` +
            `Name: ${formData.customerName}%0A` +
            `Workers: ${formData.numberOfWorkers}%0A` +
            `Hours: ${formData.hours}%0A` +
            `Materials: ${formData.includeChemicals ? 'Yes' : 'No'}%0A` +
            `Date: ${formData.date} at ${formData.time}`;
        window.open(`https://wa.me/966500000000?text=${message}`, '_blank');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={showSuccess ? "Success" : service.name} isDismissible={false}>
            <AnimatePresence mode="wait">
                {showSuccess ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-10 text-center space-y-6"
                    >
                        <div className="relative">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1.2 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 shadow-inner"
                            >
                                <CheckCircle2 size={40} />
                            </motion.div>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-1 -right-1 text-accent-500"
                            >
                                <Sparkles size={20} />
                            </motion.div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h3>
                            <p className="text-gray-500 px-6 leading-relaxed max-w-xs mx-auto text-sm">
                                Your request is being processed. Please confirm on WhatsApp to finalize your appointment with our team.
                            </p>
                        </div>
                        <Button
                            onClick={handleWhatsappRedirect}
                            className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white shadow-xl shadow-primary-500/20 py-4"
                            size="lg"
                        >
                            Confirm on WhatsApp
                        </Button>
                    </motion.div>
                ) : (
                    <div className="flex flex-col h-full md:max-h-[80vh]">
                        {/* Apple-Style Segmented Control */}
                        <div className="flex-none flex p-1 bg-gray-100 rounded-xl mb-6 relative">
                            <motion.div
                                className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm z-0"
                                layoutId="activeTab"
                                animate={{
                                    left: activeTab === 'book' ? '4px' : '50%',
                                    right: activeTab === 'book' ? '50%' : '4px'
                                }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                            <button
                                onClick={() => setActiveTab('book')}
                                className={`relative z-10 flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'book' ? 'text-gray-900' : 'text-gray-400'}`}
                            >
                                Book Service
                            </button>
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`relative z-10 flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'details' ? 'text-gray-900' : 'text-gray-400'}`}
                            >
                                Service Details
                            </button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto no-scrollbar -mx-6 px-6 pb-20">
                            <AnimatePresence mode="wait">
                                {activeTab === 'details' ? (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="aspect-video w-full rounded-xl overflow-hidden shadow-sm relative group">
                                            <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                                                <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{service.category}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-xl font-bold text-gray-900 leading-tight">{service.name}</h3>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-primary-500">
                                                        {service.price}
                                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-1">
                                                            AED {['Housekeeping / Part-time Maid', 'Deep Cleaning', 'Regular Cleaning', 'Move In/Out Cleaning', 'Party Cleaning', 'Wash and Iron', 'Pet Sitting'].includes(service.name) ? '/ HR' : (service.name === 'Babysitting At Home' ? '/ DAY' : '')}
                                                        </span>
                                                    </div>
                                                    {service.originalPrice && (
                                                        <div className="text-sm text-gray-400 line-through opacity-60">{service.originalPrice} AED</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <FileText size={12} className="text-primary-500" /> Description
                                                </h4>
                                                <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">
                                                    {service.description}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { icon: <CheckCircle2 size={14} />, label: "Expert Team" },
                                                    { icon: <Clock size={14} />, label: "Flexible Time" }
                                                ].map((item, idx) => (
                                                    <div key={idx} className="bg-white border border-gray-100 p-3 rounded-xl flex items-center gap-3 shadow-sm">
                                                        <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
                                                            {item.icon}
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-700">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Button onClick={() => setActiveTab('book')} className="w-full py-4 text-sm font-bold mt-4 shadow-lg shadow-primary-500/10 rounded-xl">
                                            Book this service
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="book"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-4"
                                    >
                                        {/* Group 1: Contact & Location */}
                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                            <div className="space-y-3">
                                                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <User size={12} /> Contact Info
                                                </h5>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Input
                                                        className="bg-gray-50/50 border-none rounded-xl"
                                                        label="Full Name"
                                                        placeholder="John Doe"
                                                        value={formData.customerName}
                                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                                        required
                                                    />
                                                    <Input
                                                        className="bg-gray-50/50 border-none rounded-xl"
                                                        label="Phone Number"
                                                        placeholder="05XXXXXXXX"
                                                        type="tel"
                                                        value={formData.phoneNumber}
                                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <MapPin size={12} /> Neighborhood
                                                </h5>
                                                <Select
                                                    className="bg-gray-50/50 border-none rounded-xl"
                                                    value={formData.neighborhood}
                                                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                                    options={[
                                                        { value: '', label: 'Select Area' },
                                                        ...SAUDI_NEIGHBORHOODS.map(n => ({ value: n, label: n }))
                                                    ]}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Group 2: Schedule */}
                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar size={12} /> Appointment
                                            </h5>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Input
                                                    className="bg-gray-50/50 border-none rounded-xl"
                                                    label="Date"
                                                    type="date"
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                    required
                                                />
                                                <Select
                                                    className="bg-gray-50/50 border-none rounded-xl"
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
                                        </div>

                                        {/* Group 3: Service Customization */}
                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-5">
                                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Tag size={12} /> Preferences
                                            </h5>

                                            {(['Housekeeping / Part-time Maid', 'Babysitting At Home', 'Deep Cleaning', 'Regular Cleaning', 'Move In/Out Cleaning', 'Party Cleaning', 'Wash and Iron', 'Pet Sitting'].includes(service.name)) && (
                                                <div className="space-y-4">
                                                    {/* Hours Selector */}
                                                    {service.name !== 'Babysitting At Home' && (
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-bold text-gray-700">Duration (Hours)</span>
                                                                <span className="text-[10px] font-bold text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">{formData.hours}h selected</span>
                                                            </div>
                                                            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                                                {[3, 4, 5, 6, 7, 8].map(num => (
                                                                    <button
                                                                        key={num}
                                                                        type="button"
                                                                        onClick={() => setFormData({ ...formData, hours: num })}
                                                                        className={`w-9 h-9 rounded-full flex-none flex items-center justify-center text-xs font-bold border transition-all
                                                                            ${formData.hours === num
                                                                                ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                                                                                : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                                                                            }`}
                                                                    >
                                                                        {num}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Workers Selector */}
                                                    <div className="space-y-2">
                                                        <span className="text-xs font-bold text-gray-700">Professionals Count</span>
                                                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                                            {[1, 2, 3, 4].map(num => (
                                                                <button
                                                                    key={num}
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, numberOfWorkers: num })}
                                                                    className={`w-9 h-9 rounded-full flex-none flex items-center justify-center text-xs font-bold border transition-all
                                                                        ${formData.numberOfWorkers === num
                                                                            ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                                                                            : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {num}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Floor Cleaning: Rooms */}
                                            {service.name === 'Floor Cleaning' && (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <span className="text-xs font-bold text-gray-700">Number of Rooms</span>
                                                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                                            {[1, 2, 3, 4, 5].map(num => (
                                                                <button
                                                                    key={num}
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, numberOfRooms: num })}
                                                                    className={`w-12 h-9 rounded-xl flex-none flex items-center justify-center text-xs font-bold border transition-all
                                                                        ${formData.numberOfRooms === num
                                                                            ? 'bg-primary-500 border-primary-500 text-white'
                                                                            : 'bg-white border-gray-100 text-gray-500'
                                                                        }`}
                                                                >
                                                                    {num} {num === 1 ? 'Room' : 'Rooms'}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Carpet Cleaning: Carpets */}
                                            {service.name === 'Carpet Cleaning' && (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <span className="text-xs font-bold text-gray-700">Number of Carpets (2x2 standard)</span>
                                                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                                            {[1, 2, 3, 4, 5].map(num => (
                                                                <button
                                                                    key={num}
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, numberOfCarpets: num })}
                                                                    className={`w-12 h-9 rounded-xl flex-none flex items-center justify-center text-xs font-bold border transition-all
                                                                        ${formData.numberOfCarpets === num
                                                                            ? 'bg-primary-500 border-primary-500 text-white'
                                                                            : 'bg-white border-gray-100 text-gray-500'
                                                                        }`}
                                                                >
                                                                    {num}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Mattress Cleaning: Single & Large */}
                                            {service.name === 'Mattress Cleaning' && (
                                                <div className="space-y-4">
                                                    <div className="space-y-3">
                                                        <span className="text-xs font-bold text-gray-700">Single Mattresses (150 AED)</span>
                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, numberOfSingleMattresses: Math.max(0, formData.numberOfSingleMattresses - 1) })}
                                                                className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50"
                                                            >-</button>
                                                            <span className="text-sm font-bold w-4 text-center">{formData.numberOfSingleMattresses}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, numberOfSingleMattresses: formData.numberOfSingleMattresses + 1 })}
                                                                className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50"
                                                            >+</button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <span className="text-xs font-bold text-gray-700">Large Mattresses (200 AED)</span>
                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, numberOfLargeMattresses: Math.max(0, formData.numberOfLargeMattresses - 1) })}
                                                                className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50"
                                                            >-</button>
                                                            <span className="text-sm font-bold w-4 text-center">{formData.numberOfLargeMattresses}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, numberOfLargeMattresses: formData.numberOfLargeMattresses + 1 })}
                                                                className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50"
                                                            >+</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Sofa Cleaning: Seats */}
                                            {service.name === 'Sofa Cleaning' && (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <span className="text-xs font-bold text-gray-700">Number of Seats (35 AED/seat)</span>
                                                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                                                <button
                                                                    key={num}
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, numberOfSofaSeats: num })}
                                                                    className={`w-9 h-9 rounded-full flex-none flex items-center justify-center text-xs font-bold border transition-all
                                                                        ${formData.numberOfSofaSeats === num
                                                                            ? 'bg-primary-500 border-primary-500 text-white'
                                                                            : 'bg-white border-gray-100 text-gray-500'
                                                                        }`}
                                                                >
                                                                    {num}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Curtain Cleaning: Curtains */}
                                            {service.name === 'Curtain Cleaning' && (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <span className="text-xs font-bold text-gray-700">Large Curtains (200 AED each)</span>
                                                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                                            {[1, 2, 3, 4, 5].map(num => (
                                                                <button
                                                                    key={num}
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, numberOfCurtains: num })}
                                                                    className={`w-9 h-9 rounded-full flex-none flex items-center justify-center text-xs font-bold border transition-all
                                                                        ${formData.numberOfCurtains === num
                                                                            ? 'bg-primary-500 border-primary-500 text-white'
                                                                            : 'bg-white border-gray-100 text-gray-500'
                                                                        }`}
                                                                >
                                                                    {num}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Materials Toggle */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-700">Cleaning materials?</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {[{ val: false, lbl: 'I have them' }, { val: true, lbl: 'Include materials' }].map((opt) => (
                                                        <button
                                                            key={String(opt.val)}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, includeChemicals: opt.val })}
                                                            className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all
                                                                ${formData.includeChemicals === opt.val
                                                                    ? 'bg-primary-50 border-primary-500 text-primary-600 shadow-sm'
                                                                    : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {opt.lbl}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Notes Toggle */}
                                            <div className="pt-2 border-t border-gray-100">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNotes(!showNotes)}
                                                    className="w-full flex items-center justify-between py-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                                                >
                                                    <span className="flex items-center gap-2"><FileText size={12} /> Notes (Optional)</span>
                                                    {showNotes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                                <AnimatePresence>
                                                    {showNotes && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="pt-3">
                                                                <TextArea
                                                                    className="bg-gray-50/50 border-none rounded-xl"
                                                                    placeholder="Entry gate info, pet alerts, etc..."
                                                                    value={formData.notes}
                                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                                />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        {/* Bill-Style Summary Card - Enhanced for Clarity */}
                                        <div className="bg-primary-950 rounded-[2rem] p-7 text-white shadow-2xl shadow-primary-950/30 relative overflow-hidden border border-white/5">
                                            {/* Decorative Background Elements */}
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-500/10 rounded-full -ml-16 -mb-16 blur-2xl" />

                                            <div className="relative z-10 space-y-6">
                                                <div className="flex items-center gap-4 border-b border-white/10 pb-5">
                                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5">
                                                        <Tag size={22} className="text-primary-400" />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-black text-white/50 uppercase tracking-[0.2em] block mb-1">Service Receipt</span>
                                                        <span className="text-lg font-black tracking-tight">{service.name}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {(() => {
                                                        const isHourly = ['Housekeeping / Part-time Maid', 'Deep Cleaning', 'Regular Cleaning', 'Move In/Out Cleaning', 'Party Cleaning', 'Wash and Iron', 'Pet Sitting'].includes(service.name);
                                                        const isDaily = service.name === 'Babysitting At Home';

                                                        let basePrice = 0;
                                                        let breakdown = "";

                                                        if (isHourly) {
                                                            basePrice = service.price * formData.hours * formData.numberOfWorkers;
                                                            breakdown = `${service.price} AED × ${formData.numberOfWorkers} Prof. × ${formData.hours}h`;
                                                        } else if (isDaily) {
                                                            basePrice = service.price * formData.numberOfWorkers;
                                                            breakdown = `Daily Rate: ${service.price} AED × ${formData.numberOfWorkers} Sitter(s)`;
                                                        } else if (service.name === 'Floor Cleaning') {
                                                            basePrice = formData.numberOfRooms === 1 ? 200 : (formData.numberOfRooms === 2 ? 300 : formData.numberOfRooms * 150);
                                                            breakdown = `Service for ${formData.numberOfRooms} Room(s)`;
                                                        } else if (service.name === 'Carpet Cleaning') {
                                                            basePrice = 200 * formData.numberOfCarpets;
                                                            breakdown = `Cleaning for ${formData.numberOfCarpets} Carpet(s)`;
                                                        } else if (service.name === 'Mattress Cleaning') {
                                                            basePrice = (150 * formData.numberOfSingleMattresses) + (200 * formData.numberOfLargeMattresses);
                                                            if (basePrice === 0) basePrice = 150;
                                                            breakdown = `${formData.numberOfSingleMattresses} Single, ${formData.numberOfLargeMattresses} Large`;
                                                        } else if (service.name === 'Sofa Cleaning') {
                                                            basePrice = 35 * formData.numberOfSofaSeats;
                                                            breakdown = `Sanitizing ${formData.numberOfSofaSeats} Seat(s)`;
                                                        } else if (service.name === 'Curtain Cleaning') {
                                                            basePrice = 200 * formData.numberOfCurtains;
                                                            breakdown = `${formData.numberOfCurtains} Large Curtain(s)`;
                                                        } else {
                                                            basePrice = service.price;
                                                            breakdown = "Standard Service Rate";
                                                        }

                                                        const total = (['Deep Cleaning', 'Regular Cleaning', 'Move In/Out Cleaning', 'Party Cleaning', 'Wash and Iron', 'Pet Sitting'].includes(service.name) && formData.includeChemicals)
                                                            ? basePrice + 30
                                                            : basePrice;

                                                        return (
                                                            <>
                                                                {/* Row: Base Service */}
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-base font-bold text-white/90">
                                                                            {service.name}
                                                                        </span>
                                                                        <span className="text-xs text-white/40 font-bold uppercase tracking-wider">
                                                                            {breakdown}
                                                                        </span>
                                                                        {/* Package Description for Hot Deals */}
                                                                        {['Package', 'Villa Package', 'Value Pack', 'Sanitization'].includes(service.category) || service.id.startsWith('offer-') ? (
                                                                            <p className="mt-1 text-[10px] text-white/30 italic max-w-[200px] leading-relaxed">
                                                                                {service.description}
                                                                            </p>
                                                                        ) : null}
                                                                        {/* Deal Summary Features */}
                                                                        {service.features && service.features.length > 0 && (
                                                                            <ul className="mt-3 space-y-1.5">
                                                                                {service.features.map((feature, idx) => (
                                                                                    <li key={idx} className="flex items-center gap-2">
                                                                                        <CheckCircle2 size={8} className="text-primary-400" />
                                                                                        <span className="text-[10px] font-bold text-white/50 tracking-wide uppercase">{feature}</span>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-base font-black text-white">{basePrice} AED</span>
                                                                </div>

                                                                {/* Row: Materials (Conditional) */}
                                                                {formData.includeChemicals && ['Deep Cleaning', 'Regular Cleaning', 'Move In/Out Cleaning', 'Party Cleaning', 'Wash and Iron', 'Pet Sitting'].includes(service.name) && (
                                                                    <div className="flex justify-between items-center py-1">
                                                                        <span className="text-sm font-bold text-white/80">Premium Materials</span>
                                                                        <span className="text-sm font-black text-primary-400">+ 30 AED</span>
                                                                    </div>
                                                                )}

                                                                {/* Divider and Final Total */}
                                                                <div className="border-t border-white/10 pt-6 mt-4 flex justify-between items-end">
                                                                    <div className="space-y-1">
                                                                        <span className="text-xs font-black text-white/40 block tracking-[0.2em] uppercase">Amount Due</span>
                                                                        <span className="text-[11px] text-white/20 font-bold tracking-tight block uppercase">Inclusive of all local taxes</span>
                                                                    </div>
                                                                    <div className="flex items-baseline gap-2">
                                                                        <span className="text-4xl font-black tracking-tighter text-while animate-in fade-in zoom-in duration-500">
                                                                            {total.toFixed(0)}
                                                                        </span>
                                                                        <span className="text-sm font-black text-primary-500 uppercase">AED</span>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <Button
                                                type="submit"
                                                className="w-full py-4 text-sm font-bold shadow-xl shadow-primary-500/20 hover:shadow-2xl hover:shadow-primary-500/30 transition-all rounded-xl"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm and Book"}
                                            </Button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </AnimatePresence >
        </Modal >
    );
};

