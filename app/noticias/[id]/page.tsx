import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ArrowLeft, ExternalLink } from 'lucide-react'

type News = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  link: string | null
  published_at: string | null
  created_at: string
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function NoticiaPage({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('news')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!data) notFound()
  const noticia: News = data

  return (
    <div className="min-h-screen" style={{ background: '#0d0d1a' }}>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/noticias"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Volver a noticias
        </Link>

        {noticia.image_url && (
          <div className="rounded-2xl overflow-hidden mb-8 border border-white/10">
            <img
              src={noticia.image_url}
              alt={noticia.title}
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>
        )}

        <article>
          {noticia.published_at && (
            <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
              <Calendar size={13} />
              {formatDate(noticia.published_at)}
            </div>
          )}
          <h1 className="text-3xl font-bold text-white mb-4">{noticia.title}</h1>
          {noticia.description && (
            <p className="text-gray-300 text-lg leading-relaxed">{noticia.description}</p>
          )}

          {noticia.link && (
            <div className="mt-8">
              <a
                href={noticia.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#00E5FF] text-black font-semibold px-6 py-3 rounded-xl hover:bg-[#00E5FF]/90 transition-colors"
              >
                <ExternalLink size={16} /> Ver nota completa
              </a>
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
