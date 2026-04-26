import { createServerClient, type CookieMethodsServer, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const cookieStore = await cookies()

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as any))
      } catch { /* server components are read-only — safe to ignore */ }
    },
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  )
}
