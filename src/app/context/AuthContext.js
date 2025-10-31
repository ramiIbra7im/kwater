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

    useEffect(() => {
        // جلب حالة المستخدم الحالي
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        getCurrentUser();

        // الاستماع لتغيرات المصادقة
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user || null);
                setLoading(false);

                if (event === 'SIGNED_IN') {
                    // تحديث الصفحة الحالية
                    router.refresh();
                }

                if (event === 'SIGNED_OUT') {
                    router.push('/');
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    const value = {
        user,
        loading,
        signOut: () => supabase.auth.signOut(),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};