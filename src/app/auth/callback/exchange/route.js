// src/app/auth/callback/exchange/route.js
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')

    // لو فيه خطأ من Supabase Auth
    if (error) {
        return NextResponse.json({
            error: true,
            message: error_description || error
        }, { status: 400 })
    }

    try {
        if (code) {
            const supabase = createRouteHandlerClient({ cookies })
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

            if (exchangeError) throw exchangeError

            const user = data?.user
            if (!user) throw new Error('لم يتم العثور على المستخدم.')

            // إنشاء صف في جدول profiles لو مش موجود
            const { error: insertError } = await supabase
                .from('profiles')
                .upsert([
                    {
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || '',
                        avatar_url: user.user_metadata?.avatar_url || '',
                        updated_at: new Date().toISOString()
                    }
                ], { onConflict: 'id' })

            if (insertError) {
                console.error('Profile insert error:', insertError)
                // لا نرمي خطأ هنا لأن المستخدم تم تفعيله بنجاح
            }

            // ✅ إرجاع نجاح مع بيانات المستخدم
            return NextResponse.json({
                success: true,
                message: 'تم تفعيل الحساب بنجاح',
                user: {
                    id: user.id,
                    email: user.email
                }
            })
        } else {
            throw new Error('كود التفعيل مطلوب')
        }
    } catch (err) {
        console.error('Exchange error:', err)
        return NextResponse.json({
            error: true,
            message: err.message || 'حدث خطأ أثناء التفعيل'
        }, { status: 500 })
    }
}