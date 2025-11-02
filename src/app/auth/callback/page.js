'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { supabase } from "../../../lib/supabaseClient";

export default function VerifyEmailCallback() {
    const router = useRouter();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('جاري التحقق من رابط التفعيل...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // قراءة الـ code من query parameters
                const params = new URLSearchParams(window.location.search);
                const code = params.get('code');
                const error = params.get('error');
                const errorDescription = params.get('error_description');

                console.log('Callback params:', {
                    code: !!code,
                    error,
                    errorDescription
                });

                if (error) {
                    throw new Error(errorDescription || `خطأ في التفعيل: ${error}`);
                }

                if (!code) {
                    throw new Error('لم يتم العثور على كود التفعيل في الرابط.');
                }

                setStatus('loading');
                setMessage('جاري تفعيل حسابك...');

                // محاولة استرداد code_verifier من localStorage
                const codeVerifier = localStorage.getItem('supabase.code_verifier');

                if (!codeVerifier) {
                    console.warn('Code verifier not found in localStorage, trying without it...');
                }

                // استبدال الكود بـ session مع code_verifier
                const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

                if (exchangeError) {
                    console.error('Exchange error:', exchangeError);

                    // إذا فشلت المحاولة الأولى، نجرب طريقة بديلة
                    if (exchangeError.message.includes('code verifier')) {
                        throw new Error('فشل في التحقق من الرابط. يرجى محاولة تسجيل الدخول يدوياً.');
                    }
                    throw exchangeError;
                }

                if (!session) {
                    throw new Error('فشل في إنشاء الجلسة بعد التبادل.');
                }

                // تنظيف code_verifier من localStorage بعد الاستخدام الناجح
                localStorage.removeItem('supabase.code_verifier');

                setStatus('success');
                setMessage('تم تفعيل حسابك بنجاح! جاري التوجيه...');

                // إنشاء الملف الشخصي إذا لم يكن موجوداً
                try {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('profile_completed')
                        .eq('id', session.user.id)
                        .single();

                    if (profileError && profileError.code === 'PGRST116') {
                        // الملف الشخصي غير موجود، نقوم بإنشائه
                        const { error: insertError } = await supabase
                            .from('profiles')
                            .insert({
                                id: session.user.id,
                                email: session.user.email,
                                profile_completed: false,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            });

                        if (insertError) {
                            console.error('Error creating profile:', insertError);
                        }
                    }
                } catch (profileError) {
                    console.error('Profile check error:', profileError);
                }

                setTimeout(() => {
                    router.push("/Complete-account");
                }, 2000);

            } catch (error) {
                console.error('Verification error:', error);
                setStatus('error');
                setMessage(error.message || 'حدث خطأ أثناء التفعيل.');

                // تنظيف localStorage في حالة الخطأ
                localStorage.removeItem('supabase.code_verifier');
            }
        }

        handleCallback();
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
    );
}