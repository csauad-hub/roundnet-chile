export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ChevronRight, Newspaper, ExternalLink, Trophy } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'
import { formatDate } from '@/lib/utils'
import { createClient } from '@supabase/supabase-js'

// Update this URL with the actual Google Drive ranking sheet
const RANKING_URL = 'https://drive.google.com'

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [{ data: newsData }, { data: torneoData }] = await Promise.all([
    supabase
      .from('news')
      .select('id, title, description, image_url, published_at, created_at, category')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('tournaments')
      .select('id, name, date, city, location, fwango_url, status')
      .in('status', ['upcoming', 'ongoing'])
      .order('date', { ascending: true })
      .limit(1),
  ])

  const news = newsData ?? []
  const torneo = torneoData?.[0] ?? null

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
                {new Date(torneo.date).toLocaleDateString('es-CL', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            )}
            {torneo.fwango_url && (
              <a
                href={torneo.fwango_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 bg-white text-blue-700 font-display font-bold text-xs px-5 py-2.5 rounded-full shadow-md"
              >
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
            {news.length === 0 ? (
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
          <h2 className="section-title mb-2.5">Ranking</h2>
          <a
            href={RANKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-4 px-4 py-4"
          >
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0 text-2xl">
              🏆
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">Ranking Nacional</p>
              <p className="text-xs text-slate-400 mt-0.5">El ranking se actualiza externamente. Toca para ver la tabla completa.</p>
            </div>
            <ExternalLink size={16} className="text-slate-300 flex-shrink-0" />
          </a>
        </div>

      </main>
      <BottomNav />
    </div>
  )
}
