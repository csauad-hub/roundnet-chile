export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Newspaper, ChevronRight } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function NoticiasPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })

  const news = data ?? []
  const featured = news[0] ?? null
  const rest = news.slice(1)

  return (
    <div className="flex flex-col min-h-screen animate-in">
      <Topbar title="Noticias" />
      <main className="flex-1 pb-24 bg-slate-50">
        <div className="px-4 pt-4 pb-6 space-y-3">
          {news.length === 0 ? (
            <div className="card px-4 py-12 text-center text-sm text-slate-400">
              No hay noticias publicadas todavía.
            </div>
          ) : (
            <>
              {featured && (
                <Link href={`/noticias/${featured.id}`} className="block group">
                  <div className="card overflow-hidden hover:shadow-md transition-shadow">
                    {featured.image_url ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={featured.image_url}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <Newspaper size={32} className="text-blue-200" />
                      </div>
                    )}
                    <div className="px-4 py-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Destacado</span>
                      <h2 className="font-display font-bold text-slate-800 text-base leading-snug mt-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {featured.title}
                      </h2>
                      {featured.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{featured.description}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-2">
                        {formatDate(featured.published_at ?? featured.created_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              )}
              {rest.map(n => (
                <Link key={n.id} href={`/noticias/${n.id}`} className="block group">
                  <div className="card flex gap-3 px-4 py-3.5 hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden bg-blue-50 flex items-center justify-center">
                      {n.image_url ? (
                        <img src={n.image_url} alt={n.title} className="w-full h-full object-cover" />
                      ) : (
                        <Newspaper size={20} className="text-blue-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {n.category && (
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{n.category}</p>
                      )}
                      <p className="text-sm font-semibold text-slate-800 leading-snug mt-0.5 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {formatDate(n.published_at ?? n.created_at)}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 self-center shrink-0" />
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
