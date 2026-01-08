import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import logo from '../../assets/logo.png';

interface LayoutProps {
    children: React.ReactNode;
    hideFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div dir="ltr" className="min-h-screen flex flex-col bg-gray-50 pb-20 md:pb-0">
            <div className="hidden md:block">
                <Navbar />
            </div>

            {/* Simplified Mobile Top Bar - Hidden as requested */}
            <div className="hidden sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 h-16 flex items-center justify-between px-6 shadow-sm">
                <Link to="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                    <img src={logo} alt="Purity" className="h-8 w-auto object-contain" />
                </Link>

                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-10 h-10 flex items-center justify-center text-gray-900 active:scale-95 transition-transform"
                >
                    {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {/* Mobile Overlay Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden fixed inset-0 top-16 z-40 bg-white overflow-y-auto"
                    >
                        <div className="flex flex-col p-8 gap-8">
                            <Link
                                to="/"
                                className="text-3xl font-black text-gray-900 border-b border-gray-50 pb-6"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <a
                                href="#services"
                                className="text-3xl font-black text-gray-900 border-b border-gray-50 pb-6"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Categories
                            </a>
                            <a
                                href="#offers"
                                className="text-3xl font-black text-gray-900 border-b border-gray-50 pb-6 flex items-center justify-between"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Hot Deals
                                <span className="bg-rose-500 text-white text-xs px-3 py-1 rounded-full uppercase font-black">Hot</span>
                            </a>

                            <div className="mt-12 space-y-6">
                                <div>
                                    <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em] mb-3">Support & Help</p>
                                    <a href="tel:+971544556106" className="flex items-center gap-4 text-xl font-bold text-primary-600">
                                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                                            <Menu size={20} className="rotate-90" /> {/* Just a placeholder icon */}
                                        </div>
                                        +971 54 455 6106
                                    </a>
                                </div>
                                <div className="pt-6 border-t border-gray-50">
                                    <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                        Pure Home, Wise Decision. We are here to provide you with the best cleaning experience in Dubai.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-grow pt-4 md:pt-20">
                {children}
            </main>

            {!hideFooter && <div className="mb-16 md:mb-0"><Footer /></div>}

            <MobileNav />
        </div>
    );
};
