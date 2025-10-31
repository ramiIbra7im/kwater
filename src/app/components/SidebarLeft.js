'use client';
import { FaHashtag, FaCompass, FaHeart, FaSun, FaMoon, FaStar, FaCoffee, FaSearch, FaFilter } from "react-icons/fa";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SidebarRight({
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory
}) {
    const [sidebarCategories, setSidebarCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data: posts, error } = await supabase
                .from('posts')
                .select('category');

            if (error) throw error;

            const categoryCounts = {};
            posts?.forEach(post => {
                if (post.category) {
                    categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
                }
            });

            const baseCategories = [
                { name: "الكل", value: "", icon: FaCompass, count: posts?.length || 0 },
                { name: "رومانسي", value: "رومانسي", icon: FaHeart, count: categoryCounts['رومانسي'] || 0 },
                { name: "فلسفي", value: "فلسفي", icon: FaSun, count: categoryCounts['فلسفي'] || 0 },
                { name: "ديني", value: "ديني", icon: FaStar, count: categoryCounts['ديني'] || 0 },
                { name: "حزين", value: "حزين", icon: FaMoon, count: categoryCounts['حزين'] || 0 },
                { name: "ملهم", value: "ملهم", icon: FaMoon, count: categoryCounts['ملهم'] || 0 },
                { name: "ساخر", value: "ساخر", icon: FaCoffee, count: categoryCounts['ساخر'] || 0 },
            ];

            setSidebarCategories(baseCategories);
        } catch (error) {
            setSidebarCategories([
                { name: "الكل", value: "", icon: FaCompass, count: 0 },
                { name: "رومانسي", value: "رومانسي", icon: FaHeart, count: 0 },
                { name: "فلسفي", value: "فلسفي", icon: FaSun, count: 0 },
                { name: "ديني", value: "ديني", icon: FaStar, count: 0 },
                { name: "حزين", value: "حزين", icon: FaMoon, count: 0 },
                { name: "ساخر", value: "ساخر", icon: FaCoffee, count: 0 },
                { name: "ملهم", value: "ملهم", icon: FaCoffee, count: 0 },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryClick = (categoryValue) => {
        setSelectedCategory(categoryValue);
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
    };

    const isCategoryActive = (categoryValue) => {
        return selectedCategory === categoryValue;
    };

    if (isLoading) {
        return (
            <aside className="hidden xl:block w-80 shrink-0 h-[calc(100vh-80px)] sticky top-[80px] bg-white shadow-lg rounded-3xl p-6 overflow-y-auto border border-gray-100">
                <div className="mb-8">
                    <h2 className="text-xl font-bold bg-gradient-to-l from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                        <FaHashtag className="text-amber-500" />
                        التصنيفات
                    </h2>
                    <p className="text-sm text-gray-500">جاري تحميل التصنيفات...</p>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-100 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-300 rounded-xl"></div>
                                <div className="w-20 h-4 bg-gray-300 rounded"></div>
                            </div>
                            <div className="w-8 h-6 bg-gray-300 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </aside>
        );
    }

    return (
        <aside className="hidden xl:block w-80 shrink-0 h-[calc(100vh-80px)] sticky top-[80px] bg-white shadow-lg rounded-3xl p-6 overflow-y-auto border border-gray-100">
            {/* شريط البحث */}
            <div className="mb-6">
                <div className="relative mb-4">
                    <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ابحث في الخواطر أو الأسماء..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 border border-gray-300 rounded-xl pl-4 pr-10 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    />
                </div>

                {/* زر إعادة تعيين الفلتر */}
                {(searchTerm || selectedCategory) && (
                    <button
                        onClick={handleResetFilters}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 rounded-xl hover:from-amber-600 hover:to-orange-600 transition flex items-center justify-center gap-2 shadow-md"
                    >
                        <FaFilter className="text-sm" />
                        إعادة تعيين الفلتر
                    </button>
                )}
            </div>

            {/* الهيدر */}
            <div className="mb-8">
                <h2 className="text-xl font-bold bg-gradient-to-l from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                    <FaHashtag className="text-amber-500" />
                    التصنيفات
                </h2>
                <p className="text-sm text-gray-500">اكتشف الخواطر حسب اهتماماتك</p>
            </div>

            {/* قائمة التصنيفات */}
            <ul className="space-y-3">
                {sidebarCategories.map((cat) => (
                    <li key={cat.name}>
                        <button
                            onClick={() => handleCategoryClick(cat.value)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-300 group ${isCategoryActive(cat.value)
                                ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg transform -translate-y-0.5"
                                : "border-transparent hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 hover:shadow-lg hover:border-amber-100"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-2 rounded-xl transition-colors ${isCategoryActive(cat.value)
                                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                                        : "bg-amber-50 text-amber-600 group-hover:bg-amber-100 group-hover:shadow-sm"
                                        }`}
                                >
                                    <cat.icon className="text-sm" />
                                </div>
                                <span
                                    className={`font-medium transition-colors ${isCategoryActive(cat.value)
                                        ? "text-amber-700"
                                        : "text-gray-700 group-hover:text-amber-700"
                                        }`}
                                >
                                    {cat.name}
                                </span>
                            </div>
                            <span
                                className={`text-xs px-2 py-1 rounded-full transition-colors ${isCategoryActive(cat.value)
                                    ? "bg-amber-500 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-500 group-hover:bg-amber-100 group-hover:text-amber-600"
                                    }`}
                            >
                                {cat.count}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
}