'use client'
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { FaHeart, FaRegHeart, FaShare, FaBookmark, FaRegBookmark, FaEye, FaArrowLeft, FaCalendar } from "react-icons/fa"
import { supabase } from "../../../lib/supabaseClient"
import toast from "react-hot-toast"

export default function PostPage() {
    const params = useParams()
    const router = useRouter()
    const postId = params.id
    const [post, setPost] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState(null)
    const [likes, setLikes] = useState(0)
    const [liked, setLiked] = useState(false)
    const [saved, setSaved] = useState(false)
    const [views, setViews] = useState(0)

    useEffect(() => {
        checkAuth()
        fetchPost()
    }, [postId])

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
    }

    const fetchPost = async () => {
        try {
            const { data: post, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (
                        full_name,
                        avatar_url,
                        bio
                    )
                `)
                .eq('id', postId)
                .single()

            if (error) throw error

            // if (!post) {
            //     router.push('/404')
            //     return
            // }

            setPost(post)
            setLikes(post.likes_count || 0)
            setViews(post.views_count || 0)

            // زيادة عدد المشاهدات
            await incrementViews(post.id)

            // التحقق من حالة الإعجاب والحفظ إذا كان المستخدم مسجل الدخول
            if (user) {
                checkIfLiked(post.id)
                checkIfSaved(post.id)
            }
        } catch (error) {
            router.push('/404')
        } finally {
            setIsLoading(false)
        }
    }

    const incrementViews = async (postId) => {
        try {
            const { error } = await supabase
                .from('posts')
                .update({
                    views_count: (post?.views_count || 0) + 1
                })
                .eq('id', postId)

            if (!error) {
                setViews(prev => prev + 1)
            }
        } catch (error) {
        }
    }

    const checkIfLiked = async (postId) => {
        try {
            const { data, error } = await supabase
                .from('likes')
                .select('id')
                .eq('user_id', user.id)
                .eq('post_id', postId)
                .single()

            if (data) {
                setLiked(true)
            }
        } catch (error) {
            setLiked(false)
        }
    }

    const checkIfSaved = async (postId) => {
        try {
            const { data, error } = await supabase
                .from('saved_posts')
                .select('id')
                .eq('user_id', user.id)
                .eq('post_id', postId)
                .single()

            if (data) {
                setSaved(true)
            }
        } catch (error) {
            setSaved(false)
        }
    }

    const handleLike = async () => {
        if (!user) {
            toast.error("يجب تسجيل الدخول للإعجاب بالخواطر")
            router.push('/auth/login')
            return
        }

        try {
            if (liked) {
                // إلغاء الإعجاب
                const { error } = await supabase
                    .from('likes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('post_id', postId)

                if (error) throw error

                setLiked(false)
                setLikes(prev => prev - 1)

                await supabase
                    .from('posts')
                    .update({ likes_count: likes - 1 })
                    .eq('id', postId)

            } else {
                // إضافة إعجاب
                const { error } = await supabase
                    .from('likes')
                    .insert([
                        {
                            user_id: user.id,
                            post_id: postId
                        }
                    ])

                if (error) throw error

                setLiked(true)
                setLikes(prev => prev + 1)

                await supabase
                    .from('posts')
                    .update({ likes_count: likes + 1 })
                    .eq('id', postId)
            }

        } catch (error) {
            toast.error("حدث خطأ أثناء تحديث الإعجاب")
        }
    }

    const handleSave = async () => {
        if (!user) {
            toast.error("يجب تسجيل الدخول لحفظ الخواطر")
            return
        }

        try {
            if (saved) {
                // إلغاء الحفظ
                const { error } = await supabase
                    .from('saved_posts')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('post_id', postId)

                if (error) throw error

                setSaved(false)
                toast.success("تم إزالة الخاطرة من المحفوظات")

            } else {
                // حفظ الخاطرة
                const { error } = await supabase
                    .from('saved_posts')
                    .insert([
                        {
                            user_id: user.id,
                            post_id: postId
                        }
                    ])

                if (error) throw error

                setSaved(true)
                toast.success("تم حفظ الخاطرة بنجاح")
            }

        } catch (error) {
            toast.error("حدث خطأ أثناء حفظ الخاطرة")
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-EG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const getCategoryColor = (category) => {
        const colors = {
            'رومانسي': 'from-pink-500 to-rose-500',
            'فلسفي': 'from-purple-500 to-indigo-500',
            'ديني': 'from-blue-500 to-cyan-500',
            'حزين': 'from-gray-500 to-slate-600',
            'ساخر': 'from-orange-500 to-amber-500',
            'ملهم': 'from-green-500 to-emerald-500',
            'وطني': 'from-red-500 to-orange-500'
        };
        return colors[category] || 'from-amber-500 to-orange-500';
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل الخاطرة...</p>
                </div>
            </div>
        )
    }



    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* زر العودة */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition mb-6"
                >
                    <FaArrowLeft />
                    <span>العودة</span>
                </button>

                {/* بطاقة الخاطرة */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* الهيدر */}
                    <div className={`bg-linear-to-r ${getCategoryColor(post.category)} p-8 text-white relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl border-4 border-white/30 bg-white/20 backdrop-blur-sm overflow-hidden shadow-lg">
                                        <Image
                                            src={post.profiles?.avatar_url || "/default-avatar.png"}
                                            alt={post.profiles?.full_name || "مستخدم"}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <h1 className="text-2xl font-bold text-white drop-shadow-sm">
                                            {post.profiles?.full_name || "مستخدم مجهول"}
                                        </h1>
                                        <div className="flex items-center gap-3 text-white/90 text-sm mt-1">
                                            <div className="flex items-center gap-1">
                                                <FaCalendar />
                                                <span>{formatDate(post.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* زر الحفظ */}
                                <button
                                    onClick={handleSave}
                                    className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition-all duration-200 backdrop-blur-sm hover:scale-110"
                                >
                                    {saved ? (
                                        <FaBookmark className="text-white text-xl" />
                                    ) : (
                                        <FaRegBookmark className="text-white text-xl" />
                                    )}
                                </button>
                            </div>

                            {/* التصنيف */}
                            {post.category && (
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/30">
                                    <span className="font-medium text-white">{post.category}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* محتوى الخاطرة */}
                    <div className="p-8">
                        <div className="prose prose-lg max-w-none text-right">
                            <p className="text-gray-800 leading-relaxed text-xl whitespace-pre-line mb-8">
                                {post.content}
                            </p>

                            {/* صورة الخاطرة */}
                            {post.image_url && (
                                <div className="mt-6 rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
                                    <Image
                                        src={post.image_url}
                                        alt="صورة الخاطرة"
                                        width={800}
                                        height={500}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        {/* الإحصائيات */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-6 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center gap-2 transition ${liked ? "text-red-500" : "hover:text-red-400"}`}
                                    >
                                        {liked ? (
                                            <FaHeart className="text-red-500 text-xl" />
                                        ) : (
                                            <FaRegHeart className="text-xl" />
                                        )}
                                        <span className="font-medium text-lg">{likes}</span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaEye className="text-blue-500 text-xl" />
                                    <span className="font-medium text-lg">{views}</span>
                                </div>
                            </div>

                            <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition">
                                <FaShare className="text-xl" />
                                <span className="font-medium">مشاركة</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* معلومات الكاتب */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">عن الكاتب</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-200 overflow-hidden border-2 border-amber-200">
                            <Image
                                src={post.profiles?.avatar_url || "/default-avatar.png"}
                                alt={post.profiles?.full_name || "مستخدم"}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">
                                {post.profiles?.full_name || "مستخدم مجهول"}
                            </h4>
                            <p className="text-gray-600 mt-1">
                                {post.profiles?.bio || "كاتب في منصة خاطرتي"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}