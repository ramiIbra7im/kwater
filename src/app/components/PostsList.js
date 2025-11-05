// src/app/components/PostsList.js
'use client'
import PostCard from "./PostCard"

export default function PostsList({
    posts,
    likedPosts,
    user,
    onLike,
    onPostDelete
}) {
    return (
        <div className="space-y-6">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={{
                        ...post,
                        user: post.profiles,
                        likes_count: post.likes_count || 0,
                        views_count: post.views_count || 0,
                        image: post.image_url
                    }}
                    onLike={onLike} // تأكد من تمرير هذه الدالة
                    isLiked={likedPosts.has(post.id)}
                    user={user}
                    onPostDelete={onPostDelete}
                />
            ))}
        </div>
    )
}