import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type AccountRole = 'customer' | 'admin';

export interface AppUser {
    id: string;
    phone?: string;
    email?: string;
    fullName?: string;
    role: AccountRole;
}

interface AuthContextType {
    user: AppUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    authReady: boolean;
    passwordRecovery: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    signUpWithEmailAndPhone: (email: string, phone: string, password: string, fullName: string) => Promise<{ success: boolean; needsConfirmation?: boolean; message?: string }>;
    resetPasswordForEmail: (email: string) => Promise<{ success: boolean; message?: string }>;
    updateAccount: (data: { fullName?: string; newPassword?: string }) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
    clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

const ADMIN_STORAGE_KEY = 'purity_user';
const ADMIN_CREDENTIALS = {
    email: import.meta.env.VITE_ADMIN_EMAIL || '',
    password: import.meta.env.VITE_ADMIN_PASSWORD || '',
};
const localAdminMode = import.meta.env.DEV && Boolean(ADMIN_CREDENTIALS.email && ADMIN_CREDENTIALS.password);
const authRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || `${window.location.origin}/?reset=1`;

export const normalizePhone = (value: string) => {
    const compact = value.trim().replace(/[\s()-]/g, '');
    if (compact.startsWith('+')) return compact;
    if (compact.startsWith('00')) return `+${compact.slice(2)}`;
    if (compact.startsWith('971')) return `+${compact}`;
    if (compact.startsWith('0')) return `+971${compact.slice(1)}`;
    return `+971${compact}`;
};

const getAuthErrorMessage = (error: { code?: string; message?: string } | null | undefined, fallback: string) => {
    const code = error?.code?.toLowerCase();
    const message = error?.message?.toLowerCase() || '';
    if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
        return 'Please confirm your email address before signing in.';
    }
    if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
        return 'The email or password is incorrect.';
    }
    return error?.message || fallback;
};

const toAppUser = (user: SupabaseUser, role?: AccountRole): AppUser => ({
    id: user.id,
    phone: user.phone || user.user_metadata?.phone_number || undefined,
    email: user.email || undefined,
    fullName: user.user_metadata?.full_name || undefined,
    role: role || (user.app_metadata?.role === 'admin' ? 'admin' : 'customer'),
});

const readSavedAdmin = (): AppUser | null => {
    try {
        const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (!saved) return null;
        const parsed = JSON.parse(saved) as AppUser;
        return parsed.role === 'admin' ? parsed : null;
    } catch {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        return null;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(() => localAdminMode ? readSavedAdmin() : null);
    const [isLoading, setIsLoading] = useState(false);
    const [authReady, setAuthReady] = useState(!isSupabaseConfigured());
    const [passwordRecovery, setPasswordRecovery] = useState(false);

    useEffect(() => {
        if (!isSupabaseConfigured()) return;

        let mounted = true;
        supabase.auth.getSession().then(({ data }) => {
            if (mounted) {
                setUser(data.session?.user ? toAppUser(data.session.user) : null);
                setAuthReady(true);
            }
        }).catch(() => {
            if (mounted) {
                setUser(null);
                setAuthReady(true);
            }
        });

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return;
            if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
            setUser(session?.user ? toAppUser(session.user) : null);
        });

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        if (!isSupabaseConfigured()) {
            return { success: false, message: 'Customer accounts are not configured yet.' };
        }

        setIsLoading(true);
        try {
            const normalizedEmail = email.trim().toLowerCase();
            if (!normalizedEmail.includes('@')) return { success: false, message: 'Please enter a valid email address.' };
            const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
            if (error || !data.user) return { success: false, message: getAuthErrorMessage(error, 'Could not sign in.') };
            setUser(toAppUser(data.user));
            return { success: true };
        } catch {
            return { success: false, message: 'Could not connect to authentication. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const signUpWithEmailAndPhone = async (email: string, phone: string, password: string, fullName: string) => {
        if (!isSupabaseConfigured()) {
            return { success: false, message: 'Customer accounts are not configured yet.' };
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password,
                options: { data: { full_name: fullName.trim(), phone_number: normalizePhone(phone) } },
            });

            if (error || !data.user) return { success: false, message: getAuthErrorMessage(error, 'Could not create account.') };
            if (data.session) {
                setUser(toAppUser(data.user));
                return { success: true };
            }
            return { success: true, needsConfirmation: true, message: 'Your account was created. Please check your email to confirm it if required.' };
        } catch {
            return { success: false, message: 'Could not connect to authentication. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const resetPasswordForEmail = async (email: string) => {
        if (!isSupabaseConfigured()) return { success: false, message: 'Customer accounts are not configured yet.' };
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
                redirectTo: authRedirectUrl,
            });
            if (error) return { success: false, message: getAuthErrorMessage(error, 'Could not send the reset email.') };
            return { success: true, message: 'If this email is registered, a password reset link has been sent.' };
        } catch {
            return { success: false, message: 'Could not connect to authentication. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    // The existing admin area remains available, but production admin users should be Supabase users with app_metadata.role = admin.
    const login = async (email: string, password: string) => {
        if (isSupabaseConfigured()) {
            setIsLoading(true);
            try {
                const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
                if (error || !data.user) return { success: false, message: getAuthErrorMessage(error, 'Could not sign in.') };
                if (data.user.app_metadata?.role !== 'admin') {
                    await supabase.auth.signOut();
                    return { success: false, message: 'This account does not have admin access.' };
                }
                setUser(toAppUser(data.user, 'admin'));
                return { success: true };
            } catch {
                return { success: false, message: 'Could not connect to authentication. Please try again.' };
            } finally {
                setIsLoading(false);
            }
        }

        if (!localAdminMode) return { success: false, message: 'Admin authentication is not configured for this environment.' };

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 350));
            if (!ADMIN_CREDENTIALS.email || !ADMIN_CREDENTIALS.password) {
                return { success: false, message: 'Admin login is not configured for this environment' };
            }
            if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
                return { success: false, message: 'Invalid email or password' };
            }
            const admin: AppUser = { email, id: 'local-admin', role: 'admin' };
            setUser(admin);
            localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
            return { success: true };
        } catch {
            return { success: false, message: 'Could not complete admin sign in. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const updateAccount = async ({ fullName, newPassword }: { fullName?: string; newPassword?: string }) => {
        if (!user || !isSupabaseConfigured()) return { success: false, message: 'Please sign in first.' };
        const updates: { password?: string; data?: { full_name?: string } } = {};
        if (newPassword?.trim()) updates.password = newPassword;
        if (fullName !== undefined) updates.data = { full_name: fullName.trim() };
        if (!Object.keys(updates).length) return { success: true };

        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.updateUser(updates);
            if (error || !data.user) return { success: false, message: getAuthErrorMessage(error, 'Could not update your account.') };
            setUser(toAppUser(data.user, user.role));
            setPasswordRecovery(false);
            return { success: true };
        } catch {
            return { success: false, message: 'Could not connect to authentication. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        if (isSupabaseConfigured()) await supabase.auth.signOut();
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        setPasswordRecovery(false);
        setUser(null);
    };

    const clearPasswordRecovery = () => setPasswordRecovery(false);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, authReady, passwordRecovery, login, signInWithEmail, signUpWithEmailAndPhone, resetPasswordForEmail, updateAccount, logout, clearPasswordRecovery }}>
            {children}
        </AuthContext.Provider>
    );
};
