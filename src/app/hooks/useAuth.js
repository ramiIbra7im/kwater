// src/app/hooks/useAuth.js
import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabaseClient"

export function useAuth() {
    const [user, setUser] = useState(null)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            setIsCheckingAuth(true)
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        } catch (error) {
        } finally {
            setIsCheckingAuth(false)
        }
    }

    return {
        user,
        isCheckingAuth,
        checkAuth
    }
}