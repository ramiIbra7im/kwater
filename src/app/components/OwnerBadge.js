import { FaCrown } from "react-icons/fa"

// src/app/components/OwnerBadge.js
export default function OwnerBadge({ size = "sm", className = "" }) {
    const sizes = {
        sm: "text-xs px-2 py-1",
        md: "text-sm px-3 py-1.5",
        lg: "text-base px-4 py-2"
    }

    return (
        <div className={`
            inline-flex items-center gap-1
            bg-linear-to-r from-amber-500 to-orange-500
            text-white font-bold
            rounded-full
            ${sizes[size]}
            ${className} 
            shadow-lg shadow-amber-500/25
            border border-amber-300
        `}>
            <span><FaCrown /></span>
            {/* <span>صاحب الموقع</span> */}
        </div>
    )
}