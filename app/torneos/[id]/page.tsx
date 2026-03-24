import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Trophy, Share2 } from 'lucide-react'
import { MOCK_TOURNAMENTS } from '@/lib/mock-data'
import { formatDate, formatCLP, STATUS_LABELS, STATUS_STYLES, cn } from '@/lib/utils'
import BottomNav from '@/components/layout/BottomNav'
export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const t = MOCK_TOURNAMENTS.find(t => t.id===params.id)
  if (!t) notFound()
  const pct = Math.round((t.registered_teams/t.max_teams)*100)
  return (<div className="flex flex-col min-h-screen animate-in">
    <div className="top-stripe" />
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200"><div className="flex items-center gap-3 px-4 py-3"><Link href="/torneos"><ArrowLeft size={20} className="text-slate-600" /></Link><span className="font-display font-bold text-sm flex-1 truncate">{t.name}</span><Share2 size={18} className="text-slate-500" /></div></div>
    <main className="flex-1 pb-24">
      <div className="bg-gradient-to-br from-blue-50 to-slate-100 px-5 pt-5 pb-6 border-b border-slate-200">
        <span className={cn('badge',STATUS_STYLES[t.status])}>{STATUS_LABELS[t.status]}</span>
        <h1 className="font-display font-black text-2xl text-blue-700 mt-2 leading-tight">{t.name}</h1>
        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5"><MapPin size={13} />{t.location}, {t.city}</p>
      </div>
      <div className="px-5 py-5 space-y-4">
        <div className="card p-4 grid grid-cols-2 gap-3">
          {[{icon:Calendar,label:'Fecha',value:formatDate(t.date)},{icon:Trophy,label:'Categoría',value:t.category},{icon:Users,label:'Equipos',value:t.registered_teams+'/'+t.max_teams},{icon:DollarSign,label:'Inscripción',value:formatCLP(t.price_per_team)+'/eq'}].map(({icon:Icon,label,value}) => (<div key={label}><p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1 flex items-center gap-1"><Icon size={10} />{label}</p><p className="text-sm font-semibold text-slate-800">{value}</p></div>))}
        </div>
        {t.status!=='finished' && (<div className="card p-4"><div className="flex justify-between text-xs text-slate-500 mb-2"><span>Cupos ocupados</span><span className="font-bold text-blue-600">{t.registered_teams}/{t.max_teams} ({pct}%)</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{width:pct+'%'}} /></div></div>)}
        {t.winner && (<div className="card p-4 border-yellow-200 bg-yellow-50/50"><p className="text-xs text-yellow-700 font-medium uppercase mb-1">🥇 Campeones</p><p className="font-display font-black text-xl text-yellow-700">{t.winner}</p></div>)}
      </div>
    </main>
    {t.status==='open' && (<div className="sticky bottom-[72px] px-4 pb-3 bg-white/90 backdrop-blur border-t border-slate-100"><button className="btn-primary w-full mt-3">Inscribirse ahora →</button></div>)}
    <BottomNav />
  </div>)
}