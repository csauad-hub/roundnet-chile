import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response.cookies.set(name, value, options as any)
          )
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            response.headers.set(key, value)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    const redirectTo = isPerfilPath ? '/auth?next=/perfil' : '/auth?next=/admin'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/perfil/:path*'],
}
