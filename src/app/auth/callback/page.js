'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import toast from 'react-hot-toast'
import { FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'

export default function AuthCallback() {
    const router = useRouter()
    const [status, setStatus] = useState('loading') // loading | success | error
    const [message, setMessage] = useState('جاري التحقق من حسابك...')
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error || !session) {
                    setStatus('error')
                    setMessage('فشل في التحقق من الجلسة')
                    toast.error('لم يتم العثور على جلسة صالحة. يرجى تسجيل الدخول مجددًا.')
                    return
                }

                const user = session.user
                if (!user) {
                    setStatus('error')
                    setMessage('لم يتم العثور على مستخدم.')
                    toast.error('يرجى تسجيل الدخول مرة أخرى.')
                    return
                }

                // جلب بيانات الملف الشخصي
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('full_name, phone_number, bio')
                    .eq('id', user.id)
                    .single()

                if (profileError) {
                    console.error('Profile fetch error:', profileError)
                    setStatus('error')
                    setMessage('حدث خطأ أثناء تحميل الملف الشخصي.')
                    toast.error('حدث خطأ أثناء تحميل بيانات الملف الشخصي.')
                    return
                }

                // تحقق من اكتمال البروفايل
                const isProfileComplete =
                    profile.full_name?.trim() &&
                    profile.phone_number?.trim() &&
                    profile.bio?.trim()

                if (isProfileComplete) {
                    setStatus('success')
                    setMessage('تم تفعيل الحساب بنجاح ✅')
                    toast.success('تم تفعيل الحساب بنجاح! سيتم تحويلك للصفحة الرئيسية...')
                    setTimeout(() => router.push('/'), 2500)
                } else {
                    setStatus('success')
                    setMessage('تم تفعيل الحساب! يرجى استكمال بياناتك 📋')
                    toast('تم تفعيل الحساب بنجاح، لكن يجب استكمال الملف الشخصي.', {
                        icon: '✏️',
                        style: { background: '#fff8e1', color: '#444' },
                    })
                    setTimeout(() => router.push('/complete-account'), 2500)
                }
            } catch (err) {
                console.error('Callback error:', err)
                setStatus('error')
                setMessage('حدث خطأ أثناء معالجة الطلب.')
                toast.error('حدث خطأ غير متوقع. حاول مرة أخرى.')
            }
        }

        handleAuthCallback()
    }, [router])

    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return 'border-green-400'
            case 'error':
                return 'border-red-400'
            default:
                return 'border-blue-400'
        }
    }

    const getStatusIcon = () => {
        switch (status) {
            case 'success':
                return <FaCheckCircle className="text-green-500 text-3xl" />
            case 'error':
                return <FaExclamationCircle className="text-red-500 text-3xl" />
            default:
                return <FaSpinner className="text-blue-500 text-3xl animate-spin" />
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <div className="w-full max-w-md mx-auto">
                <div
                    className={`relative overflow-hidden rounded-3xl shadow-2xl border-2 ${getStatusColor()} transition-all duration-500`}
                >
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full translate-x-1/2 translate-y-1/2"></div>
                    </div>

                    <div className="relative z-10 p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div
                                className={`p-4 rounded-2xl ${status === 'loading'
                                    ? 'bg-blue-100'
                                    : status === 'success'
                                        ? 'bg-green-100'
                                        : 'bg-red-100'
                                    }`}
                            >
                                {getStatusIcon()}
                            </div>
                        </div>

                        <h2
                            className={`text-2xl font-bold mb-3 ${status === 'loading'
                                ? 'text-gray-800'
                                : status === 'success'
                                    ? 'text-green-800'
                                    : 'text-red-800'
                                }`}
                        >
                            {message}
                        </h2>

                        <p className="text-gray-600 mb-6">
                            {status === 'loading' &&
                                (retryCount > 0
                                    ? 'نحاول إعادة الاتصال...'
                                    : 'جاري معالجة طلبك...')}
                            {status === 'success' && 'جاري توجيهك إلى المكان المناسب...'}
                            {status === 'error' &&
                                'يمكنك إعادة المحاولة أو تسجيل الدخول يدوياً.'}
                        </p>

                        {status === 'loading' && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
