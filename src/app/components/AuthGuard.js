// components/AuthGuard.js
'use client'
import { useRouter } from "next/navigation"
import { FaLock, FaSignInAlt } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"

export default function AuthGuard({ children }) {
    const router = useRouter()
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">جاري التحقق من المصادقة...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="flex justify-between gap-6 pt-6 px-4">
                    <div className="flex-1 max-w-2xl mx-auto">
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
                            <div className="text-6xl mb-4">
                                <FaLock className="mx-auto text-amber-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                يرجى تسجيل الدخول
                            </h3>
                            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                                يجب تسجيل الدخول لمشاهدة الخواطر والمشاركة في المجتمع
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => router.push('/auth/login')}
                                    className="bg-amber-500 text-white px-8 py-3 rounded-xl hover:bg-amber-600 transition font-medium flex items-center justify-center gap-2"
                                >
                                    <FaSignInAlt />
                                    تسجيل الدخول
                                </button>
                                <button
                                    onClick={() => router.push('/auth/register')}
                                    className="bg-white text-amber-500 border border-amber-500 px-8 py-3 rounded-xl hover:bg-amber-50 transition font-medium"
                                >
                                    إنشاء حساب جديد
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return children
}