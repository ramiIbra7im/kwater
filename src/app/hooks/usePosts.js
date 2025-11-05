// src/app/hooks/usePosts.js
import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabaseClient"

export function usePosts(user) {
    const [posts, setPosts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [likedPosts, setLikedPosts] = useState(new Set())

    useEffect(() => {
        fetchPosts()
        if (user) {
            fetchLikedPosts(user.id)
        }
    }, [user])

    const fetchPosts = async () => {
        try {
            setIsLoading(true)
            const { data: posts, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        full_name,
                        avatar_url,
                        is_owner
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setPosts(posts || [])
        } catch (error) {
        } finally {
            setIsLoading(false)
        }
    }

    const fetchLikedPosts = async (userId) => {
        try {
            const { data: likes, error } = await supabase
                .from('likes')
                .select('post_id')
                .eq('user_id', userId)

            if (error) throw error
            const likedPostIds = new Set(likes?.map(like => like.post_id) || [])
            setLikedPosts(likedPostIds)
        } catch (error) {
        }
    }

    const updatePostLikes = (postId, newLikesCount) => {
        setPosts(prev => prev.map(post =>
            post.id === postId
                ? { ...post, likes_count: newLikesCount }
                : post
        ))
    }

    const updateLikedPosts = (postId, isLiked) => {
        setLikedPosts(prev => {
            const newSet = new Set(prev)
            if (isLiked) {
                newSet.add(postId)
            } else {
                newSet.delete(postId)
            }
            return newSet
        })
    }

    const deletePost = async (postId) => {
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId)

            if (error) throw error

            setPosts(prev => prev.filter(post => post.id !== postId))
            setLikedPosts(prev => {
                const newSet = new Set(prev)
                newSet.delete(postId)
                return newSet
            })

            return { success: true }
        } catch (error) {
            return { success: false, error }
        }
    }

    return {
        posts,
        isLoading,
        likedPosts,
        updatePostLikes,
        updateLikedPosts,
        deletePost,
        refetchPosts: fetchPosts
    }
}