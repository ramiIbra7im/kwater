// src/app/components/ProfilePage.js
'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { FaUser, FaEdit, FaSave, FaTimes, FaCamera, FaHeart, FaComment, FaShare, FaSignOutAlt, FaCog, FaHistory } from "react-icons/fa"
import { supabase } from "../../lib/supabaseClient"
import OwnerBadge from "../components/OwnerBadge" // أضف هذا الاستيراد
import toast from "react-hot-toast"

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [userPosts, setUserPosts] = useState([])
    const [activeTab, setActiveTab] = useState('posts')

    // بيانات التعديل
    const [editData, setEditData] = useState({
        full_name: '',
        phone_number: '',
        bio: ''
    })

    useEffect(() => {
        fetchUserProfile()
        fetchUserPosts()
    }, [])

    const fetchUserProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }

            setUser(user)

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) throw error

            setProfile(profile)
            setEditData({
                full_name: profile.full_name || '',
                phone_number: profile.phone_number || '',
                bio: profile.bio || ''
            })
        } catch (error) {
        } finally {
            setIsLoading(false)
        }
    }

    const fetchUserPosts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: posts, error } = await supabase
                .from('posts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setUserPosts(posts || [])
        } catch (error) {
        }
    }

    const handleSaveProfile = async () => {
        if (!user) return

        setSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editData.full_name,
                    phone_number: editData.phone_number,
                    bio: editData.bio,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (error) throw error

            setProfile(prev => ({
                ...prev,
                ...editData
            }))
            setIsEditing(false)
            toast.success('تم تحديث الملف الشخصي بنجاح!')
        } catch (error) {
            toast.error('حدث خطأ أثناء تحديث الملف الشخصي')
        } finally {
            setSaving(false)
        }
    }

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            router.push('/auth/login')
        } catch (error) {
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file || !user) return

        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
            toast.error("الرجاء اختيار صورة فقط")
            return
        }

        // التحقق من حجم الملف
        if (file.size > 5 * 1024 * 1024) {
            toast.error("حجم الصورة يجب أن يكون أقل من 5MB")
            return
        }

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}.${fileExt}`

            // رفع الصورة
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true })

            if (uploadError) throw uploadError

            // الحصول على رابط الصورة
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            // تحديث البروفايل برابط الصورة الجديدة
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            setProfile(prev => ({
                ...prev,
                avatar_url: publicUrl
            }))

            toast.success('تم تحديث الصورة الشخصية بنجاح!')
        } catch (error) {
            toast.error('حدث خطأ أثناء رفع الصورة')
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleDateString('ar-EG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل البيانات...</p>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600">لم يتم العثور على الملف الشخصي</p>
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition"
                    >
                        تسجيل الدخول
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* بطاقة البروفايل */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
                    {/* خلفية البروفايل */}
                    <div className="h-32 bg-gradient-to-r from-amber-400 to-orange-500"></div>

                    {/* محتوى البروفايل */}
                    <div className="relative px-6 pb-6">
                        {/* الصورة الشخصية */}
                        <div className="relative -top-16 mb-4">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                                    {profile.avatar_url ? (
                                        <Image
                                            src={profile.avatar_url}
                                            alt={profile.full_name}
                                            width={128}
                                            height={128}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                            <FaUser className="text-4xl text-gray-500" />
                                        </div>
                                    )}
                                </div>

                                {/* زر تغيير الصورة */}
                                <label className="absolute bottom-2 right-2 w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-600 transition shadow-lg">
                                    <FaCamera className="text-sm" />
                                    <input
                                        type="file"
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* معلومات البروفايل */}
                        <div className="-mt-12">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    {/* التعديل هنا - أضف علامة صاحب الموقع */}
                                    <div className="flex items-center gap-3 mb-2">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.full_name}
                                                onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                                                className="text-2xl font-bold bg-gray-100 border border-gray-300 rounded-lg px-3 py-1"
                                            />
                                        ) : (
                                            <h1 className="text-2xl font-bold text-gray-900">
                                                {profile.full_name || 'بدون اسم'}
                                            </h1>
                                        )}
                                        {profile.is_owner && <OwnerBadge />}
                                    </div>
                                    <p className="text-gray-500">{profile.email}</p>
                                    {profile.is_owner && (
                                        <p className="text-amber-600 font-medium text-sm mt-1">
                                            مؤسس ومنشئ الموقع
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <FaSave />
                                                {saving ? 'جاري الحفظ...' : 'حفظ'}
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
                                            >
                                                <FaTimes />
                                                إلغاء
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition flex items-center gap-2"
                                            >
                                                <FaEdit />
                                                تعديل
                                            </button>
                                            <button
                                                onClick={handleSignOut}
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                                            >
                                                <FaSignOutAlt />
                                                تسجيل الخروج
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* المعلومات الإضافية */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-amber-600">{userPosts.length}</div>
                                    <div className="text-gray-500">الخواطر</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-amber-600">
                                        {userPosts.reduce((acc, post) => acc + (post.likes_count || 0), 0)}
                                    </div>
                                    <div className="text-gray-500">الإعجابات</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-amber-600">
                                        {userPosts.reduce((acc, post) => acc + (post.comments_count || 0), 0)}
                                    </div>
                                    <div className="text-gray-500">التعليقات</div>
                                </div>
                            </div>

                            {/* السيرة الذاتية */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">عن المستخدم</h3>
                                {isEditing ? (
                                    <textarea
                                        value={editData.bio}
                                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                                        placeholder="اكتب سيرتك الذاتية هنا..."
                                        className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none"
                                        maxLength={500}
                                    />
                                ) : (
                                    <p className="text-gray-700 leading-relaxed">
                                        {profile.bio || 'لم يتم إضافة سيرة ذاتية بعد.'}
                                    </p>
                                )}
                            </div>

                            {/* معلومات الاتصال */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">معلومات الاتصال</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">البريد الإلكتروني:</span>
                                        <span className="text-gray-900 font-medium">{profile.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">رقم الهاتف:</span>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editData.phone_number}
                                                onChange={(e) => setEditData(prev => ({ ...prev, phone_number: e.target.value }))}
                                                className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-left"
                                                placeholder="أدخل رقم الهاتف"
                                            />
                                        ) : (
                                            <span className="text-gray-900 font-medium">
                                                {profile.phone_number || 'لم يتم إضافة رقم'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">تاريخ الانضمام:</span>
                                        <span className="text-gray-900 font-medium">
                                            {formatDate(profile.created_at)}
                                        </span>
                                    </div>
                                    {/* إضافة معلومات الدور */}
                                    {profile.is_owner && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">الدور:</span>
                                            <span className="text-amber-600 font-bold">صاحب الموقع</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* تبويبات المحتوى */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`flex-1 py-4 px-6 text-center font-medium transition ${activeTab === 'posts'
                                    ? 'text-amber-600 border-b-2 border-amber-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <FaHistory className="inline ml-2" />
                                خواطري
                            </button>
                            <button
                                onClick={() => setActiveTab('likes')}
                                className={`flex-1 py-4 px-6 text-center font-medium transition ${activeTab === 'likes'
                                    ? 'text-amber-600 border-b-2 border-amber-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <FaHeart className="inline ml-2" />
                                المعجبات
                            </button>
                        </nav>
                    </div>

                    {/* محتوى التبويبات */}
                    <div className="p-6">
                        {activeTab === 'posts' && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">خواطري المنشورة</h3>
                                {userPosts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FaHistory className="text-4xl text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">لم تنشر أي خواطر بعد</p>
                                        <button
                                            onClick={() => router.push('/create')}
                                            className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition"
                                        >
                                            اكتب أول خاطرة
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {userPosts.map((post) => (
                                            <div key={post.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                <p className="text-gray-800 mb-3 leading-relaxed">{post.content}</p>
                                                <div className="flex items-center justify-between text-sm text-gray-500">
                                                    <div className="flex items-center gap-4">
                                                        <span className="flex items-center gap-1">
                                                            <FaHeart className="text-red-400" />
                                                            {post.likes_count || 0}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FaComment className="text-blue-400" />
                                                            {post.comments_count || 0}
                                                        </span>
                                                    </div>
                                                    <span>{formatDate(post.created_at)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'likes' && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">الخواطر المعجبات</h3>
                                <div className="text-center py-8">
                                    <FaHeart className="text-4xl text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">لم تعجب بأي خواطر بعد</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}