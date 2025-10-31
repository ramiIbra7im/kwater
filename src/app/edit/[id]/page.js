// src/app/edit/[id]/page.js
'use client'
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"
import { FaArrowRight, FaImage, FaTimes } from "react-icons/fa"
import toast from "react-hot-toast"

export default function EditPost() {
    const router = useRouter()
    const params = useParams()
    const postId = params.id

    const [post, setPost] = useState(null)
    const [content, setContent] = useState("")
    const [category, setCategory] = useState("")
    const [image, setImage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState(null)

    const categories = [
        { value: "رومانسي", label: "رومانسي 💖" },
        { value: "فلسفي", label: "فلسفي 🤔" },
        { value: "ديني", label: "ديني 🙏" },
        { value: "حزين", label: "حزين 😢" },
        { value: "ساخر", label: "ساخر 😄" },
        { value: "ملهم", label: "ملهم ✨" },
        { value: "وطني", label: "وطني 🇪🇬" }
    ]

    useEffect(() => {
        checkAuth()
        fetchPost()
    }, [postId])

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (!user) {
            router.push('/auth/login')
        }
    }

    const fetchPost = async () => {
        try {
            const { data: post, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', postId)
                .single()

            if (error) throw error

            // التحقق إذا كان المستخدم هو صاحب البوست
            if (user && post.user_id !== user.id) {
                toast.success("ليس لديك صلاحية لتعديل هذه الخاطرة")
                router.push('/')
                return
            }

            setPost(post)
            setContent(post.content)
            setCategory(post.category)
            setImage(post.image_url || "")

        } catch (error) {
            toast.error("حدث خطأ أثناء تحميل الخاطرة")
            router.push('/')
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()

        if (!content.trim()) {
            toast.warnn("يرجى كتابة الخاطرة")
            return
        }

        if (!category) {
            toast.error("يرجى اختيار تصنيف للخاطرة")
            return
        }

        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('posts')
                .update({
                    content: content.trim(),
                    category,
                    image_url: image || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', postId)

            if (error) throw error

            toast.success("تم تحديث الخاطرة بنجاح")
            router.push('/')

        } catch (error) {
            toast.error("حدث خطأ أثناء تحديث الخاطرة")
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // يمكنك إضافة منطق رفع الصور إلى Supabase Storage هنا
        // حالياً سنستخدم رابط خارجي للصورة
        setImage(URL.createObjectURL(file))
    }

    const removeImage = () => {
        setImage("")
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل الخاطرة...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* الهيدر */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">تعديل الخاطرة</h1>
                        <button
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* نموذج التعديل */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleUpdate} className="space-y-6">
                        {/* نص الخاطرة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الخاطرة *
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="اكتب خاطرة جميلة..."
                                className="w-full h-48 p-4 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                {content.length} حرف
                            </p>
                        </div>

                        {/* التصنيف */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                التصنيف *
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                                required
                            >
                                <option value="">اختر تصنيفاً</option>
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* الصورة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                صورة الخاطرة (اختياري)
                            </label>
                            {image ? (
                                <div className="relative">
                                    <img
                                        src={image}
                                        alt="صورة الخاطرة"
                                        className="w-full h-48 object-cover rounded-2xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-amber-500 transition">
                                    <FaImage className="text-gray-400 text-2xl mr-2" />
                                    <span className="text-gray-500">اختر صورة</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* أزرار */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition font-medium"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 py-3 px-6 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        جاري التحديث...
                                    </>
                                ) : (
                                    <>
                                        <FaArrowRight />
                                        تحديث الخاطرة
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}