import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export const Footer: React.FC = () => (
    <footer className="mt-auto border-t border-gray-800 bg-gray-900 pb-8 pt-12 text-white md:pt-14">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 border-b border-gray-800 pb-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-12">
                <div className="space-y-4 lg:col-span-6">
                    <img src={logo} alt="Purity" width={58} height={40} className="h-10 w-auto object-contain" />
                    <h2 className="text-xl font-black text-white">We are Purity.</h2>
                    <p className="max-w-xl text-sm font-medium leading-7 text-gray-400">
                        Purity Cleaning Services is the ideal choice for individuals and families looking for comfort, quality, and reliability.
                    </p>
                    <a
                        href="https://consumerrights.gov.ae/ar/know-your-rights"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block pt-1 transition-opacity hover:opacity-80"
                    >
                        <img src="/consumer-rights.png" alt="Consumer Rights UAE" className="h-14 w-auto rounded-lg border border-white/10" />
                    </a>
                </div>

                <div className="lg:col-span-3">
                    <h3 className="mb-5 text-sm font-black uppercase tracking-wider text-primary-300">Contact us</h3>
                    <div className="space-y-4 text-sm font-medium text-gray-300">
                        <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 flex-none text-primary-300" />
                            <span>Dubailand, Dubai</span>
                        </div>
                        <a href="https://wa.me/971544556106" className="flex items-center gap-3 transition-colors hover:text-white">
                            <Phone className="h-4 w-4 flex-none text-primary-300" />
                            <span dir="ltr">+971 54 455 6106</span>
                        </a>
                        <a href="mailto:info@purity-services.com" className="flex items-center gap-3 transition-colors hover:text-white">
                            <Mail className="h-4 w-4 flex-none text-primary-300" />
                            <span>info@purity-services.com</span>
                        </a>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <h3 className="mb-5 text-sm font-black uppercase tracking-wider text-primary-300">Explore</h3>
                    <ul className="space-y-3 text-sm font-medium text-gray-300">
                        <li><Link to="/" className="transition-colors hover:text-white">Home</Link></li>
                        <li><Link to="/" state={{ scrollTo: 'services' }} className="transition-colors hover:text-white">Services</Link></li>
                        <li><a href="mailto:info@purity-services.com" className="transition-colors hover:text-white">Contact support</a></li>
                    </ul>
                    <div className="mt-6 border-t border-gray-800 pt-4 text-xs font-medium text-gray-400">
                        <p className="font-bold text-gray-300">Operating hours</p>
                        <p className="mt-1">Sun – Fri: 8 am – 8 pm</p>
                        <p className="mt-1 text-red-300">Saturday: Closed</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-3 pt-6 text-xs font-medium text-gray-500 sm:flex-row sm:items-center">
                <p>© {new Date().getFullYear()} Purity. All rights reserved.</p>
                <p>Pure home. Wise decision.</p>
            </div>
        </div>
    </footer>
);
