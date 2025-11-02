'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { supabase } from "../../../lib/supabaseClient";

export default function VerifyEmailCallback() {
    const router = useRouter();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('جاري التحقق من رابط التفعيل...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // قراءة الـ hash fragment بدلاً من query string
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);

                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');
                const tokenType = params.get('token_type');
                const expiresIn = params.get('expires_in');
                const type = params.get('type');

                console.log('Callback params:', {
                    accessToken: !!accessToken,
                    refreshToken: !!refreshToken,
                    type
                });

                if (type === 'signup' || type === 'email_verification') {
                    setStatus('loading');
                    setMessage('جاري تفعيل حسابك...');

                    if (accessToken && refreshToken) {
                        // تسجيل الدخول تلقائي
                        const { data: { session }, error: sessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken
                        });

                        if (sessionError) {
                            console.error('Session error:', sessionError);
                            throw sessionError;
                        }

                        if (!session) {
                            throw new Error('فشل في إنشاء الجلسة');
                        }

                        setStatus('success');
                        setMessage('تم تفعيل حسابك بنجاح! جاري التوجيه...');

                        // التحقق من حالة الملف الشخصي
                        const { data: profile, error: profileError } = await supabase
                            .from('profiles')
                            .select('profile_completed')
                            .eq('id', session.user.id)
                            .single();

                        if (profileError) {
                            console.error('Profile error:', profileError);
                            // نستمر حتى لو كان هناك خطأ في الملف الشخصي
                        }

                        setTimeout(() => {
                            if (profile && profile.profile_completed) {
                                router.push("/");
                            } else {
                                router.push("/complete-profile");
                            }
                        }, 2000);
                    } else {
                        throw new Error('لم يتم العثور على توكن التفعيل.');
                    }
                } else {
                    throw new Error('رابط التفعيل غير صالح.');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setStatus('error');
                setMessage(error.message || 'حدث خطأ أثناء التفعيل.');
            }
        }

        // تأكد من أن الصفحة قد تم تحميلها بالكامل
        if (window.location.hash) {
            handleCallback();
        } else {
            setStatus('error');
            setMessage('رابط التفعيل غير صالح أو منقوص.');
        }
    }, [router]);

    const getStatusIcon = () => {
        switch (status) {
            case 'loading': return <FaSpinner className="animate-spin text-3xl text-blue-500" />;
            case 'success': return <FaCheckCircle className="text-3xl text-green-500" />;
            case 'error': return <FaExclamationTriangle className="text-3xl text-red-500" />;
            default: return <FaSpinner className="animate-spin text-3xl text-blue-500" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'loading': return 'border-blue-200 bg-blue-50';
            case 'success': return 'border-green-200 bg-green-50';
            case 'error': return 'border-red-200 bg-red-50';
            default: return 'border-gray-200 bg-gray-50';
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
                            <div className={`p-4 rounded-2xl transition-all duration-500 ${status === 'loading' ? 'bg-blue-100' : status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                                {getStatusIcon()}
                            </div>
                        </div>

                        <h2 className={`text-2xl font-bold mb-3 transition-all duration-500 ${status === 'loading' ? 'text-gray-800' : status === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                            {message}
                        </h2>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                            {status === 'loading' && 'نحن نعالج رابط التفعيل، من فضلك انتظر...'}
                            {status === 'success' && 'تم تفعيل حسابك! سيتم توجيهك للصفحة المناسبة.'}
                            {status === 'error' && 'يمكنك تسجيل الدخول يدوياً.'}
                        </p>

                        {status === 'loading' && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"></div>
                            </div>
                        )}

                        {status === 'loading' && (
                            <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                                {[1, 2, 3].map((dot) => (
                                    <div key={dot} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${dot * 0.2}s` }}></div>
                                ))}
                            </div>
                        )}

                        {status === 'error' && (
                            <button
                                onClick={() => router.push('/auth/login')}
                                className="mt-4 bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition font-medium"
                            >
                                تسجيل الدخول
                            </button>
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
    );
}