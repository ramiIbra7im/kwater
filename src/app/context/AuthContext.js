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
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;
                setUser(user);
            } catch (error) {
                console.error('Error getting user:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getCurrentUser();

        // الاستماع لتغيرات المصادقة - بدون إعادة توجيه
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event);
                setUser(session?.user || null);
                setLoading(false);

                // إزالة الـ router.push من هنا علشان مايحصلش تعارض
                // التسليم لصفحات الـ auth نفسها تتعامل مع الـ routing
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, [router]); // إزالة router من dependencies إذا مش محتاجينه

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