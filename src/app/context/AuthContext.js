'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // ✅ عند تحميل الصفحة أول مرة: نحصل على الجلسة الحالية
        const getSession = async () => {
            const { data, error } = await supabase.auth.getSession()
            if (error) console.error('Error fetching session:', error)
            setUser(data?.session?.user ?? null)
            setLoading(false)
        }

        getSession()

        // ✅ مراقبة التغير في حالة المصادقة (login/logout)
        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => {
            subscription.subscription.unsubscribe()
        }
    }, [])

    // ✅ دالة تسجيل الخروج
    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            setUser(null)
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
