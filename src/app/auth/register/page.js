'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MdWavingHand } from "react-icons/md"
import { FaCheck } from "react-icons/fa"
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

    const validateForm = () => {
        const newErrors = {}

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'الاسم الكامل مطلوب'
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
                        full_name: formData.fullName
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
                            profile_completed: false
                        }
                    ])

                if (profileError) {
                }
                toast.success('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.')
                router.push('/auth/login')
            }
        } catch (error) {
            if (error.message.includes('User already registered')) {
                setErrors({ email: 'هذا البريد الإلكتروني مسجل بالفعل' })
            } else {
                setErrors({ general: 'حدث خطأ أثناء إنشاء الحساب' })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-6">
            <div className="flex flex-col md:flex-row w-full max-w-5xl bg-gradient-to-br from-amber-50 to-amber-200 shadow-xl rounded-2xl overflow-hidden">
                {/* الصورة الجانبية */}
                <div className="hidden md:block md:w-1/2">
                    <Image
                        src="/svg/register.svg"
                        alt="Register illustration"
                        width={500}
                        height={500}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* نموذج التسجيل */}
                <div className="w-full md:w-1/2 p-8 space-y-8">
                    <div>
                        <h2 className="text-center text-3xl font-extrabold text-gray-800">
                            إنشاء حساب جديد
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-500 flex items-center justify-center gap-1">
                            <MdWavingHand className="text-gray-400 text-lg" /> أهلاً بك معنا!
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {errors.general}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                    الاسم الكامل
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-md border bg-amber-50 shadow-sm px-3 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:translate-y-1 transition duration-500 ${errors.fullName ? 'border-red-500' : 'border-transparent'
                                        }`}
                                    placeholder="الاسم بالكامل"
                                />
                                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    البريد الإلكتروني
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-md border bg-amber-50 shadow-sm px-3 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:translate-y-1 transition duration-500 ${errors.email ? 'border-red-500' : 'border-transparent'
                                        }`}
                                    placeholder="example@email.com"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    كلمة المرور
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-md border bg-amber-50 shadow-sm px-3 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:translate-y-1 transition duration-500 ${errors.password ? 'border-red-500' : 'border-transparent'
                                        }`}
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    تأكيد كلمة المرور
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-md border bg-amber-50 shadow-sm px-3 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:translate-y-1 transition duration-500 ${errors.confirmPassword ? 'border-red-500' : 'border-transparent'
                                        }`}
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        <label className="flex items-center justify-end gap-2 text-sm text-gray-700 cursor-pointer select-none">
                            <span>أوافق على الشروط والأحكام</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="peer appearance-none w-5 h-5 border border-gray-300 bg-amber-50 rounded-md checked:bg-amber-500 checked:border-amber-500 transition-all duration-200 cursor-pointer"
                                />
                                <FaCheck className="absolute inset-0 m-auto text-white text-[12px] opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" />
                            </div>
                        </label>
                        {errors.terms && <p className="text-red-500 text-sm text-right">{errors.terms}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-amber-500 text-white font-semibold rounded-md shadow hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    جاري إنشاء الحساب...
                                </>
                            ) : (
                                'إنشاء الحساب'
                            )}
                        </button>

                        <div className="text-center text-sm text-gray-600">
                            لديك حساب بالفعل؟{' '}
                            <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-medium transition">
                                تسجيل الدخول
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}