// src/app/components/PostsList.js
'use client'
import PostCard from "./PostCard"

export default function PostsList({
    posts,
    likedPosts,
    user,
    onLike,
    onPostDelete  // أضف هذا
}) {
    return (
        <div className="space-y-6">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={{
                        ...post,
                        user: post.profiles,
                        likes: post.likes_count || 0,
                        views_count: post.views_count || 0,
                        image: post.image_url
                    }}
                    onLike={onLike}
                    isLiked={likedPosts.has(post.id)}
                    user={user}
                    onPostDelete={onPostDelete} // وأضف هذا
                />
            ))}
        </div>
    )
}