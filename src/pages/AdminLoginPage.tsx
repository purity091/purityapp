import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Loader2 } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

const isLocalDevelopment = import.meta.env.DEV && !isSupabaseConfigured();

export const AdminLoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const result = await login(email, password);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.message || 'فشل تسجيل الدخول');
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="Purity Cleaning Services" width={80} height={80} className="mx-auto mb-4 h-20 w-20 rounded-2xl object-contain shadow-lg" />
                    <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
                    <p className="text-gray-500 text-sm mt-2">Purity Management System</p>
                    <p className="text-xs text-amber-600 mt-2 font-medium">{isSupabaseConfigured() ? 'Supabase admin authentication' : isLocalDevelopment ? 'Local development mode' : 'Admin authentication is unavailable'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        dir="ltr"
                        placeholder="admin@purity.com"
                        disabled={isLoading}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        dir="ltr"
                        placeholder="Enter your password"
                        disabled={isLoading}
                        required
                    />

                    {error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <Button
                        className="w-full"
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </Button>
                </form>

                {isLocalDevelopment && <div className="mt-6 text-center"><p className="text-xs text-gray-400">Development credentials are available only in local development.</p></div>}
            </div>
        </div>
    );
};
