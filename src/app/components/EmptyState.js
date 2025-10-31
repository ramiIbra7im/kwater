// src/app/components/EmptyState.js
'use client'
import { useRouter } from "next/navigation"
import { FaSearch } from "react-icons/fa"

export default function EmptyState({
    searchTerm,
    selectedCategory,
    user,
    onResetFilters
}) {
    const router = useRouter()

    return (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4"><FaSearch className="mx-auto text-amber-500" /></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm || selectedCategory ? "لم نعثر على خواطر" : "لا توجد خواطر"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm || selectedCategory
                    ? "جرب تعديل كلمات البحث أو تغيير التصنيف"
                    : "كن أول من يشارك خاطرة ملهمة!"
                }
            </p>
            {(searchTerm || selectedCategory) ? (
                <button
                    onClick={onResetFilters}
                    className="bg-amber-500 text-white px-6 py-2 rounded-xl hover:bg-amber-600 transition font-medium"
                >
                    عرض جميع الخواطر
                </button>
            ) : (
                <button
                    onClick={() => router.push('/create')}
                    className="bg-amber-500 text-white px-6 py-2 rounded-xl hover:bg-amber-600 transition font-medium"
                >
                    اكتب أول خاطرة
                </button>
            )}
        </div>
    )
}