'use client'
import { useRouter } from "next/navigation"
import { FaPlus, FaTimes, FaFire, FaHashtag, FaSearch, FaFilter } from "react-icons/fa"
import { useState, useEffect } from "react"

export default function Layout({
    children,
    leftSidebar,
    rightSidebar,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredPosts,
    totalPosts,
    onResetFilters
}) {
    const router = useRouter()
    const [headerHeight, setHeaderHeight] = useState(0)
    const [windowWidth, setWindowWidth] = useState(0)

    useEffect(() => {
        // حساب ارتفاع الهيدر وعرض النافذة
        const calculateDimensions = () => {
            const header = document.querySelector('.mobile-filter-header')
            if (header) {
                setHeaderHeight(header.offsetHeight)
            }
            setWindowWidth(window.innerWidth)
        }

        calculateDimensions()
        window.addEventListener('resize', calculateDimensions)

        return () => window.removeEventListener('resize', calculateDimensions)
    }, [searchTerm, selectedCategory])

    const categories = [
        { name: "الكل", value: "" },
        { name: "رومانسي", value: "رومانسي" },
        { name: "فلسفي", value: "فلسفي" },
        { name: "ديني", value: "ديني" },
        { name: "حزين", value: "حزين" },
        { name: "ملهم", value: "ملهم" },
        { name: "ساخر", value: "ساخر" },
    ]

    const handleResetAllFilters = () => {
        setSearchTerm("")
        setSelectedCategory("")
        onResetFilters?.()
    }

    // حساب الهوامش بناءً على عرض الشاشة
    const getContentMargins = () => {
        if (windowWidth < 768) {
            return { marginLeft: '0', marginRight: '0' }
        } else if (windowWidth < 1280) {
            return {
                marginLeft: leftSidebar ? '336px' : '0',
                marginRight: '0'
            }
        } else {
            return {
                marginLeft: leftSidebar ? '336px' : '0',
                marginRight: rightSidebar ? '336px' : '0'
            }
        }
    }

    const contentMargins = getContentMargins()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* شريط البحث والفلتر للشاشات الصغيرة */}
            <div className="xl:hidden fixed top-16 left-0 right-0 z-40 bg-white shadow-lg border-b border-gray-200 mobile-filter-header">
                {/* شريط البحث */}
                <div className="p-3  border-b border-gray-100">
                    <div className="relative">
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث في الخواطر أو الأسماء..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 border border-gray-300 rounded-xl pl-4 pr-10 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-base"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes className="text-sm" />
                            </button>
                        )}
                    </div>
                </div>

                {/* التصنيفات */}
                <div className="p-3">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium transition-all min-w-[70px] text-center ${selectedCategory === cat.value
                                    ? "bg-amber-500 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* إحصائيات النتائج */}
                {(searchTerm || selectedCategory) && (
                    <div className="px-3 pb-3 flex items-center justify-between text-sm text-gray-600">
                        <span className="font-medium">
                            {filteredPosts?.length || 0} من {totalPosts || 0}
                        </span>
                        <button
                            onClick={handleResetAllFilters}
                            className="text-red-500 hover:text-red-600 flex items-center gap-2 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <FaTimes className="text-sm" />
                            إعادة التعيين
                        </button>
                    </div>
                )}
            </div>

            {/* زر إنشاء خاطرة للشاشات الصغيرة */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => router.push('/Create')}
                    className="bg-orange-400 text-white p-4 rounded-full hover:bg-amber-600 transition-all duration-300 font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                >
                    <FaPlus className="text-xl" />
                </button>
            </div>

            {/* المحتوى الرئيسي */}
            <div
                className="flex justify-center gap-6 mx-auto px-4 transition-all duration-300"
                style={{ paddingTop: `${headerHeight}px` }}
            >
                {/* العمود اليسار - للشاشات المتوسطة والكبيرة */}
                {leftSidebar && (
                    <div className="hidden md:block sm:top-60 w-80 shrink-0 fixed left-4 xl:top-25 z-30 transition-all duration-300">
                        <div className="h-[calc(100vh-120px)] overflow-y-auto rounded-3xl bg-white shadow-lg border border-gray-200">
                            {leftSidebar}
                        </div>
                    </div>
                )}

                {/* العمود الأوسط - المحتوى الرئيسي */}
                <div
                    className="flex-1   min-h-screen transition-all duration-300"
                    style={contentMargins}
                >
                    <div className="max-w-4xl mt-8 mx-auto ">
                        {children}
                    </div>
                </div>

                {/* العمود اليمين - للشاشات الكبيرة فقط */}
                {rightSidebar && (
                    <div className="hidden xl:block w-80 shrink-0 fixed right-4 top-24 z-30 transition-all duration-300">
                        <div className="h-[calc(100vh-120px)] overflow-y-auto rounded-3xl bg-white shadow-lg border border-gray-200">
                            {rightSidebar}
                        </div>
                    </div>
                )}
            </div>

            {/* تأثيرات responsive إضافية */}
            {/* <style jsx>{`
                @media (max-width: 767px) {
                    .mobile-filter-header {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                    }
                }
                
                @media (min-width: 768px) and (max-width: 1279px) {
                    .main-content {
                        margin-left: ${leftSidebar ? '336px' : '0'};
                    }
                }
                
                @media (min-width: 1280px) {
                    .main-content {
                        margin-left: ${leftSidebar ? '336px' : '0'};
                        margin-right: ${rightSidebar ? '336px' : '0'};
                    }
                }
                
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style> */}
        </div>
    )
}