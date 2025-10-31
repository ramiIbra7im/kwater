'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaBookmark, FaHeart, FaEye } from "react-icons/fa"
import { supabase } from "../../lib/supabaseClient"
import toast from "react-hot-toast"

export default function SavedPosts() {
    const router = useRouter()
    const [savedPosts, setSavedPosts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState(null)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/auth/login')
            return
        }
        setUser(user)
        fetchSavedPosts(user.id)
    }

    const fetchSavedPosts = async (userId) => {
        try {
            const { data: saved, error } = await supabase
                .from('saved_posts')
                .select(`
                    posts (
                        id,
                        content,
                        category,
                        image_url,
                        likes_count,
                        views_count,
                        created_at,
                        profiles:user_id (
                            full_name,
                            avatar_url
                        )
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error

            const posts = saved.map(item => item.posts).filter(Boolean)
            setSavedPosts(posts)
        } catch (error) {
        } finally {
            setIsLoading(false)
        }
    }

    const handleUnsave = async (postId) => {
        try {
            const { error } = await supabase
                .from('saved_posts')
                .delete()
                .eq('user_id', user.id)
                .eq('post_id', postId)

            if (error) throw error

            setSavedPosts(prev => prev.filter(post => post.id !== postId))
            toast.success("تم إزالة الخاطرة من المحفوظات")
        } catch (error) {
            toast.error("حدث خطأ أثناء إزالة الخاطرة")
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل المحفوظات...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-amber-100 rounded-2xl">
                            <FaBookmark className="text-amber-600 text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">الخواطر المحفوظة</h1>
                            <p className="text-gray-500">خواطرك المفضلة في مكان واحد</p>
                        </div>
                    </div>
                </div>

                {savedPosts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl shadow-lg">
                        <FaBookmark className="text-4xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد خواطر محفوظة</h3>
                        <p className="text-gray-500 mb-4">احفظ الخواطر التي تعجبك لتجدها هنا لاحقاً</p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-amber-500 text-white px-6 py-2 rounded-xl hover:bg-amber-600 transition"
                        >
                            استعرض الخواطر
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {savedPosts.map((post) => (
                            <div key={post.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-200 overflow-hidden">
                                            <img
                                                src={post.profiles?.avatar_url || "/default-avatar.png"}
                                                alt={post.profiles?.full_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{post.profiles?.full_name}</h3>
                                            <p className="text-sm text-gray-500">{post.category}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUnsave(post.id)}
                                        className="text-red-500 hover:text-red-600 transition"
                                    >
                                        إزالة
                                    </button>
                                </div>
                                <p className="text-gray-800 mb-4 text-right">{post.content}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <FaHeart className="text-red-400" />
                                        <span>{post.likes_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FaEye className="text-blue-400" />
                                        <span>{post.views_count || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}