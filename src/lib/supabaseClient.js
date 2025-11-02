// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // تعطيل حفظ الجلسة في الكوكيز
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: {
            getItem: (key) => {
                if (typeof window !== 'undefined') {
                    return localStorage.getItem(key)
                }
                return null
            },
            setItem: (key, value) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem(key, value)
                }
            },
            removeItem: (key) => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(key)
                }
            }
        }
    }
})