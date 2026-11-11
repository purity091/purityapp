import React from 'react';
import { ArrowUpRight, Clock3, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const legalLinks = [
    { to: '/terms', label: 'Terms of use' },
    { to: '/privacy', label: 'Privacy policy' },
    { to: '/consumer-rights', label: 'Consumer rights' },
    { to: '/cookies', label: 'Cookies' },
];

export const Footer: React.FC = () => (
    <footer className="mt-auto border-t border-white/10 bg-slate-950 text-white">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-7 sm:px-6 md:py-9 lg:px-8">
            <div className="grid gap-7 border-b border-white/10 pb-7 md:grid-cols-[1.3fr_0.8fr_1fr] md:gap-10">
                <section className="max-w-md">
                    <Link to="/" className="inline-flex items-center" aria-label="Purity home">
                        <img src="/logo.png" alt="Purity Cleaning Services" width={48} height={48} className="h-10 w-10 rounded-xl object-contain" />
                    </Link>
                    <p className="mt-3 text-sm font-semibold leading-6 text-slate-400">Reliable home services in Dubai, delivered with care, clarity, and convenience.</p>
                    <a href="https://consumerrights.gov.ae/ar/know-your-rights" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold text-slate-400 transition hover:text-white">
                        <img src="/consumer-rights.png" alt="Consumer Rights UAE" className="h-9 w-auto rounded-md border border-white/10" />
                        <span>Know your consumer rights <ArrowUpRight size={12} /></span>
                    </a>
                </section>

                <nav aria-label="Footer navigation">
                    <h2 className="text-[11px] font-black uppercase text-primary-300">Explore</h2>
                    <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-xs font-semibold text-slate-400">
                        <Link to="/" className="transition hover:text-white">Home</Link>
                        <Link to="/" state={{ scrollTo: 'services' }} className="transition hover:text-white">Services</Link>
                        <Link to="/faq" className="transition hover:text-white">FAQ</Link>
                        <a href="mailto:info@purity-services.com" className="transition hover:text-white">Support</a>
                    </div>
                    <h2 className="mt-5 text-[11px] font-black uppercase text-primary-300">Legal</h2>
                    <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-xs font-semibold text-slate-400">
                        {legalLinks.map(link => <Link key={link.to} to={link.to} className="transition hover:text-white">{link.label}</Link>)}
                    </div>
                </nav>

                <section>
                    <h2 className="text-[11px] font-black uppercase text-primary-300">Contact</h2>
                    <div className="mt-3 space-y-2.5 text-xs font-semibold text-slate-400">
                        <div className="flex items-center gap-2.5"><MapPin size={14} className="flex-none text-primary-300" /><span>Dubai, UAE</span></div>
                        <a href="https://wa.me/971544556106" className="flex items-center gap-2.5 transition hover:text-white"><MessageCircle size={14} className="flex-none text-emerald-400" /><span dir="ltr">+971 54 455 6106</span></a>
                        <a href="mailto:info@purity-services.com" className="flex items-center gap-2.5 transition hover:text-white"><Mail size={14} className="flex-none text-primary-300" /><span>info@purity-services.com</span></a>
                        <div className="flex items-center gap-2.5"><Clock3 size={14} className="flex-none text-primary-300" /><span>Sun–Fri · 8 AM–8 PM</span></div>
                    </div>
                    <a href="https://wa.me/971544556106" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-[11px] font-black text-white transition hover:bg-emerald-400"><Phone size={13} /> Chat on WhatsApp</a>
                </section>
            </div>

            <div className="flex flex-col gap-2 pt-5 text-[10px] font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p>© {new Date().getFullYear()} Purity. All rights reserved.</p>
                <p className="text-slate-600">Pure home. Wise decision.</p>
            </div>
        </div>
    </footer>
);
