// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Check, X } from 'lucide-react';

interface SmartCardProps {
    image: string;
    title: string;
    description: string;
    suitableFor: string[];
    notSuitableFor?: string[];
    ctaText: string;
    onAction: () => void;
    index: number;
}

export const SmartCard: React.FC<SmartCardProps> = ({
    image,
    title,
    description,
    suitableFor,
    notSuitableFor,
    ctaText,
    onAction,
    index
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] md:hover:shadow-xl transition-all duration-300 flex flex-col h-full"
        >
            <div className="h-48 md:h-56 overflow-hidden relative">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h3 className="text-white text-xl font-bold">{title}</h3>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    {description}
                </p>

                <div className="space-y-4 mb-8 flex-grow">
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-teal-600 flex items-center gap-1">
                            <Check className="w-3 h-3" /> هذا الخيار مناسب إذا:
                        </p>
                        <ul className="space-y-1">
                            {suitableFor.map((item, idx) => (
                                <li key={idx} className="text-xs text-gray-500 flex items-start gap-2">
                                    <span className="w-1 h-1 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {notSuitableFor && notSuitableFor.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                <X className="w-3 h-3" /> قد لا يناسبك حالياً إذا:
                            </p>
                            <ul className="space-y-1">
                                {notSuitableFor.map((item, idx) => (
                                    <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                                        <span className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <Button
                    onClick={onAction}
                    variant="primary"
                    className="w-full justify-center group"
                >
                    {ctaText}
                </Button>
            </div>
        </motion.div>
    );
};
