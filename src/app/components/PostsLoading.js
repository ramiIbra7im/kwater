// src/app/components/PostsLoading.js
export default function PostsLoading() {
    return (
        <div className="space-y-6">
            {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-1 animate-pulse">
                    {/* الهيدر مع التدرج اللوني */}
                    <div className=" from-gray-300 p-6 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>

                        <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-10 -translate-y-10"></div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-8 translate-y-8"></div>

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl border-2 border-white/40 bg-white/20 backdrop-blur-sm overflow-hidden shadow-lg">
                                            <div className="w-full h-full bg-gray-400"></div>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 border-2 border-white rounded-full shadow-lg"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="w-24 h-4 bg-white/60 rounded mb-2"></div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-3 bg-white/40 rounded"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* زر الحفظ */}
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm w-8 h-8"></div>
                            </div>

                            {/* التصنيف */}
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-xl border border-white/30 w-20 h-6"></div>
                        </div>
                    </div>

                    {/* محتوى الخاطرة */}
                    <div className="p-6 relative">
                        <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-br-2xl opacity-40"></div>

                        <div className="relative z-10">
                            <div className="space-y-3 mb-4 text-right">
                                <div className="w-full h-4 bg-gray-200 rounded"></div>
                                <div className="w-4/5 h-4 bg-gray-200 rounded ml-auto"></div>
                                <div className="w-3/5 h-4 bg-gray-200 rounded ml-auto"></div>
                                <div className="w-2/5 h-4 bg-gray-200 rounded ml-auto"></div>
                            </div>
                        </div>
                    </div>

                    {/* الإحصائيات */}
                    <div className="px-6 pb-3">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full w-16 h-6"></div>
                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full w-16 h-6"></div>
                            </div>
                        </div>
                    </div>

                    {/* أزرار التفاعل */}
                    <div className="px-6 pb-4">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                            <div className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gray-200 border border-gray-300 h-10"></div>
                            <div className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gray-200 border border-gray-300 h-10"></div>
                        </div>
                    </div>

                    {/* خط زخرفي في الأسفل */}
                    <div className="h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 opacity-60"></div>
                </div>
            ))}
        </div>
    );
}