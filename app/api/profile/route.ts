import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json() as {
    full_name?: string | null
    city?: string | null
    region?: string | null
    instagram?: string | null
    phone?: string | null
    visible_in_directory?: boolean
  }

  // Service role key bypasses RLS entirely — safe here because
  // we enforce user identity server-side with getUser()
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: saved, error } = await admin
    .from('profiles')
    .upsert(
      {
        id: user.id,
        full_name: body.full_name || null,
        city: body.city || null,
        region: body.region || null,
        instagram: body.instagram?.replace('@', '') || null,
        phone: body.phone || null,
        visible_in_directory: body.visible_in_directory ?? false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('id, full_name, visible_in_directory')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, saved })
}
