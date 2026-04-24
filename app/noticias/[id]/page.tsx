import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Newspaper } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function NoticiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: noticia } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single()

  if (!noticia) notFound()

  return (
    <div className="flex flex-col min-h-screen animate-in">
      <Topbar title="Noticias" />
      <main className="flex-1 pb-24 bg-slate-50">
        <div className="px-4 pt-4 pb-2">
          <Link href="/noticias" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft size={16} />
            Volver a noticias
          </Link>
        </div>

        {noticia.image_url ? (
          <div className="mx-4 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            <img
              src={noticia.image_url}
              alt={noticia.title}
              className="w-full h-52 object-cover"
            />
          </div>
        ) : (
          <div className="mx-4 rounded-2xl overflow-hidden h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-slate-100">
            <Newspaper size={36} className="text-blue-200" />
          </div>
        )}

        <div className="px-4 pt-4 pb-6">
          <div className="card p-5">
            {noticia.category && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{noticia.category}</span>
            )}
            <h1 className="font-display font-black text-slate-800 text-xl leading-snug mt-1">
              {noticia.title}
            </h1>
            {(noticia.published_at || noticia.created_at) && (
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2">
                <Calendar size={12} />
                {formatDate(noticia.published_at ?? noticia.created_at)}
              </div>
            )}
            {noticia.description && (
              <p className="text-sm text-slate-600 leading-relaxed mt-4">
                {noticia.description}
              </p>
            )}
            {noticia.link && (
              <a
                href={noticia.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 mt-5 text-sm"
              >
                <ExternalLink size={15} />
                Ver nota completa
              </a>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
