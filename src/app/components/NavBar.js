'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
    FaPen,
    FaUser,
    FaBookmark,
    FaHome,
    FaBars,
    FaTimes,
    FaSignOutAlt,
    FaHandHolding,
    FaFire
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        const checkMobile = () => setIsMobile(window.innerWidth < 768);

        checkMobile();
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) { }
    };

    // ✅ قائمة واحدة مع شرط بسيط
    const navItems = user
        ? [
            { name: "الرئيسية", href: "/", icon: FaHome },
            { name: "اكتب خاطرة", href: "/Create", icon: FaPen },
            ...(isMobile ? [{ name: "الأكثر أعجابا", href: "/top-post", icon: FaFire }] : []),
            { name: "المحفوظات", href: "/saved", icon: FaBookmark },
            { name: "صفحتي", href: "/profile", icon: FaUser },
        ]
        : [
            { name: "الرئيسية", href: "/", icon: FaHome },
            { name: "تسجيل الدخول", href: "/auth/login", icon: FaUser },
            { name: "إنشاء حساب", href: "/auth/register", icon: FaUser },
        ];

    const isActive = (href) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };
    // md: px - 6 lg: px - 8md:h-16 lg:h-20
    return (
        <>
            <nav
                dir="ltr"
                className={`fixed 
                            h-16   top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
                        : 'bg-white shadow-sm'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* الشعار */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaHandHolding className="text-white text-lg" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 text-xl leading-5">خاطرتي</span>
                                <span className="text-xs text-gray-500">اكتب ما يدور في ذهنك</span>
                            </div>
                        </Link>

                        {/* قائمة التنقل للشاشات الكبيرة */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isActive(item.href)
                                        ? "bg-amber-500 text-white shadow-lg transform -translate-y-0.5"
                                        : "text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                                        }`}
                                >
                                    <item.icon className="text-sm" />
                                    {item.name}
                                </Link>
                            ))}

                            {user && (
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ml-2"
                                >
                                    <FaSignOutAlt className="text-sm" />
                                    <span>تسجيل خروج</span>
                                </button>
                            )}
                        </div>

                        {/* زر القائمة للموبايل */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-600 transition-all duration-200"
                        >
                            {isMenuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </div>

                {/* القائمة المتنقلة للموبايل */}
                {isMenuOpen && (
                    <div className="md:hidden w-1/2 bg-white border-t border-gray-200 shadow-lg">
                        <div className="px-4 py-3 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive(item.href)
                                        ? "bg-amber-500 text-white shadow-md"
                                        : "text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                                        }`}
                                >
                                    <item.icon className="text-lg" />
                                    {item.name}
                                </Link>
                            ))}

                            {user && (
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                                >
                                    <FaSignOutAlt className="text-lg" />
                                    <span>تسجيل خروج</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* مساحة أسفل الـ Navbar */}
            <div className="h-16"></div>
        </>
    );
}