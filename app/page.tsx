export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ChevronRight, Newspaper } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: news }, { data: torneoData }, { data: varones }, { data: damas }] = await Promise.all([
    supabase.from('news').select('*').order('published_at', { ascending: false, nullsFirst: false }).limit(3),
    supabase.from('tournaments').select('*').in('status', ['upcoming', 'ongoing']).order('date').limit(1),
    supabase.from('ranking').select('*').eq('category', 'Varones').eq('season', 2025).order('position').limit(3),
    supabase.from('ranking').select('*').eq('category', 'Damas').eq('season', 2025).order('position').limit(3),
  ])

  const torneo = torneoData?.[0] ?? null

  const medal = (pos: number) =>
    pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : String(pos)

  return (
    <div className="flex flex-col min-h-screen animate-in">
      <Topbar />
      <main className="flex-1 pb-24">
        {/* Próximo Torneo */}
        {torneo ? (
          <div className="mx-4 mt-4 bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl p-6 relative overflow-hidden shadow-lg">
            <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/5" />
            <div className="absolute bottom-0 left-0 right-0 h-1 opacity-40" style={{ background: 'linear-gradient(90deg,#C8102E 50%,white 50%)' }} />
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase bg-white/15 text-white/90 px-3 py-1.5 rounded-full mb-3">
              {torneo.status === 'ongoing' ? '🔴 En curso' : '🏆 Próximo Torneo'}
            </span>
            <h1 className="font-display font-black text-3xl text-white leading-tight">{torneo.name}</h1>
            {(torneo.location || torneo.city) && (
              <p className="text-sm text-white/70 mt-2">
                {[torneo.location, torneo.city].filter(Boolean).join(' · ')}
              </p>
            )}
            {torneo.date && (
              <p className="text-xs text-white/50 mt-1">
                {new Date(torneo.date).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            {torneo.fwango_url && (
              <a href={torneo.fwango_url} target="_blank" rel="noopener noreferrer"
                className="inline-block mt-4 bg-white text-blue-700 font-display font-bold text-xs px-5 py-2.5 rounded-full shadow-md">
                Ver detalles →
              </a>
            )}
          </div>
        ) : (
          <div className="mx-4 mt-4 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg">
            <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/5" />
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase bg-white/15 text-white/90 px-3 py-1.5 rounded-full mb-3">🏆 Torneos</span>
            <h1 className="font-display font-black text-2xl text-white leading-tight">No hay torneos próximos</h1>
            <p className="text-sm text-white/60 mt-2">Pronto se anunciarán nuevas fechas. ¡Mantente atento!</p>
            <Link href="/torneos" className="inline-block mt-4 bg-white text-slate-700 font-display font-bold text-xs px-5 py-2.5 rounded-full shadow-md">
              Ver historial →
            </Link>
          </div>
        )}

        {/* Últimas Noticias */}
        <div className="mt-5">
          <div className="flex items-center justify-between px-4 mb-2.5">
            <h2 className="section-title">Últimas noticias</h2>
            <Link href="/noticias" className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">Ver todo <ChevronRight size={14} /></Link>
          </div>
          <div className="px-4 flex flex-col gap-2.5">
            {!news || news.length === 0 ? (
              <div className="card px-4 py-6 text-center text-sm text-slate-400">No hay noticias aún.</div>
            ) : (
              news.map(n => (
                <Link key={n.id} href={`/noticias/${n.id}`} className="card flex gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden bg-blue-50 flex items-center justify-center">
                    {n.image_url ? (
                      <img src={n.image_url} alt={n.title} className="w-full h-full object-cover" />
                    ) : (
                      <Newspaper size={20} className="text-blue-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {n.category && <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{n.category}</p>}
                    <p className="text-sm font-semibold text-slate-800 leading-snug mt-0.5 line-clamp-2">{n.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {n.published_at ? formatDate(n.published_at) : formatDate(n.created_at)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Ranking */}
        <div className="mt-5 px-4">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="section-title">Ranking 2025</h2>
            <Link href="/ranking" className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">Ver todo <ChevronRight size={14} /></Link>
          </div>
          <div className="card overflow-hidden">
            <div className="px-4 pt-3 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2">Varones</p>
              {!varones || varones.length === 0 ? (
                <p className="text-xs text-slate-400 py-1">Sin datos</p>
              ) : (
                varones.map((p, i) => (
                  <div key={p.id} className={`flex items-center py-2 ${i < varones.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <span className="w-7 text-base">{medal(p.position)}</span>
                    <span className="flex-1 text-sm font-semibold text-slate-800 truncate">{p.name}</span>
                    <span className="text-sm font-bold text-blue-600">
                      {Number(p.points) % 1 === 0
                        ? Number(p.points).toLocaleString('es-CL')
                        : Number(p.points).toFixed(1)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-slate-100 mx-4" />
            <div className="px-4 pt-3 pb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-pink-500 mb-2">Damas</p>
              {!damas || damas.length === 0 ? (
                <p className="text-xs text-slate-400 py-1">Sin datos</p>
              ) : (
                damas.map((p, i) => (
                  <div key={p.id} className={`flex items-center py-2 ${i < damas.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <span className="w-7 text-base">{medal(p.position)}</span>
                    <span className="flex-1 text-sm font-semibold text-slate-800 truncate">{p.name}</span>
                    <span className="text-sm font-bold text-pink-500">
                      {Number(p.points) % 1 === 0
                        ? Number(p.points).toLocaleString('es-CL')
                        : Number(p.points).toFixed(1)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
