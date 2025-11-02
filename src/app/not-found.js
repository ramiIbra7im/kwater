import Link from "next/link";
import Image from "next/image";
export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-amber-100">
            <div className="text-center">
                <div className="relative w-80 h-80 mx-auto mb-6">
                    <Image
                        src="/notfound.gif"
                        alt="Not Found"
                        fill
                        style={{ objectFit: "contain" }}
                    />
                </div>

                <h1 className="text-6xl font-bold text-gray-800 mb-4">الصفحة غير موجودة</h1>
                <p className="text-gray-600 mb-8">عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.</p>
                <Link
                    href="/"
                    className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition font-medium"
                >
                    العودة للرئيسية
                </Link>
            </div>
        </div>
    )
}