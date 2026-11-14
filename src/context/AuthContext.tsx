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
    if (code === 'signup_disabled' || message.includes('signups not allowed')) {
        return 'New account registration is currently disabled. Please contact support.';
    }
    if (code === 'email_address_invalid' || message.includes('invalid email')) {
        return 'Please enter a valid email address.';
    }
    if (code === 'user_already_exists' || message.includes('already registered') || message.includes('already exists')) {
        return 'This email is already registered. Sign in or use Forgot password.';
    }
    if (code === 'weak_password' || message.includes('password should be')) {
        return 'Choose a stronger password with at least 6 characters.';
    }
    if (code === 'over_email_send_rate_limit' || message.includes('rate limit')) {
        return 'Too many attempts. Please wait a few minutes and try again.';
    }
    if (message.includes('database error saving new user')) {
        return 'The account database is not configured correctly. Please contact support.';
    }
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [authReady, setAuthReady] = useState(!isSupabaseConfigured());
    const [passwordRecovery, setPasswordRecovery] = useState(false);

    useEffect(() => {
        if (!isSupabaseConfigured()) return;

        let mounted = true;
        let authEventVersion = 0;

        const applySession = (session: { user?: SupabaseUser | null } | null) => {
            setUser(session?.user ? toAppUser(session.user) : null);
        };

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return;
            authEventVersion += 1;
            if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
            if (event === 'SIGNED_OUT') setPasswordRecovery(false);
            applySession(session);
            setAuthReady(true);
        });

        supabase.auth.getSession().then(({ data }) => {
            if (mounted) {
                // Do not overwrite a newer SIGNED_IN/SIGNED_OUT event with a
                // stale result from the initial session read.
                if (authEventVersion === 0) applySession(data.session);
                setAuthReady(true);
            }
        }).catch(() => {
            if (mounted) {
                if (authEventVersion === 0) setUser(null);
                setAuthReady(true);
            }
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

    // Admin access is always authenticated through Supabase app_metadata.role = admin.
    const login = async (email: string, password: string) => {
        if (!isSupabaseConfigured()) return { success: false, message: 'Supabase authentication is not configured for this environment.' };
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
        try {
            if (isSupabaseConfigured()) await supabase.auth.signOut();
        } catch (error) {
            console.error('Could not complete remote sign out:', error);
        } finally {
            setPasswordRecovery(false);
            setUser(null);
        }
    };

    const clearPasswordRecovery = () => setPasswordRecovery(false);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, authReady, passwordRecovery, login, signInWithEmail, signUpWithEmailAndPhone, resetPasswordForEmail, updateAccount, logout, clearPasswordRecovery }}>
            {children}
        </AuthContext.Provider>
    );
};
