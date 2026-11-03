import React from 'react';
import { ExternalLink, FileCheck2, LockKeyhole, ReceiptText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { COOKIE_CONSENT_KEY, COOKIE_SETTINGS_EVENT } from '../components/layout/CookieConsentBanner';

export type LegalPageKind = 'terms' | 'privacy' | 'consumer' | 'cookies';

interface LegalPageProps {
    kind: LegalPageKind;
}

const companyName = 'PURITY PREMIUM TECHNICAL SERVICES L.L.C';
const legalForm = 'Limited Liability Company (LLC)';
const mainLicenseNumber = '917883';
const registeredOffice = 'Office F-204-62, Al Baraha, Dubai, United Arab Emirates';
const registeredOfficeAsProvided = 'مقر بتكم F-204-62-ةحاربلا-ىميمتلا ىريزجلا نيسح دمحم هنما كلم';
const contactEmail = 'info@purity-services.com';
const supportPhone = '+971 54 455 6106';

const pageMeta: Record<LegalPageKind, { title: string; eyebrow: string; intro: string; icon: React.ReactNode }> = {
    terms: {
        title: 'Terms of Use and Service Delivery',
        eyebrow: 'Terms of use',
        intro: `These terms explain how you may use the ${companyName} platform and request home services. Submitting a booking request means that you have read and accepted these terms.`,
        icon: <FileCheck2 size={24} />,
    },
    privacy: {
        title: 'Privacy and Data Protection Policy',
        eyebrow: 'Privacy policy',
        intro: 'We respect your privacy. This policy explains what information we collect, why we use it, who may process it, and the choices available to you.',
        icon: <LockKeyhole size={24} />,
    },
    consumer: {
        title: 'Consumer Rights, Cancellation and Refunds',
        eyebrow: 'Consumer rights',
        intro: 'This page explains your rights when requesting a service, including clear pricing, complaints, cancellation, rescheduling and refunds under applicable UAE laws.',
        icon: <ReceiptText size={24} />,
    },
    cookies: {
        title: 'Cookies and Tracking Policy',
        eyebrow: 'Cookies policy',
        intro: 'We use necessary cookies to operate accounts and the application. Optional analytics and marketing tools are enabled only after you make a choice.',
        icon: <ShieldCheck size={24} />,
    },
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="border-t border-slate-200 pt-5">
        <h2 className="text-base font-semibold text-slate-950 md:text-lg">{title}</h2>
        <div className="mt-2 space-y-2 text-sm leading-7 text-slate-600">{children}</div>
    </section>
);

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => <li className="ml-5 list-disc">{children}</li>;

export const LegalPage: React.FC<LegalPageProps> = ({ kind }) => {
    const meta = pageMeta[kind];

    const resetCookieConsent = () => {
        try { localStorage.removeItem(COOKIE_CONSENT_KEY); } catch { /* browser storage may be restricted */ }
        window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
    };

    return (
        <article className="min-h-screen bg-slate-50 px-4 pb-12 pt-6 md:px-8 md:pb-16 md:pt-10" dir="ltr">
            <div className="mx-auto max-w-4xl">
                <div className="rounded-2xl bg-gradient-to-br from-slate-950 to-primary-900 p-6 text-white shadow-xl shadow-slate-950/10 md:p-10">
                    <div className="flex items-center gap-3 text-primary-200">
                        <span className="rounded-xl bg-white/10 p-3">{meta.icon}</span>
                        <span className="text-xs font-semibold uppercase">{meta.eyebrow}</span>
                    </div>
                    <p className="mt-5 text-sm font-semibold text-primary-200">{companyName}</p>
                    <h1 className="mt-1 text-2xl font-semibold leading-tight md:text-4xl">{meta.title}</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">{meta.intro}</p>
                    <p className="mt-5 text-[11px] font-medium text-slate-300">Last updated: September 3, 2026 - Applies to {companyName} services in Dubai, United Arab Emirates.</p>
                </div>

                <div className="mt-8 space-y-7">
                    {kind === 'terms' && <>
                        <Section title="1. Service provider and scope">
                            <p>Services are provided by {companyName}, a {legalForm}. The company's Main License No. is {mainLicenseNumber}. Its registered office is {registeredOffice}.</p>
                            <p>The platform allows customers to review services and submit booking requests. An appointment becomes confirmed only after written confirmation from {companyName} through the platform or an approved contact channel.</p>
                        </Section>
                        <Section title="2. Account and booking responsibilities">
                            <ul className="space-y-1">
                                <Bullet>Provide accurate and current personal, contact and booking information.</Bullet>
                                <Bullet>Select the service, quantity or duration, area, date and time carefully.</Bullet>
                                <Bullet>Tell the service team in advance about access requirements, hazards, sensitive materials, pets or other relevant instructions.</Bullet>
                                <Bullet>Do not use the account or platform for unlawful purposes, impersonation or unauthorised activity.</Bullet>
                            </ul>
                        </Section>
                        <Section title="3. Prices, payment and invoices">
                            <p>Each service is displayed with its pricing unit, such as per hour, per day, per seat, per item or per package. The displayed price is the basis of the booking request. Any change required because of a different service scope must be explained to the customer and accepted before the additional work is performed.</p>
                            <p>The available payment method and any additional charges are shown during booking. For a paid transaction, the customer should receive an invoice or receipt containing the provider, service, price and relevant transaction details.</p>
                        </Section>
                        <Section title="4. Cancellation and rescheduling">
                            <p>Customers may request cancellation or rescheduling by contacting {companyName} through {contactEmail} or {supportPhone} before the appointment at a reasonable time. Any cancellation fee or notice requirement must be disclosed clearly before booking and must comply with applicable law.</p>
                            <p>Eligible refunds are returned through the applicable payment method and within the period communicated to the customer, without limiting any mandatory consumer right.</p>
                        </Section>
                        <Section title="5. Safety, quality and responsibility">
                            <p>{companyName} aims to provide services professionally and according to the published description. The customer must provide a reasonably safe environment and timely access to the property. Nothing in these terms excludes liability or a legal obligation that cannot lawfully be excluded.</p>
                        </Section>
                        <Section title="6. Complaints and dispute resolution">
                            <p>Please contact our support team first through {contactEmail} or {supportPhone} so that we can review and resolve the complaint promptly. This process does not prevent a customer from using official consumer-protection channels in Dubai or the United Arab Emirates.</p>
                        </Section>
                    </>}

                    {kind === 'privacy' && <>
                        <Section title="1. Data controller">
                            <p>{companyName}, Main License No. {mainLicenseNumber}, is the data controller for customer information processed through this platform and its service operations. The registered office is {registeredOffice}; privacy requests may be sent to {contactEmail}.</p>
                        </Section>
                        <Section title="2. Information we may collect">
                            <ul className="space-y-1">
                                <Bullet>Identity and contact details, including name, email address and phone number.</Bullet>
                                <Bullet>Booking details, including service, date, time, area, address, map location and special instructions.</Bullet>
                                <Bullet>Account information, notifications and booking status.</Bullet>
                                <Bullet>Necessary technical information used for security, session management and application operation.</Bullet>
                            </ul>
                        </Section>
                        <Section title="3. Why we use information">
                            <p>We use information to create and secure accounts, process booking requests, communicate about appointments, send service updates, provide support, prevent misuse and meet applicable legal and accounting obligations. Optional analytics or marketing uses require a separate choice where required by law, and that choice may be withdrawn later.</p>
                        </Section>
                        <Section title="4. Sharing and international processing">
                            <p>We may share the minimum information needed with staff, service contractors, hosting providers, authentication providers, notification providers and competent authorities where legally required. When a customer chooses to open WhatsApp or another external service, the information visible in that action is subject to the external provider's own policy.</p>
                            <p>Some technology providers may process data outside the UAE. We use appropriate contractual, technical and organisational safeguards required by applicable law and do not sell customer personal information.</p>
                        </Section>
                        <Section title="5. Retention and security">
                            <p>We retain information only for as long as necessary for the purpose for which it was collected, account and booking management, dispute resolution, security and legal obligations. We use appropriate access controls and technical safeguards, but no electronic storage or transmission method can be guaranteed to be completely risk-free.</p>
                        </Section>
                        <Section title="6. Privacy requests">
                            <p>You may contact {contactEmail} to ask about access, correction, deletion, restriction, objection or withdrawal of optional consent, subject to applicable legal limits. We may need to verify your identity before completing a request.</p>
                        </Section>
                    </>}

                    {kind === 'consumer' && <>
                        <Section title="1. Clear service information and pricing">
                            <p>Customers should receive clear information about the service, pricing unit, scope, duration, additional charges and any material booking condition before confirming a request. A customer is entitled to the price displayed or expressly accepted for the agreed service scope.</p>
                        </Section>
                        <Section title="2. Safe and professional service">
                            <p>Customers are entitled to a suitable and reasonably safe service delivered with professional care and according to the agreed description. Where a service is defective or materially different from what was agreed, the customer may request an appropriate remedy subject to the facts, evidence and applicable law.</p>
                        </Section>
                        <Section title="3. Invoices and payments">
                            <p>For a paid transaction, the customer should receive an invoice or receipt showing the provider details, service description, price and relevant transaction information. Any payment issue should be reported promptly to {contactEmail} with the booking reference.</p>
                        </Section>
                        <Section title="4. Cancellation, refund and complaints">
                            <ul className="space-y-1">
                                <Bullet>To cancel or reschedule, contact {contactEmail} or {supportPhone} with the booking reference.</Bullet>
                                <Bullet>Any cancellation fee or condition must be disclosed before the booking is completed.</Bullet>
                                <Bullet>We review complaints promptly and fairly. This policy does not remove the right to contact the Dubai consumer-protection authority or another competent authority.</Bullet>
                            </ul>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <a href="https://u.ae/en/information-and-services/justice-safety-and-the-law/consumer-protection" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-800 hover:bg-primary-100">UAE Consumer Protection <ExternalLink size={13} /></a>
                                <a href="https://consumerrights.gov.ae/en/know-your-rights" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">Know your rights <ExternalLink size={13} /></a>
                            </div>
                        </Section>
                        <Section title="5. Regulatory reference">
                            <p>This policy is published by {companyName}, Main License No. {mainLicenseNumber}, and applies to its services in Dubai, United Arab Emirates. It should be read together with the Terms of Use and Privacy Policy.</p>
                        </Section>
                    </>}

                    {kind === 'cookies' && <>
                        <Section title="1. What cookies are">
                            <p>Cookies are small files or similar technologies that help a website remember a session, preferences and operational information. Similar technologies may be used in the browser or application.</p>
                        </Section>
                        <Section title="2. Categories we use">
                            <ul className="space-y-1">
                                <Bullet><strong>Necessary:</strong> account sessions, security, cookie preferences and core application features.</Bullet>
                                <Bullet><strong>Analytics:</strong> optional tools that help us understand usage and improve the service, enabled only after consent where required.</Bullet>
                                <Bullet><strong>External services:</strong> when you choose to open WhatsApp, maps or another external provider, that provider may use its own technologies under its own policy.</Bullet>
                            </ul>
                        </Section>
                        <Section title="3. Managing your choices">
                            <p>You may accept or reject optional analytics from the consent banner and change your choice at any time. Your browser may also allow you to delete or block cookies, although blocking necessary cookies can affect sign-in and application functionality.</p>
                            <button type="button" onClick={resetCookieConsent} className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-xs font-semibold text-primary-800 hover:bg-primary-100">Change cookie preferences</button>
                        </Section>
                        <Section title="4. Retention and third parties">
                            <p>Your preference is stored on your device until you change or remove it. Optional analytics providers may place their own cookies after consent and are subject to their respective policies. We do not use optional tracking before the required consent is provided.</p>
                        </Section>
                    </>}
                </div>

                <div className="mt-10 rounded-xl border border-slate-200 bg-white p-4 text-xs font-medium leading-6 text-slate-600">
                    <p className="font-semibold text-slate-900">Company information</p>
                    <p>{companyName} · {legalForm} · Main License No. {mainLicenseNumber}</p>
                    <p>Registered office: {registeredOffice}</p>
                    <p className="text-slate-500" dir="rtl">Address reference supplied by the company: {registeredOfficeAsProvided}</p>
                    <p>Contact: {contactEmail} · {supportPhone}</p>
                </div>

                <nav className="mt-6 flex flex-wrap gap-2 text-xs font-semibold" aria-label="Legal pages">
                    <Link to="/terms" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50">Terms of use</Link>
                    <Link to="/privacy" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50">Privacy policy</Link>
                    <Link to="/consumer-rights" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50">Consumer rights</Link>
                    <Link to="/cookies" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50">Cookies</Link>
                </nav>
            </div>
        </article>
    );
};
