import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()

    // Extract project ref from Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]
    if (!projectRef) return NextResponse.json({ role: 'user' })

    // Reassemble chunked auth token cookie
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

    if (!tokenValue) return NextResponse.json({ role: 'guest' })

    // Decode base64 session to extract access_token
    let accessToken: string | undefined
    try {
      const decoded = JSON.parse(
        Buffer.from(tokenValue, 'base64').toString('utf-8')
      )
      accessToken = decoded.access_token
    } catch {
      try {
        const decoded = JSON.parse(
          Buffer.from(tokenValue, 'base64url').toString('utf-8')
        )
        accessToken = decoded.access_token
      } catch {}
    }

    if (!accessToken) return NextResponse.json({ role: 'guest' })

    // Use admin client to verify token and fetch profile (bypasses RLS)
    const admin = createAdminClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user } } = await admin.auth.getUser(accessToken)
    if (!user) return NextResponse.json({ role: 'guest' })

    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ role: profile?.role ?? 'user' })
  } catch {
    return NextResponse.json({ role: 'user' })
  }
}
