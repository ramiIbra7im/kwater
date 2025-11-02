'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext"; // اتأكد من مسار الـ context
import { supabase } from "../../../lib/supabaseClient";

export default function VerifyEmailCallback() {
    const router = useRouter();
    const { setUser } = useAuth(); // نحتاج تحديث حالة المستخدم
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('جاري التحقق من رابط التفعيل...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const code = params.get('code');
                if (!code) throw new Error('رابط التفعيل غير صالح.');

                setStatus('loading');
                setMessage('جاري تفعيل حسابك...');

                // ✅ استبدال code بـ session
                const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) throw error;

                setUser(data.session.user); // تحديث حالة المستخدم في AuthContext
                setStatus('success');
                setMessage('تم تفعيل حسابك بنجاح! جاري التوجيه...');

                // التحقق من حالة الملف الشخصي
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('profile_completed')
                    .eq('id', data.session.user.id)
                    .single();

                setTimeout(() => {
                    if (profile && profile.profile_completed) {
                        router.push("/");
                    } else {
                        router.push("/complete-profile");
                    }
                }, 2000);

            } catch (error) {
                console.error(error);
                setStatus('error');
                setMessage(error.message || 'حدث خطأ أثناء التفعيل.');
            }
        }

        handleCallback();
    }, [router, setUser]);

    const getStatusIcon = () => {
        switch (status) {
            case 'loading': return <FaSpinner className="animate-spin text-3xl text-blue-500" />;
            case 'success': return <FaCheckCircle className="text-3xl text-green-500" />;
            case 'error': return <FaExclamationTriangle className="text-3xl text-red-500" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'loading': return 'border-blue-200 bg-blue-50';
            case 'success': return 'border-green-200 bg-green-50';
            case 'error': return 'border-red-200 bg-red-50';
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

                        {status === 'error' && (
                            <button
                                onClick={() => router.push('/auth/login')}
                                className="mt-4 bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition font-medium"
                            >
                                تسجيل الدخول
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
