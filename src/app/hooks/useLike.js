// src/app/hooks/useLike.js
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabaseClient"
import toast from "react-hot-toast"

export function useLike(user) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleLike = async (postId, currentLikes, currentLikedState) => {
        if (!user) {
            toast.error("يجب تسجيل الدخول للإعجاب بالخواطر")
            router.push('/auth/login')
            return { success: false }
        }

        setIsLoading(true)
        try {
            const newLikedState = !currentLikedState
            const newLikesCount = newLikedState ? currentLikes + 1 : currentLikes - 1

            // العملية في جدول likes (سيتم تشغيل الـ trigger تلقائياً)
            if (newLikedState) {
                const { error } = await supabase
                    .from('likes')
                    .insert([{ user_id: user.id, post_id: postId }])
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('likes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('post_id', postId)
                if (error) throw error
            }

            // إرجاع النتيجة للتحديث الفوري في الواجهة
            return {
                success: true,
                newLikesCount,
                newLikedState
            }

        } catch (error) {
            toast.error("حدث خطأ أثناء تحديث الإعجاب")
            return {
                success: false,
                error: error.message
            }
        } finally {
            setIsLoading(false)
        }
    }

    return {
        handleLike,
        isLoading
    }
}