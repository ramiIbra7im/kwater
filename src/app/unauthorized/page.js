import Link from "next/link";
import Image from "next/image";

export default function Unauthorized() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
            <div className="text-center max-w-md mx-4">


                <div className="relative w-60 h-60 mx-auto">
                    <Image
                        src="/Stop.gif"
                        alt="stop"
                        fill
                        style={{ objectFit: "contain" }}
                    />
                </div>

                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-200 rounded-full animate-pulse"></div>


                {/* Title */}
                <h1 className="text-7xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
                    دخول غير مصرح
                </h1>

                {/* Description */}
                <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                    يبدو أنك تحاول الوصول إلى منطقة الخواطر الخاصة<br />
                    سجل الدخول لمواصلة رحلتك الإبداعية
                </p>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <Link
                        href="/auth/login"
                        className="inline-block w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        تسجيل الدخول
                    </Link>


                </div>

                {/* Decorative elements */}
                <div className="mt-12 flex justify-center space-x-2">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="w-2 h-2 bg-amber-300 rounded-full animate-bounce"
                            style={{ animationDelay: `${item * 0.2}s` }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}