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
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape' && isDismissible) onClose();
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.body.style.overflow = 'unset';
            };
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    // onClose and isDismissible are event-handler inputs; the modal lifecycle is keyed by isOpen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm ${!isDismissible ? 'cursor-default' : 'cursor-pointer'}`}
                    />
                    <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none p-0 md:items-center md:p-4">
                        <motion.div
                            variants={isMobile ? mobileVariants : desktopVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-title"
                            className="relative flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-3xl border border-gray-200 bg-white shadow-2xl pointer-events-auto md:max-h-[88vh] md:max-w-5xl md:rounded-2xl"
                        >
                            {/* Mobile Drag Handle */}
                            <div className="md:hidden w-full flex justify-center pt-2.5 pb-1 flex-none bg-white">
                                <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
                            </div>

                            <div className="flex items-center justify-between px-3 py-2.5 sm:px-5 md:py-3 border-b border-gray-100 bg-white flex-none">
                                <h3 id="modal-title" className="text-base font-extrabold text-gray-900 tracking-tight truncate pr-2">{title}</h3>
                                <button
                                    onClick={onClose}
                                    aria-label="Close dialog"
                                    className="rounded-full p-1.5 text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-colors flex-none"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-3 overflow-y-auto flex-1 min-h-0 md:p-4">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

