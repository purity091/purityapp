// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartCard } from './SmartCard';
import { intentsData, IntentType, IntentContent } from '../../data/intents';
import { Button } from '../ui/Button';
import { BookOpen, Sparkles, Tag, Users, ArrowDown, Search } from 'lucide-react';

interface DynamicContentSectionProps {
    onBookService: (serviceId: string | undefined) => void;
}

export const DynamicContentSection: React.FC<DynamicContentSectionProps> = ({ onBookService }) => {
    const [selectedIntent, setSelectedIntent] = useState<IntentType | null>(null);

    const activeContent = intentsData.find(i => i.type === selectedIntent);

    const handleIntentClick = (type: IntentType) => {
        setSelectedIntent(type);
        // Smooth scroll specifically to the content area if needed, or just let the transition handle it
        setTimeout(() => {
            document.getElementById('dynamic-content-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleBack = () => {
        setSelectedIntent(null);
        document.getElementById('intent-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <section id="intent-selector" className="py-16 md:py-24 bg-gray-50 min-h-[600px] transition-colors duration-500">
            <div className="container mx-auto px-4">

                {/* Intent Selector Area */}
                <AnimatePresence mode="wait">
                    {!selectedIntent ? (
                        <motion.div
                            key="selector"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <motion.h2
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
                            >
                                ما هو هدفك اليوم؟
                                <br />
                                <span className="text-teal-600 text-2xl md:text-4xl font-normal mt-2 block">اختر نيتك، ونحن نرشدك</span>
                            </motion.h2>

                            <p className="text-gray-500 mb-12 max-w-xl mx-auto">
                                لا مزيد من الحيرة. حدد ما تبحث عنه وسنقدم لك الخيارات الأنسب لك ولمنزلك.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <IntentButton
                                    icon={<BookOpen className="w-6 h-6" />}
                                    title="أريد أن أتعلم"
                                    subtitle="نصائح وأدلة منزلية"
                                    onClick={() => handleIntentClick('learn')}
                                    delay={0.1}
                                />
                                <IntentButton
                                    icon={<Sparkles className="w-6 h-6" />}
                                    title="أبحث عن تجربة"
                                    subtitle="خدمات تنظيف مميزة"
                                    onClick={() => handleIntentClick('experience')}
                                    delay={0.2}
                                />
                                <IntentButton
                                    icon={<Tag className="w-6 h-6" />}
                                    title="أريد خصمًا ذكيًا"
                                    subtitle="باقات وعروض توفير"
                                    onClick={() => handleIntentClick('discount')}
                                    delay={0.3}
                                />
                                <IntentButton
                                    icon={<Users className="w-6 h-6" />}
                                    title="الانضمام للمجتمع"
                                    subtitle="نشرة، عضويات، ولاء"
                                    onClick={() => handleIntentClick('community')}
                                    delay={0.4}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        /* Dynamic Content Area */
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            id="dynamic-content-area"
                        >
                            {/* Header of Section */}
                            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                                <div className="text-center md:text-right">
                                    <Button variant="ghost" size="sm" onClick={handleBack} className="mb-2 text-gray-400 hover:text-gray-600">
                                        ← العودة للاختيارات
                                    </Button>
                                    <h2 className="text-3xl font-bold text-gray-900">{activeContent?.title}</h2>
                                </div>
                            </div>

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                                {activeContent?.items.map((item, index) => (
                                    <SmartCard
                                        key={item.id}
                                        index={index}
                                        image={item.image}
                                        title={item.title}
                                        description={item.description}
                                        suitableFor={item.suitableFor}
                                        notSuitableFor={item.notSuitableFor}
                                        ctaText={item.ctaText}
                                        onAction={() => {
                                            if (item.actionType === 'book' || item.actionType === 'subscribe') {
                                                onBookService(item.serviceId);
                                            } else {
                                                alert('سيتم توجيهك للمقال (قريباً)');
                                            }
                                        }}
                                    />
                                ))}

                                {/* Placeholder for visual balance if only 2 items */}
                                {activeContent?.items.length === 2 && (
                                    <div className="hidden lg:flex flex-col items-center justify-center p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                                        <Search className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="font-medium">هل تبحث عن شيء آخر؟</p>
                                        <Button variant="ghost" className="mt-4" onClick={() => handleIntentClick('experience')}>
                                            تصفح جميع الخدمات
                                        </Button>
                                    </div>
                                )}
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

interface IntentButtonProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onClick: () => void;
    delay: number;
}

const IntentButton: React.FC<IntentButtonProps> = ({ icon, title, subtitle, onClick, delay }) => {
    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.3 }}
            onClick={onClick}
            className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group w-full text-center h-full"
        >
            <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                {icon}
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </motion.button>
    );
};
