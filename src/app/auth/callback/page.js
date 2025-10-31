'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { supabase } from "../../../lib/supabaseClient";

export default function CallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('جاري التحقق من الحساب...');

    useEffect(() => {
        const handleAuth = async () => {
            try {
                setStatus('loading');
                setMessage('جاري معالجة بيانات المصادقة...');

                // استخراج الـ token من الـ URL hash
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken) {
                    // تعيين الجلسة باستخدام الـ tokens
                    const { data: { session }, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });

                    if (error) {
                        throw error;
                    }

                    if (session?.user) {
                        setStatus('success');
                        setMessage('تم التحقق بنجاح! جاري توجيهك...');

                        // التحقق من حالة الملف الشخصي
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('profile_completed')
                            .eq('id', session.user.id)
                            .single();

                        setTimeout(() => {
                            if (profile && profile.profile_completed) {
                                router.push("/");
                            } else {
                                router.push("/complete-profile");
                            }
                        }, 2000);
                    } else {
                        throw new Error('No session found');
                    }
                } else {
                    throw new Error('No access token found');
                }

            } catch (error) {
                setStatus('error');
                setMessage('حدث خطأ في المصادقة');

                setTimeout(() => {
                    router.push("/auth/login");
                }, 3000);
            }
        };

        handleAuth();
    }, [router]);

    const getStatusIcon = () => {
        switch (status) {
            case 'loading':
                return <FaSpinner className="animate-spin text-3xl text-blue-500" />;
            case 'success':
                return <FaCheckCircle className="text-3xl text-green-500" />;
            case 'error':
                return <FaExclamationTriangle className="text-3xl text-red-500" />;
            default:
                return <FaSpinner className="animate-spin text-3xl text-blue-500" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'loading':
                return 'border-blue-200 bg-blue-50';
            case 'success':
                return 'border-green-200 bg-green-50';
            case 'error':
                return 'border-red-200 bg-red-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

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
                            {status === 'loading' && 'نحن نعالج بيانات المصادقة، من فضلك انتظر...'}
                            {status === 'success' && 'تمت المصادقة بنجاح! جاري توجيهك للصفحة المناسبة.'}
                            {status === 'error' && 'سيتم توجيهك إلى صفحة تسجيل الدخول.'}
                        </p>

                        {status === 'loading' && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"></div>
                            </div>
                        )}

                        {status === 'loading' && (
                            <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                                {[1, 2, 3].map((dot) => (
                                    <div
                                        key={dot}
                                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                        style={{ animationDelay: `${dot * 0.2}s` }}
                                    ></div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 p-4 bg-white/50 rounded-xl border border-white/80">
                            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                                <span className="text-xs">🔒</span>
                                بياناتك محمية ومشفرة بأعلى معايير الأمان
                            </p>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-tr-3xl"></div>
                </div>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                        إذا لم يتم التوجيه تلقائياً،{' '}
                        <button
                            onClick={() => router.push('/auth/login')}
                            className="text-blue-500 hover:text-blue-600 font-medium underline transition-colors"
                        >
                            انقر هنا
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}