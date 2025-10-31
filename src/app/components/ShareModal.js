// src/app/components/SharePopup.js
'use client'
import { useState, useEffect, useRef } from "react"
import { FaCopy, FaWhatsapp, FaFacebook, FaLink } from "react-icons/fa"

export default function SharePopup({ post, isOpen, onClose }) {
    const [copied, setCopied] = useState(false)
    const [postUrl, setPostUrl] = useState("")
    const popupRef = useRef(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPostUrl(`${window.location.origin}/post/${post.id}`)
        }
    }, [post.id])

    // إغلاق النافذة عند الضغط خارجها
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const shareText = `شاهد هذه الخاطرة: "${post.content.substring(0, 80)}..."`

    const shareOptions = [
        {
            name: "WhatsApp",
            icon: FaWhatsapp,
            color: "text-green-500",
            url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + postUrl)}`
        },
        {
            name: "Facebook",
            icon: FaFacebook,
            color: "text-blue-500",
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
        },
        {
            name: "نسخ الرابط",
            icon: FaLink,
            color: "text-gray-500",
            action: "copy"
        }
    ]

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(postUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
        }
    }

    const handleShare = (url) => {
        window.open(url, '_blank', 'width=600,height=400')
        onClose()
    }

    const handleOptionClick = (option) => {
        if (option.action === "copy") {
            copyToClipboard()
            setTimeout(() => onClose(), 1000)
        } else {
            handleShare(option.url)
        }
    }

    return (
        <div className="fixed inset-0 z-50">
            {/* النافذة المنبثقة */}
            <div
                ref={popupRef}
                className="absolute bottom-16 left-4 bg-white rounded-lg border border-gray-300 shadow-lg w-48"
            >
                {/* القائمة */}
                <div className="py-1">
                    {shareOptions.map((option) => (
                        <button
                            key={option.name}
                            onClick={() => handleOptionClick(option)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-right"
                        >
                            <option.icon className={`text-base ${option.color}`} />
                            <span className="text-gray-700 text-sm flex-1">
                                {option.name === "نسخ الرابط" && copied ? "تم النسخ!" : option.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}