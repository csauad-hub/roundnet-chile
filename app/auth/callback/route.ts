import { NextResponse, type NextRequest } from 'next/server'

// Cookie chunk size used by @supabase/ssr
const CHUNK_SIZE = 3180

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

  if (!code) {
        return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
    const verifierCookieName = `sb-${projectRef}-auth-token-code-verifier`

  // @supabase/ssr v0.3.0 bug: createBrowserClient stores the PKCE verifier as
  // encodeURIComponent(JSON.stringify(value)), so after Next.js URL-decodes the
  // cookie we get '"verifier"' (with JSON quotes). Parse it out.
  const rawVerifier = request.cookies.get(verifierCookieName)?.value ?? null
    let codeVerifier: string | null = null
    if (rawVerifier !== null) {
          try {
                  const parsed = JSON.parse(rawVerifier)
                  codeVerifier = typeof parsed === 'string' ? parsed : rawVerifier
          } catch {
                  codeVerifier = rawVerifier
          }
    }

  if (!codeVerifier) {
        console.error('[callback] PKCE verifier missing from cookies')
        return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`)
  }

  // Exchange the auth code for a session via Supabase REST API directly,
  // bypassing @supabase/ssr v0.3.0's broken exchangeCodeForSession.
  const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
        method: 'POST',
        headers: {
                'Content-Type': 'application/json',
                apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
                auth_code: code,
                code_verifier: codeVerifier,
        }),
  })

  if (!tokenRes.ok) {
        const errBody = await tokenRes.json().catch(() => ({}))
        console.error('[callback] token exchange failed:', JSON.stringify(errBody))
        return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`)
  }

  const session = await tokenRes.json()

  const response = NextResponse.redirect(`${origin}${next}`)

  // Write session cookies manually, bypassing @supabase/ssr v0.3.0's broken
  // setSession() which does not call setAll() and therefore never persists the
  // session to response cookies.
  //
  // @supabase/ssr stores sessions as raw JSON, chunked into 3180-char cookies:
  //   sb-<ref>-auth-token.0, sb-<ref>-auth-token.1, … (if > 3180 chars)
  //   sb-<ref>-auth-token                            (if <= 3180 chars)
  const sessionKey = `sb-${projectRef}-auth-token`
    const sessionJson = JSON.stringify(session)

  const cookieOpts = {
        path: '/',
        sameSite: 'lax' as const,
        secure: true,
        maxAge: session.expires_in ?? 3600,
  }

  // Clear any stale chunk cookies from previous sessions
  for (let i = 0; i < 5; i++) {
        response.cookies.delete(`${sessionKey}.${i}`)
  }

  if (sessionJson.length > CHUNK_SIZE) {
        const numChunks = Math.ceil(sessionJson.length / CHUNK_SIZE)
        for (let i = 0; i < numChunks; i++) {
                response.cookies.set(
                          `${sessionKey}.${i}`,
                          sessionJson.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
                          cookieOpts
                        )
        }
        response.cookies.delete(sessionKey)
  } else {
        response.cookies.set(sessionKey, sessionJson, cookieOpts)
  }

  // Clean up the PKCE verifier cookie
  response.cookies.delete(verifierCookieName)

  return response
}
