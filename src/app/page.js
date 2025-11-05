// src/app/page.js
'use client'
import { useState, useMemo } from "react"
import { usePosts } from "./hooks/usePosts"
import { useLike } from "./hooks/useLike"
import TopPost from "./top-post/page"
import Categories from "./categories/page"
import PostsLoading from "./components/PostsLoading"
import FilterBar from "./components/FilterBar"
import EmptyState from "./components/EmptyState"
import PostsList from "./components/PostsList"
import Layout from "./components/Layout"
import LoadingSpinner from "./components/Loading"
import { useAuth } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"

export default function HomePage() {
  const { user, loading } = useAuth()

  const {
    posts,
    isLoading,
    likedPosts,
    updatePostLikes,
    updateLikedPosts,
    deletePost
  } = usePosts(user)

  const { handleLike: likeAction, isLoading: likeLoading } = useLike(user)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  const handleLike = async (postId, currentLikes, currentLikedState) => {
    try {
      const result = await likeAction(postId, currentLikes, currentLikedState)

      if (result.success) {
        // تحديث الـ state مع البيانات الجديدة من السيرفر
        updateLikedPosts(postId, result.newLikedState)
        updatePostLikes(postId, result.newLikesCount)
      }

      return result
    } catch (error) {
      return { success: false }
    }
  }

  const handlePostDelete = (postId) => {
    deletePost(postId)
  }

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch =
        searchTerm === "" ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "" || post.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [posts, searchTerm, selectedCategory])

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
  }

  const categoriesProps = {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory
  }

  if (loading) {
    return <LoadingSpinner message="جاري التحقق من المصادقة..." />
  }

  return (
    <ProtectedRoute>
      <Layout
        leftSidebar={<TopPost />}
        rightSidebar={<Categories {...categoriesProps} />}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        filteredPosts={filteredPosts}
        totalPosts={posts.length}
        onResetFilters={resetFilters}
      >
        {isLoading ? (
          <PostsLoading />
        ) : (
          <>
            <FilterBar
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              filteredPosts={filteredPosts}
              totalPosts={posts.length}
              onResetFilters={resetFilters}
            />

            {filteredPosts.length === 0 ? (
              <EmptyState
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                user={user}
                onResetFilters={resetFilters}
              />
            ) : (
              <PostsList
                posts={filteredPosts}
                likedPosts={likedPosts}
                user={user}
                onLike={handleLike}
                onPostDelete={handlePostDelete}
              />
            )}
          </>
        )}
      </Layout>
    </ProtectedRoute>
  )
}