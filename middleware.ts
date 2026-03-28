import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for OAuth callback
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  const supabaseResponse = NextResponse.next({ request })
  const path = request.nextUrl.pathname

  // Only protect /admin and /perfil routes
  const isAdminPath = path.startsWith('/admin')
  const isPerfilPath = path.startsWith('/perfil')
  if (!isAdminPath && !isPerfilPath) {
    return supabaseResponse
  }

  // Read auth token from chunked URL-encoded cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]
  let tokenValue: string | undefined

  if (projectRef) {
    const baseName = `sb-${projectRef}-auth-token`
    tokenValue = request.cookies.get(baseName)?.value
    if (!tokenValue) {
      const chunks: string[] = []
      for (let i = 0; i < 10; i++) {
        const chunk = request.cookies.get(`${baseName}.${i}`)?.value
        if (!chunk) break
        chunks.push(chunk)
      }
      if (chunks.length > 0) tokenValue = chunks.join('')
    }
  }

  // Decode URL-encoded JSON to get access token
  let accessToken: string | undefined
  if (tokenValue) {
    try {
      accessToken = JSON.parse(decodeURIComponent(tokenValue)).access_token
    } catch {
      try { accessToken = JSON.parse(tokenValue).access_token } catch {}
    }
  }

  // No token — redirect to login
  if (!accessToken) {
    const next = isPerfilPath ? '/auth?next=/perfil' : '/auth?next=/admin'
    return NextResponse.redirect(new URL(next, request.url))
  }

  // Verify token with admin client (bypasses RLS)
  const admin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: { user } } = await admin.auth.getUser(accessToken)

  if (!user) {
    const next = isPerfilPath ? '/auth?next=/perfil' : '/auth?next=/admin'
    return NextResponse.redirect(new URL(next, request.url))
  }

  // For admin routes, verify role in profiles table
  if (isAdminPath) {
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/perfil/:path*'],
}
