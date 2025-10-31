'use client';
import { FaFire, FaHeart, FaEye, FaChartLine, FaRegClock } from "react-icons/fa";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function SidebarLeft() {
    const [topPosts, setTopPosts] = useState([]);
    const [stats, setStats] = useState({
        dailyActivity: 0,
        newPosts: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTopPosts();
        fetchStats();
    }, []);

    const fetchTopPosts = async () => {
        try {
            // جلب أفضل 5 خواطر حسب عدد الإعجابات
            const { data: posts, error } = await supabase
                .from('posts')
                .select(`
                    id,
                    content,
                    likes_count,
                    views_count,
                    created_at,
                    profiles:user_id (
                        full_name
                    )
                `)
                .order('likes_count', { ascending: false })
                .limit(5); // غيرت من 4 إلى 5

            if (error) throw error;

            const formattedPosts = posts?.map((post, index) => ({
                id: post.id,
                title: post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content,
                likes: post.likes_count || 0,
                views: post.views_count || 0,
                author: post.profiles?.full_name || 'مستخدم مجهول',
                created_at: post.created_at
            })) || [];

            setTopPosts(formattedPosts);
        } catch (error) {
            // بيانات افتراضية في حالة الخطأ
            setTopPosts([
                {
                    id: 1,
                    title: "الحياة رحلة جميلة 🌿",
                    likes: 0,
                    views: 0,
                    author: "مستخدم"
                },
                {
                    id: 2,
                    title: "كن إيجابياً في حياتك",
                    likes: 0,
                    views: 0,
                    author: "مستخدم"
                },
                {
                    id: 3,
                    title: "الابتسامة صدقة 💖",
                    likes: 0,
                    views: 0,
                    author: "مستخدم"
                },
                {
                    id: 4,
                    title: "الحب أجمل شعور ❤️",
                    likes: 0,
                    views: 0,
                    author: "مستخدم"
                },
                {
                    id: 5,
                    title: "الأمل نور في الظلام ✨",
                    likes: 0,
                    views: 0,
                    author: "مستخدم"
                }
            ]);
        }
    };

    const fetchStats = async () => {
        try {
            // عدد الخواطر في آخر 24 ساعة
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const { count: dailyPosts, error: dailyError } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', yesterday.toISOString());

            if (dailyError) throw dailyError;

            // عدد الخواطر الجديدة في الأسبوع
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);

            const { count: weeklyPosts, error: weeklyError } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', lastWeek.toISOString());

            if (weeklyError) throw weeklyError;

            setStats({
                dailyActivity: dailyPosts || 0,
                newPosts: weeklyPosts || 0
            });
        } catch (error) {
            setStats({
                dailyActivity: 0,
                newPosts: 0
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num;
    };

    if (isLoading) {
        return (
            <aside className="hidden xl:block w-80 shrink-0 h-[calc(100vh-80px)] sticky top-[80px] bg-gradient-to-b from-white to-amber-50/30 shadow-xl rounded-3xl p-6 overflow-y-auto border border-amber-100">
                {/* تحميل الأكثر إعجابًا */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                            <FaFire className="text-white text-lg" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                الأكثر إعجابًا
                            </h2>
                            <p className="text-sm text-gray-500">جاري التحميل...</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => ( // غيرت من 3 إلى 5
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* تحميل الإحصائيات */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 animate-pulse">
                                <div className="w-6 h-6 bg-gray-200 rounded mx-auto mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mt-1"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <aside className="hidden xl:block w-80 shrink-0 h-[calc(100vh-80px)] sticky top-[80px] bg-gradient-to-b from-white to-amber-50/30 shadow-xl rounded-3xl p-6 overflow-y-auto border border-amber-100">
            {/* الأكثر إعجابًا */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                        <FaFire className="text-white text-lg" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            الأكثر إعجابًا
                        </h2>
                        <p className="text-sm text-gray-500">أفضل  خواطر متفاعلة</p> {/* عدلت النص */}
                    </div>
                </div>

                <ul className="space-y-4">
                    {topPosts.map((post, index) => (
                        <li key={post.id}>
                            <Link
                                href={`/post/${post.id}`}
                                className="group block cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:border-amber-200 transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg mt-1 ${index === 0 ? 'bg-yellow-100 border border-yellow-200' :
                                            index === 1 ? 'bg-gray-100 border border-gray-200' :
                                                index === 2 ? 'bg-amber-100 border border-amber-200' :
                                                    'bg-blue-50 border border-blue-100'
                                            }`}>
                                            <span className={`text-sm font-bold ${index === 0 ? 'text-yellow-600' :
                                                index === 1 ? 'text-gray-600' :
                                                    index === 2 ? 'text-amber-600' :
                                                        'text-blue-600'
                                                }`}>
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-800 font-medium leading-relaxed mb-2 text-sm">
                                                {post.title}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <FaHeart className="text-red-400" />
                                                    <span>{formatNumber(post.likes)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FaEye className="text-blue-400" />
                                                    <span>{formatNumber(post.views)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* الإحصائيات السريعة */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <FaRegClock className="text-blue-500 mx-auto mb-1 text-lg" />
                        <div className="text-sm font-bold text-gray-800">{stats.dailyActivity}</div>
                        <div className="text-xs text-gray-500">نشاط اليوم</div>
                    </div>
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <FaChartLine className="text-green-500 mx-auto mb-1 text-lg" />
                        <div className="text-sm font-bold text-gray-800">{stats.newPosts}</div>
                        <div className="text-xs text-gray-500">جديد هذا الأسبوع</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}