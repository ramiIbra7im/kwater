'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const getSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession()


               
                setUser(data?.session?.user ?? null)
                setLoading(false)
            } catch (err) {
                setLoading(false)
            }
        }

        getSession()

        // ✅ Listen for login/logout state changes
        const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
            } else {
            }
            setUser(session?.user ?? null)
        })

        return () => {
            subscription.subscription.unsubscribe()
        }
    }, [])

    // ✅ تسجيل الدخول
    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            setUser(data.user)
            return { user: data.user }
        } catch (error) {
            return { error }
        }
    }

    // ✅ إنشاء حساب جديد
    const signUp = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signUp({ email, password })
            if (error) throw error
            setUser(data.user)
            return { user: data.user }
        } catch (error) {
            return { error }
        }
    }

    // ✅ تسجيل الخروج
    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            setUser(null)
        } catch (error) {
        }
    }

    // ✅ Logs لتوضيح الحالة العامة
    useEffect(() => {
    }, [user, loading])

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
