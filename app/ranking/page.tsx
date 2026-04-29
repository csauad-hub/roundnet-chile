export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'
import SeasonSelector from './SeasonSelector'

type Profile = { id: string; full_name: string | null; avatar_url: string | null }
type RankingEntry = {
  id: string
  position: number
  name: string
  points: number
  profile_id: string | null
  profiles: Profile | null
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>
}) {
  const { season: seasonParam } = await searchParams
  const season = Number(seasonParam ?? 2026)

  const supabase = await createClient()
  const { data: players } = await supabase
    .from('ranking')
    .select('*, profiles(id, full_name, avatar_url)')
    .eq('season', season)
    .order('points', { ascending: false })

  const entries = (players ?? []) as RankingEntry[]

  return (
    <div className="flex flex-col min-h-screen animate-in">
      <Topbar />
      <main className="flex-1 pb-24">
        <div className="flex items-center justify-between px-4 pt-4">
          <div>
            <h1 className="font-display font-black text-2xl text-slate-900">Ranking {season}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Temporada oficial</p>
          </div>
          <SeasonSelector season={season} />
        </div>

        <div className="px-4 mt-4">
          {entries.length === 0 ? (
            <div className="card px-4 py-8 text-center text-slate-400 text-sm">
              No hay datos de ranking para {season}.
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="flex items-center px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <span className="w-8 text-xs font-bold text-slate-400">#</span>
                <span className="flex-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Jugador</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pts</span>
              </div>
              {entries.map((player, idx) => {
                const nameRow = (
                  <>
                    {player.profiles?.avatar_url ? (
                      <img
                        src={player.profiles.avatar_url}
                        alt=""
                        className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-500">
                        {player.name[0]}
                      </div>
                    )}
                    <span className={`text-sm font-semibold truncate ${idx < 3 ? 'text-slate-900' : 'text-slate-700'}`}>
                      {player.name}
                    </span>
                  </>
                )

                const pos = idx + 1

                return (
                  <div
                    key={player.id}
                    className={`flex items-center px-4 py-3 ${idx < entries.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    <div className="w-8 flex-shrink-0">
                      {pos === 1 ? (
                        <span className="text-lg">🥇</span>
                      ) : pos === 2 ? (
                        <span className="text-lg">🥈</span>
                      ) : pos === 3 ? (
                        <span className="text-lg">🥉</span>
                      ) : (
                        <span className="text-sm font-bold text-slate-400">{pos}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {player.profiles?.id ? (
                        <Link
                          href={`/jugadores/${player.profiles.id}`}
                          className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-75 transition-opacity"
                        >
                          {nameRow}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {nameRow}
                        </div>
                      )}
                    </div>

                    <span className={`text-sm font-bold flex-shrink-0 ${idx < 3 ? 'text-blue-600' : 'text-slate-500'}`}>
                      {Number(player.points) % 1 === 0
                        ? Number(player.points).toLocaleString('es-CL')
                        : Number(player.points).toFixed(1)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
