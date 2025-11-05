'use client'
import { useState } from 'react'
import Link from 'next/link'
import { MdAppRegistration, MdOutlineAppRegistration, MdSignLanguage, MdWavingHand } from "react-icons/md"
import { FaCheck, FaHeart, FaBrain, FaPrayingHands, FaSadTear, FaLaugh, FaLightbulb, FaFlag, FaEye, FaEyeSlash, FaRegIdCard, FaRegistered, FaRegRegistered, FaUserPlus } from "react-icons/fa"
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function Register() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        // مسح الخطأ عند الكتابة
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            })
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword)
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'الاسم الكامل مطلوب'
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'الاسم يجب أن يكون على الأقل حرفين'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'البريد الإلكتروني مطلوب'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'البريد الإلكتروني غير صحيح'
        }

        if (!formData.password) {
            newErrors.password = 'كلمة المرور مطلوبة'
        } else if (formData.password.length < 6) {
            newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'كلمات المرور غير متطابقة'
        }

        if (!termsAccepted) {
            newErrors.terms = 'يجب الموافقة على الشروط والأحكام'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            // تسجيل المستخدم في Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        full_name: formData.fullName,
                    }
                }
            });

            if (authError) {
                throw authError
            }

            if (authData.user) {
                // إنشاء profile للمستخدم
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: authData.user.id,
                            full_name: formData.fullName,
                            email: formData.email,
                            profile_completed: false,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    ])

                if (profileError) {
                    console.error('Profile creation error:', profileError)
                }

                toast.success('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.')

                // الانتظار قليلاً قبل التوجيه
                setTimeout(() => {
                    router.push('/auth/login')
                }, 2000);
            }
        } catch (error) {
            console.error('Registration error:', error)
            if (error.message.includes('User already registered')) {
                setErrors({ email: 'هذا البريد الإلكتروني مسجل بالفعل' })
            } else if (error.message.includes('Email rate limit exceeded')) {
                setErrors({ general: 'تم إرسال العديد من الطلبات. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.' })
            } else {
                setErrors({ general: 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.' })
            }
        } finally {
            setIsLoading(false)
        }
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
        <div className=" flex items-center justify-center bg-linear-to-br from-amber-50 to-orange-100 p-4 sm:p-6">
            <div className="w-full max-w-md">
                {/* كارت التسجيل */}
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
                                    <FaUserPlus className="text-2xl text-white" />
                                </div>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold mb-2 drop-shadow-sm">
                                أهلاً بك معنا!
                            </h1>
                            <p className="text-white/80 text-sm sm:text-base">
                                أنشئ حسابك وابدأ رحلة الخواطر
                            </p>
                        </div>
                    </div>

                    {/* نموذج التسجيل */}
                    <div className="p-6 sm:p-8 space-y-6">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {errors.general && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
                                    {errors.general}
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* الاسم الكامل */}
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                        الاسم الكامل
                                    </label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border shadow-sm px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 transition-all duration-300 placeholder:text-gray-400 ${errors.fullName
                                            ? 'border-red-500 bg-red-50/50 focus:ring-red-200'
                                            : 'border-gray-200 bg-amber-50/50 focus:border-amber-500 focus:ring-amber-200'
                                            }`}
                                        placeholder="أدخل اسمك الكامل"
                                    />
                                    {errors.fullName && <p className="text-red-500 text-sm mt-1 mr-1">{errors.fullName}</p>}
                                </div>

                                {/* البريد الإلكتروني */}
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
                                        className={`w-full rounded-xl border shadow-sm px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 transition-all duration-300 placeholder:text-gray-400 ${errors.email
                                            ? 'border-red-500 bg-red-50/50 focus:ring-red-200'
                                            : 'border-gray-200 bg-amber-50/50 focus:border-amber-500 focus:ring-amber-200'
                                            }`}
                                        placeholder="example@email.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1 mr-1">{errors.email}</p>}
                                </div>

                                {/* كلمة المرور */}
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
                                            className={`w-full rounded-xl border shadow-sm px-4 py-3 pr-12 text-gray-900 focus:outline-none focus:ring-2 transition-all duration-300 placeholder:text-gray-400 ${errors.password
                                                ? 'border-red-500 bg-red-50/50 focus:ring-red-200'
                                                : 'border-gray-200 bg-amber-50/50 focus:border-amber-500 focus:ring-amber-200'
                                                }`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors duration-200  p-1"
                                            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                                        >
                                            {showPassword ? (
                                                <FaEyeSlash className="text-lg" />
                                            ) : (
                                                <FaEye className="text-lg" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-sm mt-1 mr-1">{errors.password}</p>}
                                </div>

                                {/* تأكيد كلمة المرور */}
                                <div className="relative">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        تأكيد كلمة المرور
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`w-full rounded-xl border shadow-sm px-4 py-3 pr-12 text-gray-900 focus:outline-none focus:ring-2 transition-all duration-300 placeholder:text-gray-400 ${errors.confirmPassword
                                                ? 'border-red-500 bg-red-50/50 focus:ring-red-200'
                                                : 'border-gray-200 bg-amber-50/50 focus:border-amber-500 focus:ring-amber-200'
                                                }`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleConfirmPasswordVisibility}
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:rounded-md p-1"
                                            aria-label={showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                                        >
                                            {showConfirmPassword ? (
                                                <FaEyeSlash className="text-lg" />
                                            ) : (
                                                <FaEye className="text-lg" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1 mr-1">{errors.confirmPassword}</p>}
                                </div>
                            </div>

                            {/* الشروط والأحكام */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center justify-end gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            className="peer appearance-none w-5 h-5 border border-gray-300 bg-amber-50 rounded-md checked:bg-amber-500 checked:border-amber-500 transition-all duration-200 cursor-pointer"
                                        />
                                        <FaCheck className="absolute inset-0 m-auto text-white text-[12px] opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                    </div>
                                    <span>أوافق على الشروط والأحكام</span>
                                </label>
                            </div>
                            {errors.terms && <p className="text-red-500 text-sm text-right mr-1">{errors.terms}</p>}

                            {/* زر التسجيل */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-linear-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        جاري إنشاء الحساب...
                                    </>
                                ) : (
                                    'إنشاء الحساب'
                                )}
                            </button>

                            {/* رابط تسجيل الدخول */}
                            <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
                                لديك حساب بالفعل؟{' '}
                                <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
                                    تسجيل الدخول
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* فوتر زخرفي */}
                    <div className="h-2 bg-linear-to-r from-amber-200 via-orange-200 to-amber-200 opacity-60"></div>
                </div>

                {/* عرض مصغر للتصنيفات */}

            </div>
        </div>
    )
}