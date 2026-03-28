import { NextResponse, type NextRequest } from 'next/server'

function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
    const decoded = atob(padded)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  const path = request.nextUrl.pathname
  const isAdminPath = path.startsWith('/admin')
  const isPerfilPath = path.startsWith('/perfil')
  if (!isAdminPath && !isPerfilPath) {
    return NextResponse.next({ request })
  }

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

  let accessToken: string | undefined
  if (tokenValue) {
    try {
      accessToken = JSON.parse(decodeURIComponent(tokenValue)).access_token
    } catch {
      try { accessToken = JSON.parse(tokenValue).access_token } catch {}
    }
  }

  if (!accessToken) {
    const next = isPerfilPath ? '/auth?next=/perfil' : '/auth?next=/admin'
    return NextResponse.redirect(new URL(next, request.url))
  }

  const payload = decodeJWTPayload(accessToken)
  if (!payload) {
    const next = isPerfilPath ? '/auth?next=/perfil' : '/auth?next=/admin'
    return NextResponse.redirect(new URL(next, request.url))
  }

  const exp = payload.exp as number | undefined
  if (exp && exp < Date.now() / 1000) {
    const next = isPerfilPath ? '/auth?next=/perfil' : '/auth?next=/admin'
    return NextResponse.redirect(new URL(next, request.url))
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: ['/admin/:path*', '/perfil/:path*'],
}
