import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return admin
}

async function recalcPositions(admin: ReturnType<typeof createAdminClient>, season: number) {
  const { data } = await admin
    .from('ranking')
    .select('id')
    .eq('season', season)
    .order('points', { ascending: false })
  if (!data) return
  await Promise.all(
    data.map((entry, idx) =>
      admin.from('ranking').update({ position: idx + 1 }).eq('id', entry.id)
    )
  )
}

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  const { name, points, season, profile_id } = await req.json()
  if (!name || points === undefined || !season) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { error } = await admin.from('ranking').insert({
    name: name.trim(),
    points: Number(points),
    season: Number(season),
    category: 'General',
    position: 0,
    profile_id: profile_id || null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await recalcPositions(admin, Number(season))
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  const { id, name, points, season, profile_id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  const { error } = await admin.from('ranking').update({
    name: name.trim(),
    points: Number(points),
    season: Number(season),
    profile_id: profile_id || null,
  }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await recalcPositions(admin, Number(season))
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  const { id, season } = await req.json()
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  const { error } = await admin.from('ranking').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await recalcPositions(admin, Number(season))
  return NextResponse.json({ ok: true })
}
