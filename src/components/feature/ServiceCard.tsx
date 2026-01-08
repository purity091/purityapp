// @ts-nocheck
import React from 'react';
import { Service } from '../../types';
import { Button } from '../ui/Button';
import { Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceCardProps {
    service: Service;
    onBook: (service: Service) => void;
    index: number;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBook, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-gray-900">{service.rating}</span>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">{service.category}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {service.name}
                </h3>
                <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed">
                    {service.description}
                </p>

                <div className="flex items-center justify-between mt-auto border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{service.pricePerHour} AED / Hour</span>
                    </div>
                    <Button size="sm" onClick={() => onBook(service)}>
                        Book Now
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};
