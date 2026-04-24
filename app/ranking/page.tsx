export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria = 'Varones' } = await searchParams

  const supabase = await createClient()
  const { data: players } = await supabase
    .from('ranking')
    .select('*')
    .eq('season', 2025)
    .eq('category', categoria)
    .order('position')

  return (
    <div className="flex flex-col min-h-screen animate-in">
      <Topbar />
      <main className="flex-1 pb-24">
        <div className="px-4 pt-4">
          <h1 className="font-display font-black text-2xl text-slate-900">Ranking 2025</h1>
          <p className="text-sm text-slate-500 mt-0.5">Temporada oficial</p>
        </div>

        <div className="flex gap-2 px-4 mt-4">
          {(['Varones', 'Damas'] as const).map(cat => (
            <Link
              key={cat}
              href={`/ranking?categoria=${cat}`}
              className={`flex-1 text-center py-2 rounded-xl text-sm font-semibold transition-colors ${
                categoria === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        <div className="px-4 mt-4">
          {!players || players.length === 0 ? (
            <div className="card px-4 py-8 text-center text-slate-400 text-sm">
              No hay datos de ranking aún.
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="flex items-center px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <span className="w-8 text-xs font-bold text-slate-400">#</span>
                <span className="flex-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Jugador</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pts</span>
              </div>
              {players.map((player, idx) => (
                <div
                  key={player.id}
                  className={`flex items-center px-4 py-3 ${idx < players.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <div className="w-8 flex-shrink-0">
                    {player.position === 1 ? (
                      <span className="text-lg">🥇</span>
                    ) : player.position === 2 ? (
                      <span className="text-lg">🥈</span>
                    ) : player.position === 3 ? (
                      <span className="text-lg">🥉</span>
                    ) : (
                      <span className="text-sm font-bold text-slate-400">{player.position}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${idx < 3 ? 'text-slate-900' : 'text-slate-700'}`}>
                      {player.name}
                    </p>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${idx < 3 ? 'text-blue-600' : 'text-slate-500'}`}>
                    {Number(player.points) % 1 === 0
                      ? Number(player.points).toLocaleString('es-CL')
                      : Number(player.points).toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
