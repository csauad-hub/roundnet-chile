import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    console.error('[callback] No code in URL')
    return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`)
  }

  // Build the redirect response first so we can attach cookies to it
  const response = NextResponse.redirect(`${origin}${next}`)

  // createServerClient (fixed in @supabase/ssr >=0.4.0) correctly reads the
  // PKCE verifier from request cookies and writes session to response cookies.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`)
  }

  return response
}
