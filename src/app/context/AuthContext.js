'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        console.log('🚀 [AuthContext] Mounted - fetching session...')

        const getSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession()

                console.log('🧠 [AuthContext] getSession result:', data)
                if (error) console.error('❌ [AuthContext] getSession error:', error)

                if (data?.session?.user) {
                    console.log('✅ [AuthContext] User found:', data.session.user.email)
                } else {
                    console.warn('⚠️ [AuthContext] No user session found.')
                }

                setUser(data?.session?.user ?? null)
                setLoading(false)
            } catch (err) {
                console.error('💥 [AuthContext] Unexpected error in getSession:', err)
                setLoading(false)
            }
        }

        getSession()

        // ✅ Listen for login/logout state changes
        const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('⚡ [AuthContext] Auth state changed:', event)
            if (session?.user) {
                console.log('👤 [AuthContext] New session user:', session.user.email)
            } else {
                console.warn('🚫 [AuthContext] Session cleared (user logged out or expired).')
            }
            setUser(session?.user ?? null)
        })

        return () => {
            console.log('🧹 [AuthContext] Unsubscribing from auth listener...')
            subscription.subscription.unsubscribe()
        }
    }, [])

    // ✅ تسجيل الدخول
    const signIn = async (email, password) => {
        console.log('🔑 [AuthContext] Attempting sign in with:', email)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            console.log('✅ [AuthContext] Sign in success:', data.user.email)
            setUser(data.user)
            return { user: data.user }
        } catch (error) {
            console.error('❌ [AuthContext] Error signing in:', error.message)
            return { error }
        }
    }

    // ✅ إنشاء حساب جديد
    const signUp = async (email, password) => {
        console.log('🆕 [AuthContext] Attempting sign up with:', email)
        try {
            const { data, error } = await supabase.auth.signUp({ email, password })
            if (error) throw error
            console.log('✅ [AuthContext] Sign up success:', data.user.email)
            setUser(data.user)
            return { user: data.user }
        } catch (error) {
            console.error('❌ [AuthContext] Error signing up:', error.message)
            return { error }
        }
    }

    // ✅ تسجيل الخروج
    const signOut = async () => {
        console.log('🚪 [AuthContext] Signing out...')
        try {
            await supabase.auth.signOut()
            setUser(null)
            console.log('✅ [AuthContext] Signed out successfully.')
        } catch (error) {
            console.error('❌ [AuthContext] Error signing out:', error)
        }
    }

    // ✅ Logs لتوضيح الحالة العامة
    useEffect(() => {
        console.log('🔍 [AuthContext] user state changed:', user)
        console.log('⏳ [AuthContext] loading:', loading)
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
