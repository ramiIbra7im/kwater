// context/AuthContext.js
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // دالة لتحقق من التوكن
    const validateToken = async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error) {
                // إذا كان التوكن منتهي الصلاحية، نقوم بتسجيل الخروج
                await supabase.auth.signOut();
                setUser(null);
                return null;
            }

            return user;
        } catch (error) {
            console.error('Token validation error:', error);
            return null;
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setLoading(true);

                // التحقق من وجود توكن في localStorage
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('supabase.auth.token');
                    if (token) {
                        const validUser = await validateToken();
                        setUser(validUser);
                    } else {
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // الاستماع لتغيرات المصادقة
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event);

                if (event === 'SIGNED_IN' && session) {
                    const validUser = await validateToken();
                    setUser(validUser);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    // تنظيف localStorage
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('supabase.auth.token');
                    }
                } else if (event === 'TOKEN_REFRESHED') {
                    const validUser = await validateToken();
                    setUser(validUser);
                }

                setLoading(false);
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('supabase.auth.token');
            }
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const value = {
        user,
        loading,
        signOut,
        validateToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};