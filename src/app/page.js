// src/app/page.js
'use client'
import { useState, useMemo } from "react"
import { useAuth } from "./hooks/useAuth"
import { usePosts } from "./hooks/usePosts"
import SidebarRight from "./components/SidebarRight"
import SidebarLeft from "./components/SidebarLeft"
import PostsLoading from "./components/PostsLoading"
import AuthGuard from "./components/AuthGuard"
import FilterBar from "./components/FilterBar"
import EmptyState from "./components/EmptyState"
import PostsList from "./components/PostsList"
import Layout from "./components/Layout"
import LoadingSpinner from "./components/Loading"

export default function HomePage() {
  const { user, isCheckingAuth } = useAuth()
  const {
    posts,
    isLoading,
    likedPosts,
    updatePostLikes,
    updateLikedPosts,
    deletePost // استخدم الدالة الجديدة من usePosts
  } = usePosts(user)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  // دالة handleLike
  const handleLike = async (postId, newLikesCount, newLikedState) => {
    try {
      updateLikedPosts(postId, newLikedState)
      updatePostLikes(postId, newLikesCount)
    } catch (error) {
    }
  }

  // دالة حذف البوست - استخدم deletePost من usePosts
  const handlePostDelete = (postId) => {
    deletePost(postId) // استدعاء الدالة من usePosts
  }

  // تصفية الخواطر
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = searchTerm === "" ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "" || post.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [posts, searchTerm, selectedCategory])

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
  }

  // حالة التحميل
  if (isCheckingAuth) {
    return <LoadingSpinner message="جاري التحقق من المصادقة..." />
  }

  return (
    <AuthGuard user={user}>
      <Layout
        leftSidebar={
          <SidebarLeft
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        }
        rightSidebar={<SidebarRight />}
      >
        {/* حالة التحميل */}
        {isLoading ? (
          <PostsLoading />
        ) : (
          <>
            {/* شريط الفلاتر */}
            <FilterBar
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              filteredPosts={filteredPosts}
              totalPosts={posts.length}
              onResetFilters={resetFilters}
            />

            {/* عرض الخواطر */}
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
    </AuthGuard>
  )
}