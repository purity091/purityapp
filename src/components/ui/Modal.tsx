// @ts-nocheck
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    isDismissible?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, isDismissible = true }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const isMobile = window.innerWidth < 768;

    const desktopVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 }
    };

    const mobileVariants = {
        hidden: { opacity: 0, y: "100%" },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => isDismissible && onClose()}
                        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm ${!isDismissible ? 'cursor-default' : 'cursor-pointer'}`}
                    />
                    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none">
                        <motion.div
                            variants={isMobile ? mobileVariants : desktopVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full md:max-w-lg md:rounded-2xl rounded-t-[2rem] bg-white shadow-2xl pointer-events-auto h-[90vh] md:h-auto md:max-h-[85vh] overflow-hidden flex flex-col"
                        >
                            {/* Mobile Drag Indicator */}
                            <div className="md:hidden w-full flex justify-center pt-3 pb-1">
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                            </div>

                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 pb-safe-bottom">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

