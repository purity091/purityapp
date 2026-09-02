import React, { createContext, useContext, useState } from 'react';

interface User {
    email: string;
    id: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const readSavedUser = (): User | null => {
    const savedUser = localStorage.getItem('purity_user');
    if (!savedUser) return null;
    try {
        return JSON.parse(savedUser) as User;
    } catch {
        localStorage.removeItem('purity_user');
        return null;
    }
};

// Development-only credentials are supplied through the ignored local .env file.
// Production authentication must be handled by a server-side provider.
const ADMIN_CREDENTIALS = {
    email: import.meta.env.VITE_ADMIN_EMAIL || '',
    password: import.meta.env.VITE_ADMIN_PASSWORD || '',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(readSavedUser);
    const [isLoading, setIsLoading] = useState(false);

    // تسجيل الدخول
    const login = async (email: string, password: string) => {
        setIsLoading(true);

        // محاكاة تأخير API
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!ADMIN_CREDENTIALS.email || !ADMIN_CREDENTIALS.password) {
            setIsLoading(false);
            return {
                success: false,
                message: 'Admin login is not configured for this environment',
            };
        }

        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            const userData = {
                email: ADMIN_CREDENTIALS.email,
                id: '1',
            };

            setUser(userData);
            localStorage.setItem('purity_user', JSON.stringify(userData));
            setIsLoading(false);

            return { success: true };
        }

        setIsLoading(false);
        return {
            success: false,
            message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        };
    };

    // تسجيل الخروج
    const logout = async () => {
        setUser(null);
        localStorage.removeItem('purity_user');
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
