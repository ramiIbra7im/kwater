// 'use client'
// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { FaEdit, FaImage, FaSmile, FaPaperPlane, FaTimes } from "react-icons/fa"
// import { supabase } from "../../lib/supabaseClient"
// import { useAuth } from "../context/AuthContext"
// import toast from "react-hot-toast"

// console.log("🚀 [CreatePost] Component Mounted");
// export default function CreatePost() {
//     const router = useRouter()
//     const { user, loading } = useAuth() // ✅ استخدام AuthContext

//     const [content, setContent] = useState("")
//     const [category, setCategory] = useState("")
//     const [imageFile, setImageFile] = useState(null)
//     const [imagePreview, setImagePreview] = useState("")
//     const [isLoading, setIsLoading] = useState(false)
//     const [charCount, setCharCount] = useState(0)
//     const maxChars = 500

//     useEffect(() => {
//         console.log("🔍 [CreatePost] Checking Auth State...");
//         console.log("➡️ loading:", loading);
//         console.log("➡️ user:", user);

//         if (!loading && !user) {
//             console.warn("🚫 No user found, redirecting to login...");
//             toast.error("يجب تسجيل الدخول أولاً");
//             router.push("/auth/login");
//         } else if (!loading && user) {
//             console.log("✅ User found:", user.id);
//         }
//     }, [user, loading, router]);

//     const categories = [
//         { value: "", label: "اختر التصنيف" },
//         { value: "رومانسي", label: "رومانسي 💖" },
//         { value: "فلسفي", label: "فلسفي 🤔" },
//         { value: "ديني", label: "ديني 🙏" },
//         { value: "حزين", label: "حزين 😢" },
//         { value: "ساخر", label: "ساخر 😄" },
//         { value: "ملهم", label: "ملهم ✨" },
//         { value: "وطني", label: "وطني 🇪🇬" }
//     ]

//     const handleContentChange = (e) => {
//         const text = e.target.value
//         if (text.length <= maxChars) {
//             setContent(text)
//             setCharCount(text.length)
//         }
//     }

//     const handleImageUpload = (e) => {
//         const file = e.target.files[0]
//         if (file) {
//             if (!file.type.startsWith('image/')) {
//                 toast.error("الرجاء اختيار صورة فقط")
//                 return
//             }

//             if (file.size > 5 * 1024 * 1024) {
//                 toast.error("حجم الصورة يجب أن يكون أقل من 5MB")
//                 return
//             }

//             setImageFile(file)
//             setImagePreview(URL.createObjectURL(file))
//         }
//     }

//     const removeImage = () => {
//         if (imagePreview) URL.revokeObjectURL(imagePreview)
//         setImageFile(null)
//         setImagePreview("")
//     }

//     const uploadImageToStorage = async (file, userId) => {
//         try {
//             const fileExt = file.name.split('.').pop()
//             const fileName = `posts/${userId}/${Date.now()}.${fileExt}`

//             const { error: uploadError } = await supabase.storage
//                 .from('post-images')
//                 .upload(fileName, file)

//             if (uploadError) throw uploadError

//             const { data } = supabase.storage
//                 .from('post-images')
//                 .getPublicUrl(fileName)

//             return data.publicUrl
//         } catch (error) {
//             console.error('Image upload failed:', error)
//             throw error
//         }
//     }

//     const handleSubmit = async (e) => {
//         e.preventDefault()

//         if (!content.trim()) return toast.error("الرجاء كتابة الخاطرة أولاً")
//         if (content.trim().length < 10) return toast.error("الخاطرة يجب أن تكون على الأقل 10 أحرف")

//         if (!user) {
//             toast.error("يجب تسجيل الدخول أولاً")
//             router.push("/auth/login")
//             return
//         }

//         setIsLoading(true)

//         try {
//             let imageUrl = ""
//             if (imageFile) {
//                 imageUrl = await uploadImageToStorage(imageFile, user.id)
//             }

