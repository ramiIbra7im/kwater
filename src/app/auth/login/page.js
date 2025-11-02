'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MdWavingHand } from "react-icons/md"
import { FaCheck } from "react-icons/fa"
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
            toast.success('تم تسجيل الدخول بنجاح 🎉')
            router.push('/')
        }

        setIsLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-6">
            <div className="flex flex-col md:flex-row w-full max-w-5xl bg-gradient-to-br from-amber-50 to-amber-200 shadow-xl rounded-2xl overflow-hidden">
                {/* الصورة الجانبية */}
                <div className="hidden md:block md:w-1/2">
                    <Image
                        src="/svg/login.svg"
                        alt="Login illustration"
                        width={500}
                        height={500}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* نموذج تسجيل الدخول */}
                <div className="w-full md:w-1/2 p-8 space-y-8">
                    <div>
                        <h2 className="text-center text-3xl font-extrabold text-gray-800">
                            تسجيل الدخول لحسابك
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-500 flex items-center justify-center gap-1">
                            <MdWavingHand className="text-gray-400 text-lg" /> مرحباً بعودتك!
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
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
                                    className="mt-1 block w-full rounded-md border bg-amber-50 border-transparent shadow-sm px-3 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:translate-y-1 transition duration-500"
                                    placeholder="example@email.com"
                                />
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
                                    className="mt-1 block w-full rounded-md border bg-amber-50 border-transparent shadow-sm px-3 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:translate-y-1 transition duration-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center justify-end gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                <span>تذكرني</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="peer appearance-none w-5 h-5 border border-gray-300 bg-amber-50 rounded-md checked:bg-amber-500 checked:border-amber-500 transition-all duration-200 cursor-pointer"
                                    />
                                    <FaCheck className="absolute inset-0 m-auto text-white text-[12px] opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                </div>
                            </label>

                            <Link
                                href="/auth/forgot-password"
                                className="text-sm font-medium text-amber-600 hover:text-amber-700 transition"
                            >
                                نسيت كلمة المرور؟
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-amber-500 text-white font-semibold rounded-md shadow hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    جاري تسجيل الدخول...
                                </>
                            ) : (
                                'تسجيل الدخول'
                            )}
                        </button>

                        <div className="text-center text-sm text-gray-600">
                            ليس لديك حساب؟{' '}
                            <Link href="/auth/register" className="text-amber-600 hover:text-amber-700 font-medium transition">
                                سجل الآن
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
