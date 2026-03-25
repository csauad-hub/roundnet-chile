import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, Users, Newspaper, TrendingUp, Plus, ArrowRight } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [{ count: tournamentsCount }, { count: usersCount }] = await Promise.all([
    supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  const { data: recentTournaments } = await supabase
    .from('tournaments')
    .select('id, name, date, status, city')
    .order('created_at', { ascending: false })
    .limit(5)

  const statusLabel: Record<string, string> = {
    upcoming: 'Próximo',
    ongoing: 'En curso',
    finished: 'Finalizado',
    cancelled: 'Cancelado',
  }

  const statusColor: Record<string, string> = {
    upcoming: '#00E5FF',
    ongoing: '#22c55e',
    finished: 'rgba(255,255,255,0.4)',
    cancelled: '#ef4444',
  }

  return (
    <div className="py-6 space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Resumen general de Roundnet Chile
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl p-5 border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} style={{ color: '#00E5FF' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Torneos</span>
          </div>
          <p className="text-3xl font-bold text-white">{tournamentsCount ?? 0}</p>
        </div>

        <div className="rounded-xl p-5 border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} style={{ color: '#7B2FFF' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Usuarios</span>
          </div>
          <p className="text-3xl font-bold text-white">{usersCount ?? 0}</p>
        </div>

        <div className="rounded-xl p-5 border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Newspaper size={16} style={{ color: '#f59e0b' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Noticias</span>
          </div>
          <p className="text-3xl font-bold text-white">—</p>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin/torneos/nuevo" className="flex items-center gap-3 rounded-xl p-4 border transition-all hover:border-cyan-400/30" style={{ background: 'rgba(0,229,255,0.05)', borderColor: 'rgba(0,229,255,0.15)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,229,255,0.15)' }}>
              <Plus size={16} style={{ color: '#00E5FF' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Nuevo Torneo</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Crear evento</p>
            </div>
          </Link>

          <Link href="/admin/torneos" className="flex items-center gap-3 rounded-xl p-4 border transition-all hover:border-purple-400/30" style={{ background: 'rgba(123,47,255,0.05)', borderColor: 'rgba(123,47,255,0.15)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(123,47,255,0.15)' }}>
              <TrendingUp size={16} style={{ color: '#7B2FFF' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Ver Torneos</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Gestionar</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent tournaments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Torneos recientes</h2>
          <Link href="/admin/torneos" className="text-xs flex items-center gap-1 hover:underline" style={{ color: '#00E5FF' }}>
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {recentTournaments && recentTournaments.length > 0 ? (
            recentTournaments.map((t, i) => (
              <Link
                key={t.id}
                href={`/admin/torneos/editar/${t.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {t.city} · {t.date ? new Date(t.date).toLocaleDateString('es-CL') : '—'}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: statusColor[t.status] || 'rgba(255,255,255,0.4)', background: `${statusColor[t.status] || 'rgba(255,255,255,0.4)'}20` }}>
                  {statusLabel[t.status] || t.status}
                </span>
              </Link>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              No hay torneos aún.{' '}
              <Link href="/admin/torneos/nuevo" style={{ color: '#00E5FF' }}>Crear uno</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
