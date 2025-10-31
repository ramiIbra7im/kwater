// src/app/components/PostActions.js
'use client'
import { useState } from "react"
import { FaEllipsisH, FaEdit, FaTrash, FaCrown } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabaseClient"
import toast from "react-hot-toast"
import Modal from 'react-modal'

// تأكد من تعيين العنصر الجذر للمودال
if (typeof window !== 'undefined') {
    Modal.setAppElement('body')
}

// مكون المودال المنفصل
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, isLoading, isSiteOwner }) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={{
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '400px',
                    width: '90%',
                    textAlign: 'center',
                    borderRadius: '16px',
                    padding: '24px',
                    direction: 'rtl',
                    border: 'none',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    background: 'white'
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000
                }
            }}
        >
            <div className="space-y-4">
                {/* أيقونة مختلفة حسب نوع الحذف */}
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                    isSiteOwner ? 'bg-purple-100' : 'bg-red-100'
                }`}>
                    <FaTrash className={`text-lg ${isSiteOwner ? 'text-purple-600' : 'text-red-600'}`} />
                    {isSiteOwner && <FaCrown className="text-amber-500 text-xs ml-1" />}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900">
                    {isSiteOwner ? 'حذف كمشرف' : 'تأكيد الحذف'}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                    {isSiteOwner 
                        ? 'أنت على وشك حذف هذه الخاطرة بصلاحية المشرف. هذا الإجراء لا يمكن التراجع عنه.'
                        : 'هل أنت متأكد من حذف هذه الخاطرة؟ هذا الإجراء لا يمكن التراجع عنه.'
                    }
                </p>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-3 px-4 text-white rounded-xl transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2 ${
                            isSiteOwner 
                                ? 'bg-purple-600 hover:bg-purple-700' 
                                : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                جاري الحذف...
                            </>
                        ) : (
                            isSiteOwner ? 'حذف كمشرف' : 'تأكيد الحذف'
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default function PostActions({ post, user, onPostDelete }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const router = useRouter()

    // التحقق إذا كان المستخدم هو صاحب البوست أو صاحب الموقع
    const isOwner = user && (user.id === post.user_id || user.is_owner)
    
    // إذا لم يكن صاحب البوست ولا صاحب الموقع، لا تظهر أي شيء
    if (!isOwner) return null

    // إذا كان صاحب الموقع وليس صاحب البوست، تظهر خيارات إضافية
    const isSiteOwner = user?.is_owner && user.id !== post.user_id

    const handleEdit = () => {
        setIsOpen(false)
        router.push(`/edit/${post.id}`)
    }

    const handleDeleteClick = () => {
        setIsOpen(false)
        setShowDeleteModal(true)
    }

    const handleDeleteConfirm = async () => {
        setIsLoading(true)
        try {
            // حذف الإعجابات المرتبطة أولاً
            const { error: likesError } = await supabase
                .from('likes')
                .delete()
                .eq('post_id', post.id)

            if (likesError) throw likesError

            // حذف المحفوظات المرتبطة
            const { error: savedError } = await supabase
                .from('saved_posts')
                .delete()
                .eq('post_id', post.id)

            if (savedError) throw savedError

            // حذف البوست نفسه من الداتابيز
            const { error: postError } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.id)

            if (postError) throw postError

            // إخطار الـ parent بالتحديث - مهم جداً
            if (onPostDelete && typeof onPostDelete === 'function') {
                onPostDelete(post.id)
            } else {
                // إذا الـ onPostDelete مش شغالة، أعمل ريفرش للصفحة
                window.location.reload()
            }

            toast.success(
                isSiteOwner 
                    ? "تم حذف الخاطرة كمشرف" 
                    : "تم حذف الخاطرة بنجاح"
            )
            setShowDeleteModal(false)

        } catch (error) {
            toast.error("حدث خطأ أثناء حذف الخاطرة")
        } finally {
            setIsLoading(false)
            setIsOpen(false)
        }
    }

    const handleCloseDeleteModal = () => {
        if (!isLoading) {
            setShowDeleteModal(false)
        }
    }

    return (
        <div className="relative">
            {/* زر القائمة - النقاط الثلاث */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className="p-2 text-white hover:bg-white/30 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <FaEllipsisH className="text-sm" />
                )}
            </button>

            {/* القائمة المنسدلة */}
            {isOpen && (
                <div className="fixed inset-0 z-[100]">
                    <div
                        className="absolute inset-0 bg-transparent"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute left-4 top-14 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-[101] min-w-48">
                        {/* إذا كان صاحب الموقع يظهر تاج */}
                        {isSiteOwner && (
                            <div className="px-4 py-2 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-amber-600">
                                    <FaCrown className="text-sm" />
                                    <span className="text-xs font-bold">التدخل كمشرف</span>
                                </div>
                            </div>
                        )}

                        {/* زر التعديل - يظهر فقط لصاحب البوست */}
                        {!isSiteOwner && (
                            <button
                                onClick={handleEdit}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                            >
                                <FaEdit className="text-sm" />
                                <span className="font-medium">تعديل الخاطرة</span>
                            </button>
                        )}

                        {/* زر الحذف */}
                        <button
                            onClick={handleDeleteClick}
                            disabled={isLoading}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors disabled:opacity-50 ${
                                isSiteOwner 
                                    ? 'text-purple-600 hover:bg-purple-50' 
                                    : 'text-red-600 hover:bg-red-50'
                            }`}
                        >
                            <FaTrash className="text-sm" />
                            <span className="font-medium">
                                {isSiteOwner ? 'حذف كمشرف' : 'حذف الخاطرة'}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* مودال تأكيد الحذف */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteConfirm}
                isLoading={isLoading}
                isSiteOwner={isSiteOwner}
            />
        </div>
    )
}