'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'
import { MOCK_PLAYERS } from '@/lib/mock-data'
import { cn, formatDate, formatCLP, STATUS_LABELS, STATUS_STYLES, avatarColor, getInitials } from '@/lib/utils'

type Tournament = {
  id: string
  name: string
  location: string
  city: string
  date: string
  status: string
  registered_teams: number
  max_teams: number
  price_per_team: number
  category: string
  winner: string | null
}

const SUPABASE_URL = 'https://aqyhtzhomxwpcwbbqpap.supabase.co'
const SUPABASE_KEY = 'sb_publishable_WD60P4YxbkG4jsY7Eyc_ZA_s_QODGQO'

export default function TorneosPage() {
  const [tab, setTab] = useState<'torneos'|'ranking'>('torneos')
  const [filter, setFilter] = useState('all')
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = filter === 'all'
      ? 'select=*&order=date.desc'
      : `select=*&status=eq.${filter}&order=date.desc`
    fetch(`${SUPABASE_URL}/rest/v1/tournaments?${params}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    })
      .then(r => r.json())
      .then(data => { setTournaments(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filter])

  return (<div className="flex flex-col min-h-screen animate-in"><Topbar title="Torneos" />
    <div className="flex bg-white border-b border-slate-200">
      {(['torneos','ranking'] as const).map(t => (<button key={t} onClick={() => setTab(t)} className={cn('tab-item flex-1 text-center',tab===t&&'active')}>{t==='torneos'?'Calendario':'Ranking Nacional'}</button>))}
    </div>
    <main className="flex-1 pb-24">
      {tab==='torneos' && (<>
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {[{v:'all',l:'Todos'},{v:'open',l:'Abiertas'},{v:'soon',l:'Próximos'},{v:'finished',l:'Finalizados'}].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)} className={cn('flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold font-display border-2 transition-all',filter===f.v?'bg-blue-600 border-blue-600 text-white':'bg-white border-slate-200 text-slate-500')}>{f.l}</button>
          ))}
        </div>
        <div className="px-4 flex flex-col gap-3 pb-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Cargando torneos...</div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No hay torneos disponibles</div>
          ) : tournaments.map(t => (<Link key={t.id} href={'/torneos/'+t.id}><div className="card overflow-hidden hover:border-blue-300 hover:shadow-md transition-all">
            <div className="bg-gradient-to-br from-blue-50 to-slate-100 px-5 py-4 border-b border-slate-200">
              <span className={cn('badge',STATUS_STYLES[t.status])}>{STATUS_LABELS[t.status]}</span>
              <h3 className="font-display font-black text-lg text-blue-700 mt-2">{t.name}</h3>
              <p className="text-xs text-slate-500 mt-1">📍 {t.location}, {t.city}</p>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                <span>📅 <strong className="text-slate-700">{formatDate(t.date)}</strong></span>
                <span>👥 <strong className="text-slate-700">{t.registered_teams}/{t.max_teams}</strong></span>
                <span>💰 <strong className="text-slate-700">{formatCLP(t.price_per_team)}</strong></span>
                <span>🏆 <strong className="text-slate-700">{t.category}</strong></span>
              </div>
              {t.winner && <p className="mt-2 text-xs">🥇 <strong>{t.winner}</strong></p>}
              <div className={cn('mt-4 w-full text-center py-3 rounded-xl font-display font-bold text-sm',t.status==='open'?'bg-blue-600 text-white':'bg-slate-100 text-slate-400')}>
                {t.status==='open'?'Inscribirse →':t.status==='soon'?'Próximamente':'Ver resultados'}
              </div>
            </div>
          </div></Link>))}
        </div>
      </>)}
      {tab==='ranking' && (<div className="px-4 pt-4 flex flex-col gap-2">
        {MOCK_PLAYERS.map((p,i) => (<div key={p.id} className={cn('card flex items-center gap-3 px-4 py-3',i===0&&'border-yellow-300 bg-yellow-50/60',i===1&&'border-slate-300',i===2&&'border-orange-200')}>
          <div className={cn('font-display font-black text-lg w-7 text-center',i<3?['text-yellow-500','text-slate-400','text-orange-400'][i]:'text-slate-300')}>{i<3?['🥇','🥈','🥉'][i]:i+1}</div>
          <div className={cn('avatar w-9 h-9 text-xs',avatarColor(p.full_name))}>{getInitials(p.full_name)}</div>
          <div className="flex-1"><p className="font-semibold text-sm">{p.full_name}</p><p className="text-xs text-slate-400">{p.city}</p></div>
          <div className="text-right"><p className="font-display font-black text-lg text-blue-600">{p.ranking_points.toLocaleString('es-CL')}</p><p className="text-[10px] text-slate-400">pts</p></div>
        </div>))}
      </div>)}
    </main><BottomNav /></div>)
}
