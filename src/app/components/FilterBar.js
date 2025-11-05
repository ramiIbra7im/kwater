// src/app/components/FilterBar.js
'use client'
import { FaFilter, FaSearch, FaBackspace, FaFile } from "react-icons/fa"

export default function FilterBar({
    searchTerm,
    selectedCategory,
    filteredPosts,
    totalPosts,
    onResetFilters
}) {
    if (!searchTerm && !selectedCategory) return null

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border mb-5 border-amber-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                        <FaFilter className="text-amber-500" />
                        الفلتر النشط:
                    </span>
                    {searchTerm && (
                        <span className="bg-amber-100 flex items-center text-amber-700 px-3 py-1 rounded-full text-sm border border-amber-200">
                            <span className="px-1"> <FaSearch /></span> بحث:{searchTerm}
                        </span>
                    )}
                    {selectedCategory && (
                        <span className="bg-blue-100  text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200">
                         تصنيف: {selectedCategory}
                        </span>
                    )}
                </div>
                <button
                    onClick={onResetFilters}
                    className="text-gray-500 hover:text-red-500 text-sm flex items-center gap-1 transition-colors"
                >
                    <FaBackspace className="text-3xl" />
                </button>
            </div>

            {/* إحصائيات النتائج */}
            <div className="mt-2 text-xs text-gray-500">
                عرض {filteredPosts.length} من أصل {totalPosts} خاطرة
            </div>
        </div>
    )
}