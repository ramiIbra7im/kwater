'use client'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/unauthorized') // يوديه صفحة ممنوع الوصول
        }
    }, [user, loading, router])

    if (loading) return <div className="text-center p-6">Loading...</div>

    return user ? children : null
}
