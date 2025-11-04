// src/app/auth/callback/page.js
'use client'
import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { FaSpinner, FaCheckCircle, FaExclamationTriangle, FaRedo } from "react-icons/fa"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// المكون الرئيسي
function CallbackContent() {
    const router = useRouter()
    const params = useSearchParams()
    const [status, setStatus] = useState('loading')
    const [message, setMessage] = useState('جاري تفعيل حسابك...')
    const [retryCount, setRetryCount] = useState(0)
    const supabase = createClientComponentClient()

    const handleAuthCallback = async () => {
        const code = params.get('code')
        const error = params.get('error')
        const errorDescription = params.get('error_description')

        // إذا كان هناك خطأ في الرابط
        if (error) {
            setStatus('error')
            setMessage(errorDescription || `خطأ في الرابط: ${error}`)
            return
        }

        if (!code) {
            setStatus('error')
            setMessage('رابط التفعيل غير صالح')
            return
        }

        try {
            // 1. استبدال الكود بالسيشن
            const response = await fetch(`/auth/callback/exchange?code=${encodeURIComponent(code)}`)
            const data = await response.json()

            if (!response.ok || data.error) {
                throw new Error(data.message || 'فشل في تفعيل الحساب')
            }

            // 2. الحصول على بيانات المستخدم
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                throw new Error('لم نتمكن من العثور على حسابك')
            }

            setStatus('success')
            setMessage('تم تفعيل حسابك بنجاح! جاري التحقق من بياناتك...')

            // 3. التحقق من اكتمال البيانات في profiles
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, phone, bio')
                .eq('id', user.id)
                .single()

            // تأخير بسيط لرؤية رسالة النجاح
            setTimeout(() => {
                if (profileError || !profileData || !profileData.full_name) {
                    // البيانات ناقصة → إكمال الملف الشخصي
                    router.push('/Complete-account')
                } else {
                    // البيانات مكتملة → الصفحة الرئيسية
                    router.push('/')
                }
            }, 2000)

        } catch (err) {
            console.error('Auth callback error:', err)

            // إعادة المحاولة تلقائياً
            if (retryCount < 2) {
                setStatus('loading')
                setMessage(`محاولة إعادة الاتصال... (${retryCount + 1}/2)`)
                setRetryCount(prev => prev + 1)
                setTimeout(() => handleAuthCallback(), 2000)
            } else {
                setStatus('error')
                setMessage(err.message || 'حدث خطأ أثناء التفعيل')
            }
        }
    }

    useEffect(() => {
        handleAuthCallback()
    }, [])

    const handleRetry = () => {
        setStatus('loading')
        setMessage('جاري إعادة المحاولة...')
        setRetryCount(0)
        handleAuthCallback()
    }

    // ... باقي كود الواجهة (نفس الكود السابق)
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
                            <div className={`p-4 rounded-2xl ${status === 'loading' ? 'bg-blue-100' : status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                                {getStatusIcon()}
                            </div>
                        </div>

                        <h2 className={`text-2xl font-bold mb-3 ${status === 'loading' ? 'text-gray-800' : status === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                            {message}
                        </h2>

                        <p className="text-gray-600 mb-6">
                            {status === 'loading' && (retryCount > 0 ? 'نحاول إعادة الاتصال...' : 'جاري معالجة طلبك...')}
                            {status === 'success' && 'جاري توجيهك إلى المكان المناسب...'}
                            {status === 'error' && 'يمكنك إعادة المحاولة أو تسجيل الدخول يدوياً.'}
                        </p>

                        {status === 'loading' && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"></div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col gap-3">
                                <button onClick={handleRetry} className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition">
                                    <FaRedo className="text-sm" />
                                    إعادة المحاولة
                                </button>
                                <button onClick={() => router.push('/auth/login')} className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition">
                                    تسجيل الدخول
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// مكون التحميل
function LoadingFallback() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="text-center">
                <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">جاري التحميل...</p>
            </div>
        </div>
    )
}

// التصدير مع Suspense
export default function CallbackPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <CallbackContent />
        </Suspense>
    )
}