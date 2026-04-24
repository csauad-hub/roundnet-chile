export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Trophy, MapPin, Calendar, Users, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const statusLabel: Record<string, string> = {
  upcoming: 'Próximo',
  ongoing: 'En curso',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
}

const statusStyle: Record<string, string> = {
  upcoming: 'bg-blue-50 text-blue-700 border border-blue-200',
  ongoing: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  finished: 'bg-slate-100 text-slate-500 border border-slate-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
}

const PAST_PER_PAGE = 10

export default async function TorneosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params?.page || '1'))

  const supabase = await createClient()
  const { data: torneos } = await supabase
    .from('tournaments')
    .select('*')
    .order('date', { ascending: false })

  const all = torneos ?? []
  const upcoming = all.filter(t => t.status === 'upcoming' || t.status === 'ongoing')
  const allPast = all
    .filter(t => t.status === 'finished' || t.status === 'cancelled')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const totalPastPages = Math.ceil(allPast.length / PAST_PER_PAGE)
  const past = allPast.slice((page - 1) * PAST_PER_PAGE, page * PAST_PER_PAGE)

  return (
    <div className="flex flex-col min-h-screen animate-in">
      <Topbar title="Torneos" />
      <main className="flex-1 pb-24 bg-white">
        {upcoming.length > 0 ? (
          <section className="mt-4">
            <h2 className="section-title px-4 mb-2.5">Próximos &amp; En curso</h2>
            <div className="px-4 flex flex-col gap-3">
              {upcoming.map(t => (
                <div key={t.id} className="card p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-display font-black text-base text-slate-800 leading-tight flex-1">{t.name}</h3>
                    <span className={cn('badge flex-shrink-0', statusStyle[t.status] ?? statusStyle.upcoming)}>
                      {statusLabel[t.status] ?? t.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    {t.date && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={13} className="text-blue-400" />
                        {new Date(t.date).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    )}
                    {(t.city || t.location) && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={13} className="text-blue-400" />
                        {[t.city, t.location].filter(Boolean).join(' · ')}
                      </div>
                    )}
                    {t.category && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Users size={13} className="text-blue-400" />
                        {t.category}{t.max_teams && ` · Máx ${t.max_teams} equipos`}
                      </div>
                    )}
                  </div>
                  {t.description && <p className="text-sm text-slate-400 mb-4">{t.description}</p>}
                  <div className="flex items-center gap-3">
                    {t.fwango_url && (
                      <a href={t.fwango_url} target="_blank" rel="noopener noreferrer"
                        className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2">
                        <ExternalLink size={12} />
                        Inscribirse en Fwango
                      </a>
                    )}
                    {t.price_per_team && (
                      <span className="text-xs text-slate-400">
                        ${t.price_per_team.toLocaleString('es-CL')} / equipo
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="px-4 mt-6">
            <div className="card p-6 text-center">
              <Trophy size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No hay torneos próximos</p>
              <p className="text-xs text-slate-400 mt-1">Los próximos torneos aparecerán aquí</p>
            </div>
          </div>
        )}

        {allPast.length > 0 && (
          <section className="mt-6 mb-4">
            <div className="flex items-center justify-between px-4 mb-2.5">
              <h2 className="section-title">Pasados</h2>
              {allPast.length > PAST_PER_PAGE && (
                <span className="text-xs text-slate-400">{allPast.length} torneos</span>
              )}
            </div>
            <div className="px-4 flex flex-col gap-2">
              {past.map(t => (
                <div key={t.id} className="card flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{t.name}</p>
                    <p className="text-xs text-slate-400">
                      {t.city}{t.date && ` · ${new Date(t.date).toLocaleDateString('es-CL')}`}
                    </p>
                  </div>
                  <span className={cn('badge', statusStyle[t.status] ?? statusStyle.finished)}>
                    {statusLabel[t.status] ?? t.status}
                  </span>
                </div>
              ))}
            </div>

            {totalPastPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-5 px-4">
                {page > 1 ? (
                  <Link href={`/torneos?page=${page - 1}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    <ChevronLeft size={16} /> Anterior
                  </Link>
                ) : (
                  <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-300 cursor-not-allowed">
                    <ChevronLeft size={16} /> Anterior
                  </span>
                )}
                <span className="text-sm text-slate-500 font-medium">{page} / {totalPastPages}</span>
                {page < totalPastPages ? (
                  <Link href={`/torneos?page=${page + 1}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    Siguiente <ChevronRight size={16} />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-300 cursor-not-allowed">
                    Siguiente <ChevronRight size={16} />
                  </span>
                )}
              </div>
            )}
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
