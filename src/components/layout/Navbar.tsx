// @ts-nocheck
import React, { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

import logo from '../../assets/logo.png';

export const Navbar: React.FC = () => {
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? 'h-20 bg-white/70 backdrop-blur-2xl border-b border-gray-100/50 shadow-[0_8px_32px_-10px_rgba(0,0,0,0.05)]'
            : 'h-24 bg-transparent border-b border-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">

                {/* Brand Identity */}
                <Link to="/" className="relative group flex items-center">
                    <motion.div
                        whileHover={{ scale: 1.02, y: -1 }}
                        className="relative z-10"
                    >
                        <img src={logo} alt="Purity" className="h-10 md:h-12 w-auto object-contain transition-all duration-500" />
                    </motion.div>

                    {/* Ambient Brand Glow */}
                    <div className="absolute -inset-x-8 -inset-y-4 bg-primary-500/[0.04] rounded-[2.5rem] opacity-0 group-hover:opacity-100 blur-3xl transition-all duration-700 pointer-events-none" />
                </Link>

                {/* Intelligent Navigation Hub */}
                <div className="hidden lg:flex items-center bg-gray-50/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100/50">
                    {[
                        { label: 'Offers', href: '#offers' },
                        { label: 'Commitment', href: '#happiness' },
                        { label: 'Insights', href: '#faq' },
                        { label: 'Reviews', href: '#reviews' }
                    ].map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-primary-600 hover:bg-white hover:shadow-sm transition-all duration-300 relative group/link"
                        >
                            {item.label}
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary-500 rounded-full opacity-0 group-hover/link:w-4 group-hover/link:opacity-100 transition-all duration-500" />
                        </a>
                    ))}
                </div>

                {/* Conversion Engine */}
                <div className="flex items-center">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                        className="relative group overflow-hidden bg-gray-900 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl shadow-gray-900/10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="relative z-10 flex items-center gap-2">
                            Book Experience
                            <Sparkles size={14} className="animate-pulse" />
                        </span>
                    </motion.button>
                </div>
            </div>

            {/* Subtle Progress Bar */}
            <motion.div
                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary-500 to-indigo-500"
                style={{ scaleX: 0, originX: 0 }}
            /* Note: We would use useScroll for a real progress bar, keeping it subtle for now */
            />
        </nav>
    );
};
