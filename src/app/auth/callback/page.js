'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa"
import { useAuth } from "../../context/AuthContext" // مسار AuthContext

export default function VerifyEmailCallback() {
    const router = useRouter()
    const { user, signIn } = useAuth()
    const [status, setStatus] = useState('loading') // loading, success, error
    const [message, setMessage] = useState('جاري التحقق من رابط التفعيل...')

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const params = new URLSearchParams(window.location.search)
                const accessToken = params.get('access_token')
                const refreshToken = params.get('refresh_token')
                const type = params.get('type')

                if (type !== 'signup_confirm') throw new Error('رابط التفعيل غير صالح')

                if (accessToken) {
                    // تسجيل الدخول باستخدام الـ token
                    await signInWithToken(accessToken, refreshToken)
                    setStatus('success')
                    setMessage('تم تفعيل حسابك بنجاح! جاري توجيهك...')

                    // بعد ثانيتين، تحويل المستخدم حسب حالة الملف الشخصي
                    setTimeout(() => {
                        router.push("/complete-profile")
                    }, 2000)
                } else {
                    throw new Error('لا يوجد توكن للتفعيل')
                }
            } catch (err) {
                console.error(err)
                setStatus('error')
                setMessage('حدث خطأ في التفعيل. يمكنك تسجيل الدخول يدوياً.')
            }
        }

        const signInWithToken = async (access_token, refresh_token) => {
            // استدعاء مباشر لـ Supabase auth
            const { data: { session }, error } = await fetch('/api/set-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token, refresh_token })
            }).then(r => r.json())

            if (error) throw error

            // حدّث الـ AuthContext
            await signIn(session.user.email, session.user.password || 'dummy')
        }

        handleCallback()
    }, [router, signIn])

    const getStatusIcon = () => {
        switch (status) {
            case 'loading': return <FaSpinner className="animate-spin text-3xl text-blue-500" />
            case 'success': return <FaCheckCircle className="text-3xl text-green-500" />
            case 'error': return <FaExclamationTriangle className="text-3xl text-red-500" />
            default: return <FaSpinner className="animate-spin text-3xl text-blue-500" />
        }
    }

    const getStatusColor = () => {
        switch (status) {
            case 'loading': return 'border-blue-200 bg-blue-50'
            case 'success': return 'border-green-200 bg-green-50'
            case 'error': return 'border-red-200 bg-red-50'
            default: return 'border-gray-200 bg-gray-50'
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <div className="w-full max-w-md mx-auto">
                <div className={`relative overflow-hidden rounded-3xl shadow-2xl border-2 ${getStatusColor()} transition-all duration-500`}>
                    <div className="relative z-10 p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-2xl">
                                {getStatusIcon()}
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-3">{message}</h2>
                    </div>
                </div>
            </div>
        </div>
    )
}
