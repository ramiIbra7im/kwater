import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const { data: { session } } = await supabase.auth.getSession()

    const protectedPaths = ['/profile', '/Create', '/Complete-account']
    const isProtectedPath = protectedPaths.some(path =>
        req.nextUrl.pathname.startsWith(path)
    )

    if (!session && isProtectedPath) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    if (session && (
        req.nextUrl.pathname.startsWith('/auth/login') ||
        req.nextUrl.pathname.startsWith('/auth/register')
    )) {
        return NextResponse.redirect(new URL('/', req.url))
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
    ],
}
