'use client'
import { useState } from 'react'
import Link from 'next/link'
import { MdLogin, MdWavingHand } from "react-icons/md"
import { FaCheck, FaHeart, FaBrain, FaPrayingHands, FaSadTear, FaLaugh, FaLightbulb, FaFlag, FaEye, FaEyeSlash } from "react-icons/fa"
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
    const router = useRouter()
    const { signIn } = useAuth()

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [rememberMe, setRememberMe] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const { error } = await signIn(formData.email, formData.password)

        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
            } else if (error.message.includes('Email not confirmed')) {
                setError('يرجى تأكيد بريدك الإلكتروني أولاً')
            } else {
                setError('حدث خطأ أثناء تسجيل الدخول')
            }
        } else {
            toast.success('تم تسجيل الدخول بنجاح ')
            router.push('/')
        }

        setIsLoading(false)
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    // ألوان التصنيفات بنفس ألوان البوستات
    const categoryColors = [
        'from-pink-500 to-rose-500', // رومانسي
        'from-purple-500 to-indigo-500', // فلسفي
        'from-blue-500 to-cyan-500', // ديني
        'from-gray-500 to-rose-600', // حزين
        'from-orange-500 to-amber-500', // ساخر
        'from-green-500 to-emerald-500', // ملهم
        'from-red-500 to-orange-500' // وطني
    ]

    const categoryIcons = [
        <FaHeart className="text-sm" key="heart" />,
        <FaBrain className="text-sm" key="brain" />,
        <FaPrayingHands className="text-sm" key="pray" />,
        <FaSadTear className="text-sm" key="sad" />,
        <FaLaugh className="text-sm" key="laugh" />,
        <FaLightbulb className="text-sm" key="light" />,
        <FaFlag className="text-sm" key="flag" />
    ]

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-linear-to-br from-amber-50 to-orange-100 p-4 sm:p-6">
            <div className="w-full max-w-md">
                {/* كارت تسجيل الدخول */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* الهيدر مع التدرج اللوني */}
                    <div className="bg-linear-to-r from-amber-500 to-orange-500 p-6 sm:p-8 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>

                        {/* دوائر زخرفية */}
                        <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-10 -translate-y-10"></div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-8 translate-y-8"></div>

                        <div className="relative z-10 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30 flex items-center justify-center">
                                    <MdLogin className="text-2xl text-white" />
                                </div>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold mb-2 drop-shadow-sm">
                                مرحباً بعودتك!
                            </h1>
                            <p className="text-white/80 text-sm sm:text-base">
                                سجل الدخول لمتابعة خواطرك
                            </p>
                        </div>
                    </div>

                    {/* نموذج تسجيل الدخول */}
                    <div className="p-6 sm:p-8 space-y-6">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        البريد الإلكتروني
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-200 bg-amber-50/50 shadow-sm px-4 py-3 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 placeholder:text-gray-400"
                                        placeholder="example@email.com"
                                    />
                                </div>

                                <div className="relative">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        كلمة المرور
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-gray-200 bg-amber-50/50 shadow-sm px-4 py-3 pr-12 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 placeholder:text-gray-400"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors duration-200 p-1"
                                            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                                        >
                                            {showPassword ? (
                                                <FaEyeSlash className="text-lg" />
                                            ) : (
                                                <FaEye className="text-lg" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center justify-end gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="peer appearance-none w-5 h-5 border border-gray-300 bg-amber-50 rounded-md checked:bg-amber-500 checked:border-amber-500 transition-all duration-200 cursor-pointer"
                                        />
                                        <FaCheck className="absolute inset-0 m-auto text-white text-[12px] opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                    </div>
                                        <span>تذكرني</span>
                                </label>

                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                                >
                                    نسيت كلمة المرور؟
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-linear-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        جاري تسجيل الدخول...
                                    </>
                                ) : (
                                    'تسجيل الدخول'
                                )}
                            </button>

                            <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
                                ليس لديك حساب؟{' '}
                                <Link href="/auth/register" className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
                                    سجل الآن
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* فوتر زخرفي */}
                    <div className="h-2 bg-linear-to-r from-amber-200 via-orange-400 to-amber-500 opacity-60"></div>
                </div>

            </div>
        </div>
    )
}