//             const { error } = await supabase
//                 .from("posts")
//                 .insert([
//                     {
//                         user_id: user.id,
//                         content: content.trim(),
//                         category: category || null,
//                         image_url: imageUrl || null,
//                         likes_count: 0,
//                         comments_count: 0
//                     }
//                 ])

//             if (error) throw error

//             toast.success("تم نشر الخاطرة بنجاح!")
//             router.push("/")
//         } catch (error) {
//             console.error("Error creating post:", error)
//             toast.error("حدث خطأ أثناء نشر الخاطرة")
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     // تنظيف الصورة المؤقتة
//     useEffect(() => {
//         return () => {
//             if (imagePreview) URL.revokeObjectURL(imagePreview)
//         }
//     }, [imagePreview])

//     // ✅ أثناء تحميل المستخدم (من AuthContext)
//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <p className="text-gray-500 text-lg">جاري التحقق من تسجيل الدخول...</p>
//             </div>
//         )
//     }

//     if (!user) return null // ✅ لتجنب الوميض قبل التوجيه

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8">
//             <div className="max-w-2xl mx-auto px-4">
//                 <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-200">
//                     <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
//                         <div className="flex items-center gap-3">
//                             <div className="p-2 bg-white/20 rounded-xl">
//                                 <FaEdit className="text-2xl" />
//                             </div>
//                             <div>
//                                 <h1 className="text-2xl font-bold">اكتب خاطرة جديدة</h1>
//                                 <p className="text-amber-100">شارك أفكارك ومشاعرك مع العالم</p>
//                             </div>
//                         </div>
//                     </div>

//                     <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-3">
//                                 اكتب خاطرك هنا...
//                             </label>
//                             <div className="relative">
//                                 <textarea
//                                     value={content}
//                                     onChange={handleContentChange}
//                                     placeholder="اكتب ما يدور في خاطرك..."
//                                     className="w-full h-48 border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none text-lg leading-relaxed bg-gray-50 transition-all"
//                                 />
//                                 <div className="absolute bottom-3 left-3 text-sm text-gray-500">
//                                     {charCount}/{maxChars}
//                                 </div>
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف (اختياري)</label>
//                             <select
//                                 value={category}
//                                 onChange={(e) => setCategory(e.target.value)}
//                                 className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
//                             >
//                                 {categories.map((cat) => (
//                                     <option key={cat.value} value={cat.value}>
//                                         {cat.label}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-3">
//                                 إضافة صورة (اختياري)
//                             </label>
//                             {imagePreview ? (
//                                 <div className="relative">
//                                     <img
//                                         src={imagePreview}
//                                         alt="Preview"
//                                         className="w-full h-64 object-cover rounded-2xl border border-gray-300"
//                                     />
//                                     <button
//                                         type="button"
//                                         onClick={removeImage}
//                                         className="absolute top-3 left-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"
//                                     >
//                                         <FaTimes />
//                                     </button>
//                                 </div>
//                             ) : (
//                                 <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-amber-500 transition bg-gray-50">
//                                     <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                                         <FaImage className="text-3xl text-gray-400 mb-2" />
//                                         <p className="text-sm text-gray-500">انقر لرفع صورة</p>
//                                         <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
//                                     </div>
//                                     <input
//                                         type="file"
//                                         onChange={handleImageUpload}
//                                         accept="image/*"
//                                         className="hidden"
//                                     />
//                                 </label>
//                             )}
//                         </div>

//                         <div className="flex gap-3 pt-4">
//                             <button
//                                 type="button"
//                                 onClick={() => router.back()}
//                                 className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-xl hover:bg-gray-600 transition font-medium flex items-center justify-center gap-2"
//                             >
//                                 <FaTimes /> إلغاء
//                             </button>

//                             <button
//                                 type="submit"
//                                 disabled={isLoading || !content.trim()}
//                                 className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-6 rounded-xl hover:from-amber-600 hover:to-orange-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
//                             >
//                                 {isLoading ? (
//                                     <>
//                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                         جاري النشر...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <FaPaperPlane /> نشر الخاطرة
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     )
// }

function Test() {
    return (
        <>
            <div>test</div>
        </>
    )
}
export default Test;