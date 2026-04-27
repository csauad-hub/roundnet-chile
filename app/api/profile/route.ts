import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  const admin = createAdminClient()

  const payload = {
    full_name: body.full_name || null,
    city: body.city || null,
    region: body.region || null,
    instagram: body.instagram ? body.instagram.replace('@', '') : null,
    phone: body.phone || null,
    visible_in_directory: body.visible_in_directory === true,
    updated_at: new Date().toISOString(),
  }

  // Try UPDATE first
  const { data: updated, error: updateError } = await admin
    .from('profiles')
    .update(payload)
    .eq('id', user.id)
    .select('id, full_name, visible_in_directory')

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // If no row existed yet, INSERT it
  if (!updated || updated.length === 0) {
    const { data: inserted, error: insertError } = await admin
      .from('profiles')
      .insert({ id: user.id, ...payload })
      .select('id, full_name, visible_in_directory')
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, saved: inserted })
  }

  return NextResponse.json({ ok: true, saved: updated[0] })
}
