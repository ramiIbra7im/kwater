// src/app/components/Layout.js
'use client'
import { useRouter } from "next/navigation"
import { FaPlus } from "react-icons/fa"

export default function Layout({
    children,
    leftSidebar,
    rightSidebar
}) {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gray-50 pt-6">
            {/* زر إنشاء خاطرة للشاشات الصغيرة */}
            <div className="md:hidden fixed bottom-6 left-6 z-50">
                <button
                    onClick={() => router.push('/create')}
                    className="bg-amber-500 text-white p-4 rounded-full hover:bg-amber-600 transition font-medium flex items-center gap-2 shadow-lg"
                >
                    <FaPlus className="text-lg" />
                </button>
            </div>

            {/* المحتوى الرئيسي */}
            <div className="flex justify-between gap-6  px-4">
                {/* العمود اليسار - ثابت */}
                {leftSidebar && (
                    <div className=" sm:block sticky    ">
                        {leftSidebar}
                    </div>
                )}

                {/* العمود الأوسط */}
                <div className="flex-1 mx-auto">
                    {children}
                </div>

                {/* العمود اليمين - ثابت */}
                {rightSidebar && (
                    <div className=" sm:block sticky   ">
                        {rightSidebar}
                    </div>
                )}
            </div>
        </div>
    )
}