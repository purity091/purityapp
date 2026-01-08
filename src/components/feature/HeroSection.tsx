// @ts-nocheck
import React from 'react';
import { Button } from '../ui/Button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
    const scrollToIntent = () => {
        document.getElementById('intent-selector')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="relative min-h-[85svh] flex flex-col justify-center bg-white overflow-hidden pt-10 md:pt-0">

            {/* Background Subtle Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-teal-50/50 to-transparent"></div>
                <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-teal-100/30 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center lg:text-left space-y-10"
                >
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 tracking-tight">
                            Pure Home, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">Wise Decision.</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
                            We don't just sell "cleaning hours." We offer you peace of mind and extra time to spend with those you love.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                        <Button size="lg" className="px-10 h-14 text-lg rounded-full shadow-teal-500/20 shadow-xl" onClick={scrollToIntent}>
                            Start Your Journey
                        </Button>
                    </div>

                    <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-400 pt-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-teal-500" />
                            <span>No Account Needed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-teal-500" />
                            <span>Premium Options</span>
                        </div>
                    </div>

                </motion.div>

                <motion.div
                    initial={{ opacity: 0, opacity: 0 }}
                    animate={{ opacity: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="hidden lg:block relative"
                >
                    <div className="aspect-[4/5] relative rounded-[3rem] overflow-hidden shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=1000"
                            alt="Calm Interior"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="absolute bottom-10 right-10 left-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white"
                        >
                            <p className="font-light text-lg">"Clarity is the beginning of comfort."</p>
                        </motion.div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};
