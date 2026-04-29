export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import BottomNav from '@/components/layout/BottomNav'
import InscripcionModal from './InscripcionModal'

const statusLabel: Record<string, string> = {
  upcoming: 'Próximo',
  ongoing: 'En curso',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
}
const statusStyle: Record<string, string> = {
  upcoming: 'bg-blue-50 text-blue-700 border border-blue-200',
  ongoing:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  finished: 'bg-slate-100 text-slate-500 border border-slate-200',
  cancelled:'bg-red-50 text-red-600 border border-red-200',
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: t }, { data: registrations }] = await Promise.all([
    admin.from('tournaments').select('*').eq('id', id).single(),
    admin
      .from('tournament_registrations')
      .select('id, player1_id, player2_id, category, status, profiles!player1_id(full_name, avatar_url), profiles!player2_id(full_name, avatar_url)')
      .eq('tournament_id', id)
      .eq('status', 'confirmed')
      .order('registered_at'),
  ])

  if (!t) notFound()

  // Si el usuario está logueado, verificar si ya está inscrito
  let userRegistration = null
  if (user) {
    const { data } = await admin
      .from('tournament_registrations')
      .select('id, status, category')
      .eq('tournament_id', id)
      .in('status', ['pending', 'confirmed'])
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .maybeSingle()
    userRegistration = data
  }

  const canRegister =
    user &&
    !userRegistration &&
    (t.status === 'upcoming' || t.status === 'ongoing')

  const confirmedCount = registrations?.length ?? 0

  return (
    <div className="flex flex-col min-h-screen animate-in bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/torneos">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <span className="font-display font-bold text-sm flex-1 truncate text-slate-800">{t.name}</span>
        </div>
      </div>

      <main className="flex-1 pb-32">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-50 to-slate-100 px-5 pt-5 pb-6 border-b border-slate-200">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusStyle[t.status] ?? statusStyle.upcoming}`}>
            {statusLabel[t.status] ?? t.status}
          </span>
          <h1 className="font-display font-black text-2xl text-slate-800 mt-2 leading-tight">{t.name}</h1>
          {(t.city || t.location) && (
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin size={13} />
              {[t.location, t.city].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        <div className="px-4 py-5 space-y-4">
          {/* Info cards */}
          <div className="card p-4 grid grid-cols-2 gap-4">
            {t.date && (
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Calendar size={10} /> Fecha
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {new Date(t.date).toLocaleDateString('es-CL', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            )}
            {t.category && (
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Trophy size={10} /> Categoría
                </p>
                <p className="text-sm font-semibold text-slate-800">{t.category}</p>
              </div>
            )}
            {t.max_teams && (
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Users size={10} /> Equipos
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {confirmedCount} / {t.max_teams}
                  <span className="text-xs text-slate-400 ml-1">confirmados</span>
                </p>
              </div>
            )}
            {t.price_per_team && (
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                  <DollarSign size={10} /> Inscripción
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  ${Number(t.price_per_team).toLocaleString('es-CL')}
                  <span className="text-xs text-slate-400 ml-1">/ equipo</span>
                </p>
              </div>
            )}
          </div>

          {/* Cupos */}
          {t.max_teams && (t.status === 'upcoming' || t.status === 'ongoing') && (
            <div className="card p-4">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Cupos ocupados</span>
                <span className="font-bold text-blue-600">
                  {confirmedCount}/{t.max_teams} ({Math.round((confirmedCount / t.max_teams) * 100)}%)
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((confirmedCount / t.max_teams) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* Descripción */}
          {t.description && (
            <div className="card p-4">
              <p className="text-sm text-slate-600 leading-relaxed">{t.description}</p>
            </div>
          )}

          {/* Estado inscripción del usuario */}
          {userRegistration && (
            <div className={`card p-4 border-l-4 ${
              userRegistration.status === 'confirmed'
                ? 'border-l-emerald-500 bg-emerald-50'
                : 'border-l-amber-400 bg-amber-50'
            }`}>
              <p className="text-sm font-semibold text-slate-700">
                {userRegistration.status === 'confirmed'
                  ? '✅ Tu inscripción está confirmada'
                  : '⏳ Inscripción pendiente de verificación'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Categoría: {userRegistration.category}
              </p>
            </div>
          )}

          {/* Lista de equipos inscritos */}
          {registrations && registrations.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                Equipos confirmados ({registrations.length})
              </h2>
              <div className="card overflow-hidden">
                {registrations.map((reg, i) => {
                  const p1 = reg.profiles as unknown as { full_name: string | null; avatar_url: string | null }[] | null
                  const p1data = Array.isArray(p1) ? p1[0] : p1
                  const p2 = (reg as Record<string, unknown>)['profiles!player2_id'] as { full_name: string | null; avatar_url: string | null } | null

                  const name1 = p1data?.full_name ?? 'Jugador'
                  const name2 = p2?.full_name ?? 'Jugador'

                  return (
                    <div
                      key={reg.id}
                      className={`flex items-center gap-3 px-4 py-3 ${i < registrations.length - 1 ? 'border-b border-slate-100' : ''}`}
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {name1} & {name2}
                        </p>
                        <p className="text-xs text-slate-400">{reg.category}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Botón de inscripción o info de datos bancarios */}
      {(canRegister || !user) && (t.status === 'upcoming' || t.status === 'ongoing') && (
        <div className="fixed bottom-[72px] left-0 right-0 px-4 pb-3 bg-white/95 backdrop-blur border-t border-slate-100 z-30">
          {!user ? (
            <Link
              href="/auth?next=/torneos"
              className="block w-full mt-3 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold text-center shadow-md"
            >
              Inicia sesión para inscribirte
            </Link>
          ) : (
            <InscripcionModal
              tournamentId={t.id}
              tournamentName={t.name}
              pricePerTeam={t.price_per_team}
              userId={user.id}
            />
          )}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
