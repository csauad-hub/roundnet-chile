import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]

  let accessToken: string | undefined
  let refreshToken: string | undefined

  if (projectRef) {
    const baseName = `sb-${projectRef}-auth-token`
    let tokenValue = cookieStore.get(baseName)?.value
    if (!tokenValue) {
      const chunks: string[] = []
      for (let i = 0; i < 10; i++) {
        const chunk = cookieStore.get(`${baseName}.${i}`)?.value
        if (!chunk) break
        chunks.push(chunk)
      }
      if (chunks.length > 0) tokenValue = chunks.join('')
    }
    if (tokenValue) {
      try {
        const decoded = JSON.parse(decodeURIComponent(tokenValue))
        accessToken = decoded.access_token
        refreshToken = decoded.refresh_token
      } catch {
        try {
          const decoded = JSON.parse(tokenValue)
          accessToken = decoded.access_token
          refreshToken = decoded.refresh_token
        } catch {}
      }
    }
  }

  const supabase = createSupabaseClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
  }

  return supabase
}
