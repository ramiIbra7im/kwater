'use client'
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa"

export default function VerifyEmailCallback() {
    const router = useRouter()
    const params = useSearchParams()
    const [status, setStatus] = useState('loading')
    const [message, setMessage] = useState('جاري التحقق من رابط التفعيل...')

    useEffect(() => {
        const code = params.get('code')

        const verify = async () => {
            if (!code) return

            try {
                // نطلب من السيرفر يعمل exchange
                const response = await fetch(`/auth/callback/exchange?code=${code}`)
                const data = await response.json()

                if (!response.ok || data.error) {
                    throw new Error(data.error || 'حدث خطأ أثناء التفعيل.')
                }

                setStatus('success')
                setMessage('تم تفعيل حسابك بنجاح! جاري توجيهك...')
                setTimeout(() => router.push('/Complete-account'), 2000)
            } catch (err) {
                console.error(err)
                setStatus('error')
                setMessage(err.message || 'حدث خطأ أثناء التفعيل. حاول مجددًا.')
            }
        }

        verify()
    }, [params, router])

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
                            <div className={`p-4 rounded-2xl transition-all duration-500 ${status === 'loading' ? 'bg-blue-100'
                                    : status === 'success' ? 'bg-green-100'
                                        : 'bg-red-100'
                                }`}>
                                {getStatusIcon()}
                            </div>
                        </div>

                        <h2 className={`text-2xl font-bold mb-3 transition-all duration-500 ${status === 'loading' ? 'text-gray-800'
                                : status === 'success' ? 'text-green-800'
                                    : 'text-red-800'
                            }`}>
                            {message}
                        </h2>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                            {status === 'loading' && 'نحن نعالج رابط التفعيل، من فضلك انتظر...'}
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
                                    onClick={() => router.push('/auth/login')}
                                    className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition font-medium"
                                >
                                    تسجيل الدخول
                                </button>
                                <button
                                    onClick={() => router.push('/auth/signup')}
                                    className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition font-medium"
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
                    </div>
                </div>
            </div>
        </div>
    )
}
