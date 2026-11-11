import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { normalizePhone, useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';

interface CustomerAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    destination?: string;
    initialMode?: 'login' | 'signup' | 'reset';
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ isOpen, onClose, destination = '/', initialMode = 'login' }) => {
    const { isAuthenticated, authReady, isLoading, signInWithEmail, signUpWithEmailAndPhone, resetPasswordForEmail, updateAccount } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);
    const [identifier, setIdentifier] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setMode(initialMode);
        setIdentifier('');
        setEmail('');
        setPhone('');
        setFullName('');
        setPassword('');
        setError('');
        setNotice('');
        setShowPassword(false);
        setAcceptedTerms(false);
    }, [initialMode, isOpen]);

    useEffect(() => {
        if (isOpen && initialMode !== 'reset' && authReady && isAuthenticated) {
            navigate(destination, { replace: true, state: null });
        }
    }, [authReady, destination, initialMode, isAuthenticated, isOpen, navigate]);

    const switchMode = (nextMode: 'login' | 'signup') => {
        setMode(nextMode);
        setError('');
        setNotice('');
    };

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setNotice('');
        if (mode === 'forgot') {
            if (!email.trim() || !email.includes('@')) {
                setError('Please enter a valid email address.');
                return;
            }
            const result = await resetPasswordForEmail(email);
            if (!result.success) setError(result.message || 'Could not send the reset email.');
            else setNotice(result.message || 'Check your email for a password reset link.');
            return;
        }
        if (mode === 'reset') {
            if (password.length < 6) {
                setError('Password must be at least 6 characters.');
                return;
            }
            const result = await updateAccount({ newPassword: password });
            if (!result.success) setError(result.message || 'Could not update your password.');
            else {
                setNotice('Password updated successfully.');
                setPassword('');
            }
            return;
        }
        if (mode === 'login' && (!identifier.trim() || !password.trim())) {
            setError('Please enter your email and password.');
            return;
        }
        if (mode === 'signup' && (!email.trim() || !email.includes('@') || !phone.trim() || !password.trim())) {
            setError('Please enter your email, mobile number, and password.');
            return;
        }
        if (mode === 'signup' && (!email.trim() || !email.includes('@'))) {
            setError('Please enter a valid email address.');
            return;
        }
        if (mode === 'signup' && !phone.trim()) {
            setError('Please enter your mobile number.');
            return;
        }
        if (mode === 'signup' && !/^\+9715\d{8}$/.test(normalizePhone(phone))) {
            setError('Please enter a valid UAE mobile number, for example 05XXXXXXXX.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (mode === 'signup' && !fullName.trim()) {
            setError('Please enter your name.');
            return;
        }
        if (mode === 'signup' && !acceptedTerms) {
            setError('Please accept the Terms of Use and Privacy Policy to continue.');
            return;
        }

        const result = mode === 'login'
            ? await signInWithEmail(identifier, password)
            : await signUpWithEmailAndPhone(email, phone, password, fullName);
        if (!result.success) {
            setError(result.message || 'Something went wrong.');
            return;
        }
        if ('needsConfirmation' in result && result.needsConfirmation) {
            setNotice(result.message || 'Account created. Please confirm your phone if requested.');
            setMode('login');
            setIdentifier(email);
            setPassword('');
            return;
        }
        navigate(destination, { replace: true, state: null });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === 'reset' ? 'Set a new password' : mode === 'forgot' ? 'Reset your password' : mode === 'login' ? 'Sign in to Purity' : 'Create your Purity account'}>
            <div className="mx-auto w-full max-w-md px-1 pb-2" dir="ltr">
                <div className="mb-5">
                    <span className="text-xs font-black uppercase text-primary-600">Purity account</span>
                    <h1 className="mt-2 text-2xl font-black text-teal-950">{mode === 'reset' ? 'Choose a new password' : mode === 'forgot' ? 'Recover your account' : mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
                    <p className="mt-2 text-sm leading-6 text-gray-500">{mode === 'reset' ? 'Your new password will protect your Purity account.' : 'Manage your bookings and receive updates in one place.'}</p>
                </div>

                {mode !== 'forgot' && mode !== 'reset' && <div className="mb-5 grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm font-bold">
                    <button type="button" onClick={() => switchMode('login')} className={`rounded-lg py-2.5 ${mode === 'login' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}>Sign in</button>
                    <button type="button" onClick={() => switchMode('signup')} className={`rounded-lg py-2.5 ${mode === 'signup' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}>Register</button>
                </div>}

                {notice && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</div>}
                {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

                <form onSubmit={submit} className="space-y-4">
                    {mode === 'signup' && <Field icon={<UserRound size={18} />} label="Full name" value={fullName} onChange={setFullName} placeholder="Your name" />}
                    {mode === 'signup' && <Field icon={<Mail size={18} />} label="Email address" value={email} onChange={setEmail} placeholder="you@example.com" type="email" dir="ltr" />}
                    {mode === 'signup' ? <Field icon={<Phone size={18} />} label="Personal / mobile number" value={phone} onChange={setPhone} placeholder="05XXXXXXXX" type="tel" dir="ltr" /> : mode === 'forgot' ? <Field icon={<Mail size={18} />} label="Email address" value={email} onChange={setEmail} placeholder="you@example.com" type="email" dir="ltr" /> : mode !== 'reset' ? <Field icon={<Mail size={18} />} label="Email address" value={identifier} onChange={setIdentifier} placeholder="you@example.com" type="email" dir="ltr" /> : null}
                    {mode !== 'forgot' && <label className="block">
                        <span className="mb-1.5 block text-xs font-black text-gray-700">{mode === 'reset' ? 'New password' : 'Password'}</span>
                        <span className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
                            <LockKeyhole size={18} className="text-gray-400" />
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="At least 6 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                            <button type="button" onClick={() => setShowPassword(value => !value)} className="text-gray-400 hover:text-gray-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                        </span>
                    </label>}
                    {mode === 'login' && <button type="button" onClick={() => { setMode('forgot'); setError(''); setNotice(''); setEmail(identifier); }} className="-mt-2 text-left text-xs font-bold text-primary-700 hover:text-primary-900">Forgot password?</button>}
                    {mode === 'signup' && <label className="flex items-start gap-2 text-xs font-medium leading-5 text-gray-600"><input type="checkbox" checked={acceptedTerms} onChange={event => setAcceptedTerms(event.target.checked)} className="mt-1 h-4 w-4 accent-primary-700" required /><span>I agree to the <Link to="/terms" target="_blank" className="font-black text-primary-700 underline">Terms of Use</Link> and <Link to="/privacy" target="_blank" className="font-black text-primary-700 underline">Privacy Policy</Link>.</span></label>}
                    <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-primary-700 py-3.5 text-sm font-black text-white shadow-lg shadow-primary-700/20 transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60">
                        {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign in securely' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Update password'}
                    </button>
                </form>
                {mode === 'forgot' && <button type="button" onClick={() => switchMode('login')} className="mt-4 w-full text-center text-xs font-bold text-primary-700 hover:text-primary-900">Back to sign in</button>}
                {mode !== 'reset' && <p className="mt-5 text-center text-[11px] font-semibold leading-5 text-gray-400">Use your email to sign in. Your UAE mobile number is collected for service communication.</p>}
            </div>
        </Modal>
    );
};

const Field: React.FC<{ icon: React.ReactNode; label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; dir?: string }> = ({ icon, label, value, onChange, placeholder, type = 'text', dir }) => (
    <label className="block">
        <span className="mb-1.5 block text-xs font-black text-gray-700">{label}</span>
        <span className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
            <span className="text-gray-400">{icon}</span>
            <input type={type} value={value} onChange={event => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder={placeholder} dir={dir} required autoComplete={type === 'tel' ? 'tel' : undefined} />
        </span>
    </label>
);
