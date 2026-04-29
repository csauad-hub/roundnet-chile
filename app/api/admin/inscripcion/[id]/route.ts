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

// PATCH: confirmar o cancelar inscripción
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  const { id } = await params
  const { status } = await req.json()

  if (!['confirmed', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const { error } = await admin
    .from('tournament_registrations')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// GET: obtener URL firmada del comprobante
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  const { id } = await params
  const { data: reg } = await admin
    .from('tournament_registrations')
    .select('payment_proof')
    .eq('id', id)
    .single()

  if (!reg?.payment_proof) return NextResponse.json({ error: 'Sin comprobante' }, { status: 404 })

  const { data } = await admin.storage
    .from('comprobantes')
    .createSignedUrl(reg.payment_proof, 120)

  return NextResponse.json({ url: data?.signedUrl ?? null })
}
