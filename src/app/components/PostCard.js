// src/app/components/PostCard.js
'use client'
import Image from "next/image";
import {
    FaHeart, FaRegHeart, FaShare, FaBookmark, FaRegBookmark, FaEye,
    FaBrain, FaPrayingHands, FaSadTear, FaLaugh, FaLightbulb, FaFlag
} from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import ShareModal from "./ShareModal"
import PostActions from "./PostActions"
import OwnerBadge from "./OwnerBadge"
import toast from "react-hot-toast";

export default function PostCard({ post, onLike, isLiked = false, user, onPostDelete }) {
    const [likes, setLikes] = useState(post.likes_count || 0);
    const [liked, setLiked] = useState(isLiked);
    const [saved, setSaved] = useState(false);
    const [views, setViews] = useState(post.views_count || 0);
    const [isLoading, setIsLoading] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const isSiteOwner = user?.is_owner

    // Refs لتتبع حالة المشاهدة
    const hasBeenViewed = useRef(false);
    const cardRef = useRef(null);

    // تحديث الحالة عندما يتغير isLied prop
    useEffect(() => {
        setLiked(isLiked);
    }, [isLiked]);

    // تحديث عدد الإعجابات عندما يتغير من الـ parent
    useEffect(() => {
        setLikes(post.likes_count || 0);
    }, [post.likes_count]);

    // جلب حالة الحفظ عند تحميل الكومبوننت
    useEffect(() => {
        if (user) {
            checkIfSaved();
        }
    }, [user, post.id]);

    // Intersection Observer لزيادة المشاهدات عندما يظهر البوست في الشاشة
    useEffect(() => {
        if (!cardRef.current || hasBeenViewed.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasBeenViewed.current) {
                        incrementViews();
                        hasBeenViewed.current = true;
                        observer.disconnect();
                    }
                });
            },
            {
                threshold: 0.5,
                rootMargin: '0px 0px -100px 0px'
            }
        );

        observer.observe(cardRef.current);
        return () => {
            if (cardRef.current) {
                observer.unobserve(cardRef.current);
            }
        };
    }, [post.id]);

    // زيادة عدد المشاهدات
    const incrementViews = async () => {
        try {
            const sessionId = await getSessionId();
            const hasViewed = await checkIfViewed(sessionId, post.id);

            if (!hasViewed) {
                const { error } = await supabase
                    .from('posts')
                    .update({
                        views_count: (post.views_count || 0) + 1
                    })
                    .eq('id', post.id);

                if (!error) {
                    setViews(prev => prev + 1);
                    await recordView(sessionId, post.id);
                }
            }
        } catch (error) {
        }
    };

    // إنشاء معرف فريد للجلسة/الجهاز
    const getSessionId = async () => {
        let sessionId = localStorage.getItem('khateraty_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('khateraty_session_id', sessionId);
        }
        return sessionId;
    };

    // التحقق إذا كان البوست قد شوهد من قبل في هذه الجلسة
    const checkIfViewed = async (sessionId, postId) => {
        try {
            const viewedPosts = JSON.parse(localStorage.getItem('khateraty_viewed_posts') || '{}');
            return viewedPosts[postId] === sessionId;
        } catch (error) {
            return false;
        }
    };

    // تسجيل المشاهدة لمنع الزيادة مرة أخرى
    const recordView = async (sessionId, postId) => {
        try {
            const viewedPosts = JSON.parse(localStorage.getItem('khateraty_viewed_posts') || '{}');
            viewedPosts[postId] = sessionId;
            localStorage.setItem('khateraty_viewed_posts', JSON.stringify(viewedPosts));
        } catch (error) {
        }
    };

    // التحقق إذا كانت الخاطرة محفوظة
    const checkIfSaved = async () => {
        try {
            const { data, error } = await supabase
                .from('saved_posts')
                .select('id')
                .eq('user_id', user.id)
                .eq('post_id', post.id)
                .single();

            if (data) {
                setSaved(true);
            }
        } catch (error) {
            setSaved(false);
        }
    };

    // التعامل مع الإعجاب
    const handleLike = async () => {
        if (!user) {
            toast.error("يجب تسجيل الدخول للإعجاب بالخواطر");
            return;
        }

        setIsLoading(true);
        try {
            const newLikedState = !liked;
            const newLikesCount = newLikedState ? likes + 1 : likes - 1;

            if (newLikedState) {
                const { error } = await supabase
                    .from('likes')
                    .insert([{ user_id: user.id, post_id: post.id }]);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('likes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('post_id', post.id);
                if (error) throw error;
            }

            setLiked(newLikedState);
            setLikes(newLikesCount);

            await supabase
                .from('posts')
                .update({ likes_count: newLikesCount })
                .eq('id', post.id);

            if (onLike) {
                onLike(post.id, newLikesCount, newLikedState);
            }

        } catch (error) {
            toast.error("حدث خطأ أثناء تحديث الإعجاب");
            setLiked(!liked);
            setLikes(likes);
        } finally {
            setIsLoading(false);
        }
    };

    // التعامل مع الحفظ
    const handleSave = async () => {
        if (!user) {
            toast.error("يجب تسجيل الدخول لحفظ الخواطر");
            return;
        }

        setIsLoading(true);
        try {
            if (saved) {
                const { error } = await supabase
                    .from('saved_posts')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('post_id', post.id);

                if (error) throw error;
                setSaved(false);
            } else {
                const { error } = await supabase
                    .from('saved_posts')
                    .insert([{ user_id: user.id, post_id: post.id }]);

                if (error) throw error;
                setSaved(true);
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء حفظ الخاطرة");
        } finally {
            setIsLoading(false);
        }
    };

    // التعامل مع حذف البوست
    const handlePostDelete = (postId) => {
        if (onPostDelete) {
            onPostDelete(postId);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-EG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getCategoryColor = (category) => {
        const colors = {
            'رومانسي': 'bg-gradient-to-r from-pink-500 to-rose-500',
            'فلسفي': 'bg-gradient-to-r from-purple-500 to-indigo-500',
            'ديني': 'bg-gradient-to-r from-blue-500 to-cyan-500',
            'حزين': 'bg-gradient-to-r from-gray-500 to-rose-600',
            'ساخر': 'bg-gradient-to-r from-orange-500 to-amber-500',
            'ملهم': 'bg-gradient-to-r from-green-500 to-emerald-500',
            'وطني': 'bg-gradient-to-r from-red-500 to-orange-500'
        };
        return colors[category] || 'bg-gradient-to-r from-amber-500 to-orange-500';
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'رومانسي': <FaHeart className="text-sm" />,
            'فلسفي': <FaBrain className="text-sm" />,
            'ديني': <FaPrayingHands className="text-sm" />,
            'حزين': <FaSadTear className="text-sm" />,
            'ساخر': <FaLaugh className="text-sm" />,
            'ملهم': <FaLightbulb className="text-sm" />,
            'وطني': <FaFlag className="text-sm" />
        };
        return icons[category] || <FaLightbulb className="text-sm text-gray-400" />;
    };

    return (
        <div
            ref={cardRef}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-1"
        >
            {/* الهيدر مع التدرج اللوني */}
            <div className={`${getCategoryColor(post.category)} p-6 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>

                <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-10 -translate-y-10"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-8 translate-y-8"></div>

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl border-2 border-white/40 bg-white/20 backdrop-blur-sm overflow-hidden shadow-lg">
                                    <Image
                                        src={post.user?.avatar_url || "/default-avatar.png"}
                                        alt={post.user?.full_name || "مستخدم"}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-lg"></div>
                            </div>
                            <div className="flex flex-col">
                                {/* التعديل هنا فقط - أضف علامة صاحب الموقع */}
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-white drop-shadow-sm text-base">
                                        {post.user?.full_name || "مستخدم مجهول"}
                                    </h3>
                                    {post.user?.is_owner && <OwnerBadge />}
                                </div>
                                <div className="flex items-center gap-2 text-white/80 text-xs">
                                    <span>📅 {formatDate(post.created_at)}</span>
                                </div>
                            </div>
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex items-center gap-2">
                            <PostActions
                                post={post}
                                user={user}
                                onPostDelete={handlePostDelete}
                            />

                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-200 backdrop-blur-sm hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saved ? (
                                    <FaBookmark className="text-white text-sm" />
                                ) : (
                                    <FaRegBookmark className="text-white text-sm" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* التصنيف */}
                    {post.category && (
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-xl border border-white/30">
                            <span className="text-sm">{getCategoryIcon(post.category)}</span>
                            <span className="font-medium text-white text-xs">{post.category}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* محتوى الخاطرة */}
            <div className="p-6 relative">
                <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-br-2xl opacity-40"></div>

                <div className="relative z-10">
                    <p className="text-gray-800 leading-relaxed text-base font-normal whitespace-pre-line mb-4 text-right">
                        {post.content}
                    </p>

                    {/* صورة الخاطرة */}
                    {post.image && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                            <Image
                                src={post.image}
                                alt="صورة الخاطرة"
                                width={600}
                                height={400}
                                className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* الإحصائيات */}
            <div className="px-6 pb-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                            <FaHeart className="text-amber-500 text-xs" />
                            <span className="font-medium text-amber-700 text-xs">{likes}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                            <FaEye className="text-gray-500 text-xs" />
                            <span className="font-medium text-gray-700 text-xs">{views}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* أزرار التفاعل */}
            <div className="px-6 pb-4">
                <div className="flex items-center gap-2 rounded-xl p-1">
                    <button
                        onClick={handleLike}
                        disabled={isLoading}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 ${liked
                            ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md transform -translate-y-0.5"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : liked ? (
                            <>
                                <FaHeart className="text-white text-sm" />
                                <span className="font-medium text-sm">معجب</span>
                            </>
                        ) : (
                            <>
                                <FaRegHeart className="text-gray-500 text-sm" />
                                <span className="font-medium text-sm">إعجاب</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => setShowShareModal(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-300"
                    >
                        <FaShare className="text-gray-500 text-sm" />
                        <span className="font-medium text-sm">مشاركة</span>
                    </button>
                </div>
            </div>

            {/* خط زخرفي في الأسفل */}
            <div className="h-1 bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200 opacity-60"></div>

            {/* مودال المشاركة */}
            <ShareModal
                post={post}
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
            />
        </div>
    );
}