// components/Loading.js
'use client';
import { FaHeart, FaHashtag, FaCompass } from "react-icons/fa";

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                {/* الشعار المتحرك */}
                <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <FaHeart className="text-white text-2xl" />
                    </div>
                    <div className="absolute -inset-4 bg-amber-200 rounded-3xl opacity-20 animate-ping"></div>
                </div>

                {/* النص */}
                <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    جاري التحميل
                </h2>
                <p className="text-gray-500 mb-6">يرجى الانتظار...</p>

                {/* شريط التقدم */}
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
                </div>
            </div>

            {/* تأثيرات CSS */}
            <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
}