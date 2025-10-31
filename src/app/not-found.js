import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="text-6xl mb-4">😕</div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">الصفحة غير موجودة</h1>
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