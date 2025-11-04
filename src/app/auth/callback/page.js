// src/app/auth/callback/page.js
'use client'
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FaSpinner, FaCheckCircle, FaExclamationTriangle, FaRedo } from "react-icons/fa"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function VerifyEmailCallback() {
    const router = useRouter()
    const params = useSearchParams()
    const [status, setStatus] = useState('loading')
    const [message, setMessage] = useState('جاري التحقق من رابط التفعيل...')
    const [retryCount, setRetryCount] = useState(0)
    const supabase = createClientComponentClient()

    const verifyEmail = async () => {
        const code = params.get('code')
        const error = params.get('error')
        const errorDescription = params.get('error_description')

        // إذا كان هناك خطأ في URL نفسه
        if (error) {
            setStatus('error')
            setMessage(errorDescription || `خطأ في الرابط: ${error}`)
            return
        }

        if (!code) {
            setStatus('error')
            setMessage('رابط التفعيل غير صالح - لا يوجد كود تفعيل')
            return
        }

        try {
            console.log('Starting verification with code:', code)

            // استخدام مسار نسبي بدلاً من المطلق
            const baseUrl = window.location.origin
            const verifyUrl = `${baseUrl}/auth/callback/exchange?code=${encodeURIComponent(code)}`

            console.log('Calling API:', verifyUrl)

            const response = await fetch(verifyUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // إضافة credentials إذا كانت ضرورية
                credentials: 'same-origin'
            })

            console.log('Response status:', response.status)

            const data = await response.json()
            console.log('Response data:', data)

            if (!response.ok || data.error) {
                throw new Error(data.message || `خطأ في السيرفر: ${response.status}`)
            }

            // 🔄 محاولة الحصول على السيشن الجديد
            const { data: { session: newSession }, error: sessionError } = await supabase.auth.getSession()

            if (sessionError) {
                console.error('Session error:', sessionError)
                // لا نوقف العملية لو فشل جلب السيشن
            }

            console.log('Verification successful, session:', newSession)

            setStatus('success')
            setMessage('تم تفعيل حسابك بنجاح! جاري توجيهك...')

            // تأخير التوجيه ليعطي فرصة لرؤية رسالة النجاح
            setTimeout(() => {
                router.push('/Complete-account')
            }, 2000)

        } catch (err) {
            console.error('Verification error:', err)

            // إذا كان الخطأ متعلق بالشبكة، نعطي فرصة لإعادة المحاولة
            if (err.message.includes('network') || err.message.includes('fetch') || retryCount < 3) {
                setStatus('loading')
                setMessage(`محاولة إعادة الاتصال... (${retryCount + 1}/3)`)
                setRetryCount(prev => prev + 1)

                // إعادة المحاولة بعد 2 ثانية
                setTimeout(() => {
                    verifyEmail()
                }, 2000)
            } else {
                setStatus('error')
                setMessage(err.message || 'حدث خطأ أثناء التفعيل. حاول مجددًا.')
            }
        }
    }

    useEffect(() => {
        verifyEmail()
    }, []) // إزالة dependencies لتجنب إعادة التشغيل

    const handleRetry = () => {
        setStatus('loading')
        setMessage('جاري إعادة المحاولة...')
        setRetryCount(0)
        verifyEmail()
    }

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
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full translate-x-1/2 translate-y-1/2"></div>
                    </div>

                    <div className="relative z-10 p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className={`p-4 rounded-2xl transition-all duration-500 ${status === 'loading' ? 'bg-blue-100' :
                                status === 'success' ? 'bg-green-100' :
                                    'bg-red-100'
                                }`}>
                                {getStatusIcon()}
                            </div>
                        </div>

                        <h2 className={`text-2xl font-bold mb-3 transition-all duration-500 ${status === 'loading' ? 'text-gray-800' :
                            status === 'success' ? 'text-green-800' :
                                'text-red-800'
                            }`}>
                            {message}
                        </h2>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                            {status === 'loading' && (retryCount > 0 ?
                                'نحاول إعادة الاتصال بالسيرفر...' :
                                'نحن نعالج رابط التفعيل، من فضلك انتظر...'
                            )}
                            {status === 'success' && 'تم تفعيل حسابك! جاري توجيهك لإكمال الملف الشخصي.'}
                            {status === 'error' && 'يمكنك تسجيل الدخول يدوياً أو محاولة التسجيل مرة أخرى.'}
                        </p>

                        {status === 'loading' && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"></div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleRetry}
                                    className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition font-medium"
                                >
                                    <FaRedo className="text-sm" />
                                    إعادة المحاولة
                                </button>
                                <button
                                    onClick={() => router.push('/auth/login')}
                                    className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition font-medium"
                                >
                                    تسجيل الدخول
                                </button>
                                <button
                                    onClick={() => router.push('/auth/signup')}
                                    className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition font-medium"
                                >
                                    إنشاء حساب جديد
                                </button>
                            </div>
                        )}

                        <div className="mt-6 p-4 bg-white/50 rounded-xl border border-white/80">
                            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                                <span className="text-xs">🔒</span>
                                بياناتك محمية ومشفرة بأعلى معايير الأمان
                            </p>
                        </div>

                        {/* معلومات التصحيح */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs text-yellow-800">
                                    <strong>التصحيح:</strong> Retry: {retryCount}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}