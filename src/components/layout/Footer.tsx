import React from 'react';
import { Sparkles, Phone, Mail, MapPin } from 'lucide-react';

import logo from '../../assets/logo.png';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white mt-auto pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="Purity" className="h-10 w-auto object-contain" />
                        </div>
                        <h3 className="text-xl font-bold text-white">We are Purity!</h3>
                        <p className="text-gray-400 max-w-sm leading-relaxed">
                            Purity Cleaning Services is the ideal choice for individuals and families looking for comfort, quality and reliability.
                        </p>
                        <div className="pt-2">
                            <a
                                href="https://consumerrights.gov.ae/ar/know-your-rights"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src="/consumer-rights.png"
                                    alt="Consumer Rights UAE"
                                    className="h-16 w-auto rounded-lg shadow-lg border border-white/10"
                                />
                            </a>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-primary-400">Contact Us</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span>Dubailand, Dubai</span>
                            </div>
                            <a href="https://wa.me/971544556106" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span dir="ltr">+971 54 455 6106</span>
                            </a>
                            <a href="mailto:info@purity-services.com" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span>info@purity-services.com</span>
                            </a>
                            <div className="pt-2">
                                <h5 className="text-sm font-bold text-primary-400 mb-2">Operating Hours</h5>
                                <div className="space-y-1 text-sm text-gray-400">
                                    <p>Sun – Fri : 8 am – 8 pm</p>
                                    <p className="text-red-400">Saturday: CLOSED</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-primary-400">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
                            <li><a href="#services" className="text-gray-300 hover:text-white transition-colors">Services</a></li>
                            <li><a href="#privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Purity. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                    </div>
                </div>
            </div>
        </footer >
    );
};
