import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const { tournament_id, player2_id, category, payment_proof, notes } = body

  if (!tournament_id || !player2_id || !category) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }
  if (user.id === player2_id) {
    return NextResponse.json({ error: 'No puedes inscribirte contigo mismo' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: tournament } = await admin
    .from('tournaments')
    .select('status, max_teams, name')
    .eq('id', tournament_id)
    .single()

  if (!tournament) return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 })
  if (tournament.status === 'finished' || tournament.status === 'cancelled') {
    return NextResponse.json({ error: 'El torneo no acepta inscripciones' }, { status: 400 })
  }

  const { data: p2 } = await admin.from('profiles').select('id, full_name').eq('id', player2_id).single()
  if (!p2) return NextResponse.json({ error: 'Jugador 2 no encontrado' }, { status: 404 })

  // Verificar que ninguno de los dos jugadores ya esté inscrito en esta categoría
  const { data: existing } = await admin
    .from('tournament_registrations')
    .select('id, player1_id, player2_id')
    .eq('tournament_id', tournament_id)
    .eq('category', category)
    .in('status', ['pending', 'confirmed'])

  const alreadyIn = (existing ?? []).some(
    r => r.player1_id === user.id || r.player2_id === user.id ||
         r.player1_id === player2_id || r.player2_id === player2_id
  )
  if (alreadyIn) {
    return NextResponse.json(
      { error: 'Uno de los jugadores ya tiene una inscripción activa en esta categoría' },
      { status: 409 }
    )
  }

  // Verificar cupo disponible
  if (tournament.max_teams) {
    const { count } = await admin
      .from('tournament_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('tournament_id', tournament_id)
      .eq('category', category)
      .in('status', ['pending', 'confirmed'])

    if ((count ?? 0) >= tournament.max_teams) {
      return NextResponse.json({ error: 'No hay cupos disponibles' }, { status: 409 })
    }
  }

  const { data, error } = await admin
    .from('tournament_registrations')
    .insert({
      tournament_id,
      player1_id: user.id,
      player2_id,
      category,
      payment_proof: payment_proof ?? null,
      notes: notes ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
