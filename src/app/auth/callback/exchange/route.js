// src/app/auth/callback/exchange/route.js
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    // للتحقق من أن الطلب جاي من نفس الأصل
    const origin = request.headers.get('origin')

    if (!code) {
        return NextResponse.json(
            { error: true, message: 'كود التفعيل مطلوب' },
            {
                status: 400,
                headers: {
                    'Access-Control-Allow-Origin': origin || '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            }
        )
    }

    try {
        const supabase = createRouteHandlerClient({ cookies })

        // استبدال الكود بالسيشن
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
            console.error('Exchange error:', exchangeError)
            throw new Error(exchangeError.message)
        }

        const user = data?.user
        if (!user) {
            throw new Error('لم يتم العثور على المستخدم بعد التفعيل')
        }

        console.log('User verified:', user.email)

        // إنشاء/تحديث البروفايل
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || '',
                avatar_url: user.user_metadata?.avatar_url || '',
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'id',
                ignoreDuplicates: false
            })

        if (profileError) {
            console.error('Profile error:', profileError)
            // لا نوقف العملية لو فشل تحديث البروفايل
        }

        return NextResponse.json(
            {
                success: true,
                message: 'تم تفعيل الحساب بنجاح',
                user: {
                    id: user.id,
                    email: user.email
                }
            },
            {
                headers: {
                    'Access-Control-Allow-Origin': origin || '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            }
        )

    } catch (error) {
        console.error('Full verification error:', error)
        return NextResponse.json(
            {
                error: true,
                message: error.message || 'حدث خطأ غير متوقع أثناء التفعيل'
            },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': origin || '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            }
        )
    }
}

// معالجة طلبات OPTIONS لـ CORS
export async function OPTIONS(request) {
    const origin = request.headers.get('origin')

    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    })
}