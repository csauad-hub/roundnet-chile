'use client'
import { useState } from 'react'
import { Plus, Heart, MessageCircle, Share2 } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'
import { MOCK_POSTS, MOCK_NEWS } from '@/lib/mock-data'
import { cn, timeAgo, formatDate, CATEGORY_LABELS, CATEGORY_STYLES, avatarColor, getInitials } from '@/lib/utils'
export default function ComunidadPage() {
  const [tab, setTab] = useState<'foro'|'noticias'>('foro')
  const [cat, setCat] = useState('all')
  const [liked, setLiked] = useState<Record<string,boolean>>({})
  const posts = cat==='all' ? MOCK_POSTS : MOCK_POSTS.filter(p => p.category===cat)
  return (<div className="flex flex-col min-h-screen animate-in"><Topbar title="Comunidad" />
    <div className="flex bg-white border-b border-slate-200">
      {(['foro','noticias'] as const).map(t => (<button key={t} onClick={() => setTab(t)} className={cn('tab-item flex-1 text-center',tab===t&&'active')}>{t==='foro'?'Foro':'Noticias'}</button>))}
    </div>
    <main className="flex-1 pb-24 relative">
      {tab==='foro' && (<>
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {[{v:'all',l:'Todo'},{v:'tecnica',l:'Técnica'},{v:'general',l:'General'},{v:'ayuda',l:'Ayuda'},{v:'humor',l:'Humor'}].map(c => (
            <button key={c.v} onClick={() => setCat(c.v)} className={cn('flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold font-display border-2 transition-all',cat===c.v?'bg-blue-600 border-blue-600 text-white':'bg-white border-slate-200 text-slate-500')}>{c.l}</button>
          ))}
        </div>
        <div className="px-4 flex flex-col gap-2.5 pb-4">
          {posts.map(p => (<div key={p.id} className="card p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={cn('avatar w-9 h-9 text-xs',avatarColor(p.author.full_name))}>{getInitials(p.author.full_name)}</div>
              <div className="flex-1"><p className="font-semibold text-sm">{p.author.full_name}</p><p className="text-[11px] text-slate-400">{timeAgo(p.created_at)}</p></div>
              <span className={cn('badge',CATEGORY_STYLES[p.category])}>{CATEGORY_LABELS[p.category]}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{p.content}</p>
            <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100">
              <button onClick={() => setLiked(l => ({...l,[p.id]:!l[p.id]}))} className={cn('flex items-center gap-1.5 text-xs font-medium',liked[p.id]||p.user_has_liked?'text-red-500':'text-slate-400')}><Heart size={14} fill={liked[p.id]||p.user_has_liked?'currentColor':'none'} />{p.likes_count}</button>
              <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400"><MessageCircle size={14} />{p.comments_count}</button>
              <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 ml-auto"><Share2 size={14} />Compartir</button>
            </div>
          </div>))}
        </div>
        <button className="fixed bottom-24 right-4 bg-blue-600 text-white rounded-full shadow-xl flex items-center gap-2 px-4 py-3 font-display font-bold text-sm z-30"><Plus size={16} />Publicar</button>
      </>)}
      {tab==='noticias' && (<div className="px-4 pt-4 flex flex-col gap-2.5">
        {MOCK_NEWS.map(n => (<div key={n.id} className="card flex gap-3 px-4 py-3.5">
          <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl bg-blue-50">{n.category==='Selección Chile'?'🌍':n.category==='Resultados'?'🏆':n.category==='Reglamento'?'📋':'📸'}</div>
          <div><p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{n.category}</p><p className="text-sm font-semibold mt-0.5">{n.title}</p><p className="text-[11px] text-slate-400 mt-1">{formatDate(n.published_at)}{n.is_official?' · Oficial':''}</p></div>
        </div>))}
      </div>)}
    </main><BottomNav /></div>)
}