'use client'
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaPhone, FaCamera, FaCheck, FaTimes } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

export default function CompleteProfile() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!fullName.trim()) {
            newErrors.fullName = "الاسم الكامل مطلوب";
        } else if (fullName.trim().length < 2) {
            newErrors.fullName = "الاسم يجب أن يكون على الأقل حرفين";
        }

        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = "رقم الموبايل مطلوب";
        } else if (!/^01[0125][0-9]{8}$/.test(phoneNumber)) {
            newErrors.phoneNumber = "رقم الموبايل غير صحيح";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.warnn("الرجاء اختيار صورة فقط");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error("حجم الصورة يجب أن يكون أقل من 5MB");
                return;
            }

            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const removeImage = () => {
        setAvatarFile(null);
        setAvatarPreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const uploadImageToStorage = async (file, userId) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        return data.publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("لم يتم العثور على المستخدم");
                return;
            }

            let avatarUrl = "";

            if (avatarFile) {
                avatarUrl = await uploadImageToStorage(avatarFile, user.id);
            }

            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: fullName.trim(),
                    phone_number: phoneNumber.trim(),
                    avatar_url: avatarUrl,
                    profile_completed: true,
                    updated_at: new Date().toISOString()
                })
                .eq("id", user.id);

            if (error) {
                toast.error("حدث خطأ أثناء تحديث الملف الشخصي");
            } else {
                toast.error("تم حفظ البيانات بنجاح!");
                router.push("/");
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء حفظ البيانات");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaUser className="text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">إكمال الملف الشخصي</h2>
                    <p className="text-indigo-100">أكمل بياناتك للاستمتاع بكامل الميزات</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 rounded-full border-4 border-indigo-100 overflow-hidden bg-gray-100">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FaUser className="text-3xl" />
                                    </div>
                                )}
                            </div>

                            {avatarPreview && (
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                    <FaTimes className="text-sm" />
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors"
                            >
                                <FaCamera className="text-sm" />
                            </button>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />

                        <p className="text-sm text-gray-500 mt-3">
                            اختر صورة شخصية (اختياري)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FaUser className="text-gray-400" />
                            الاسم الكامل
                        </label>
                        <input
                            type="text"
                            placeholder="أدخل اسمك الكامل"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${errors.fullName
                                ? "border-red-300 focus:ring-red-500 bg-red-50"
                                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                }`}
                        />
                        {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <FaTimes className="text-xs" />
                                {errors.fullName}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FaPhone className="text-gray-400" />
                            رقم الموبايل
                        </label>
                        <input
                            type="tel"
                            placeholder="مثال: 01012345678"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${errors.phoneNumber
                                ? "border-red-300 focus:ring-red-500 bg-red-50"
                                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                }`}
                        />
                        {errors.phoneNumber && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <FaTimes className="text-xs" />
                                {errors.phoneNumber}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-3 font-medium hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <FaCheck />
                                حفظ البيانات
                            </>
                        )}
                    </button>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <p className="text-sm text-blue-700 text-center">
                            📝 يمكنك تعديل هذه البيانات لاحقاً من إعدادات الحساب
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}