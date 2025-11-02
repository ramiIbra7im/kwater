'use client'
import { useState, useMemo } from "react"
import { usePosts } from "./hooks/usePosts"
import SidebarRight from "./components/SidebarRight"
import SidebarLeft from "./components/SidebarLeft"
import PostsLoading from "./components/PostsLoading"
import FilterBar from "./components/FilterBar"
import EmptyState from "./components/EmptyState"
import PostsList from "./components/PostsList"
import Layout from "./components/Layout"
import LoadingSpinner from "./components/Loading"

// ✅ أضف هذا السطر 👇
import { useAuth } from "./context/AuthContext"

export default function HomePage() {
  // ✅ غير الاسم هنا كمان (الـ Context بيستخدم loading بدل isCheckingAuth)
  const { user, loading } = useAuth()

  const {
    posts,
    isLoading,
    likedPosts,
    updatePostLikes,
    updateLikedPosts,
    deletePost
  } = usePosts(user)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  const handleLike = async (postId, newLikesCount, newLikedState) => {
    try {
      updateLikedPosts(postId, newLikedState)
      updatePostLikes(postId, newLikesCount)
    } catch (error) { }
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

  // ✅ استخدم loading بدل isCheckingAuth
  if (loading) {
    return <LoadingSpinner message="جاري التحقق من المصادقة..." />
  }

  return (
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
  )
}
