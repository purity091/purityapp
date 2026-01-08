import React, { createContext, useContext, useState, useEffect } from 'react';

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

// بيانات Admin المؤقتة
const ADMIN_CREDENTIALS = {
    email: 'admin@purity.com',
    password: 'Admin@2025!',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // تحميل المستخدم من localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem('purity_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('purity_user');
            }
        }
    }, []);

    // تسجيل الدخول
    const login = async (email: string, password: string) => {
        setIsLoading(true);

        // محاكاة تأخير API
        await new Promise(resolve => setTimeout(resolve, 500));

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
