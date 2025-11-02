import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const { data: { session } } = await supabase.auth.getSession()

    // الصفحات المحمية
    const protectedPaths = ['/profile', '/Create', '/Complete-account']
    const isProtectedPath = protectedPaths.some(path =>
        req.nextUrl.pathname.startsWith(path)
    )

    // الصفحات التي يجب تجاهل التحقق فيها (callback و public)
    const ignorePaths = ['/auth/callback', '/']
    const isIgnoredPath = ignorePaths.some(path =>
        req.nextUrl.pathname.startsWith(path)
    )

    // إذا الصفحة محمية والمستخدم مش مسجل دخول
    if (isProtectedPath && !session) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // إذا المستخدم مسجل دخول وحاول يفتح login أو register
    if (session && (
        req.nextUrl.pathname.startsWith('/auth/login') ||
        req.nextUrl.pathname.startsWith('/auth/register')
    )) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    // السماح بالمرور لأي صفحات في ignorePaths
    if (isIgnoredPath) {
        return res
    }

    return res
}

export const config = {
    matcher: [
        '/profile/:path*',
        '/Create/:path*',
        '/Complete-account',
        '/auth/login',
        '/auth/register',
        '/auth/callback', // أضفناه هنا
    ],
}
