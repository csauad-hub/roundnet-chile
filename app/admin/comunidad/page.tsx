import { createAdminClient } from '@/lib/supabase/admin'
import { MessageSquare, Clock } from 'lucide-react'
import Link from 'next/link'
import { ModerationActions } from './ModerationActions'

type Tab = 'pending' | 'approved' | 'rejected'

const CATEGORY_LABELS: Record<string, string> = {
  tecnica: 'Técnica',
  general: 'General',
  ayuda: 'Ayuda',
  humor: 'Humor',
}

const CATEGORY_COLORS: Record<string, string> = {
  tecnica: 'bg-blue-500/20 text-blue-400',
  general: 'bg-gray-500/20 text-gray-400',
  ayuda: 'bg-amber-500/20 text-amber-400',
  humor: 'bg-green-500/20 text-green-400',
}

const TAB_CONFIG: Record<Tab, { label: string; color: string; activeClass: string; emptyText: string }> = {
  pending: {
    label: 'Pendientes',
    color: 'text-amber-400',
    activeClass: 'border-amber-400 text-amber-400',
    emptyText: 'No hay publicaciones pendientes.',
  },
  approved: {
    label: 'Aprobados',
    color: 'text-green-400',
    activeClass: 'border-green-400 text-green-400',
    emptyText: 'No hay publicaciones aprobadas aún.',
  },
  rejected: {
    label: 'Rechazados',
    color: 'text-red-400',
    activeClass: 'border-red-400 text-red-400',
    emptyText: 'No hay publicaciones rechazadas.',
  },
}

export default async function AdminComunidadPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab: tabParam = 'pending' } = await searchParams
  const tab: Tab = ['pending', 'approved', 'rejected'].includes(tabParam) ? (tabParam as Tab) : 'pending'

  const supabase = createAdminClient()

  const [{ count: pendingCount }, { count: approvedCount }, { count: rejectedCount }, { data: postsRaw }] =
    await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase
        .from('posts')
        .select('id, author_id, category, title, content, media_url, created_at')
        .eq('status', tab)
        .order('created_at', { ascending: tab === 'pending' }),
    ])

  const posts = postsRaw ?? []

  const authorIds = [...new Set(posts.map(p => p.author_id))]
  const authorMap: Record<string, string> = {}
  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', authorIds)
    for (const p of profiles ?? []) {
      authorMap[p.id] = p.full_name || 'Usuario'
    }
  }

  const counts: Record<Tab, number> = {
    pending: pendingCount ?? 0,
    approved: approvedCount ?? 0,
    rejected: rejectedCount ?? 0,
  }

  return (
    <div className="py-2 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Moderación del foro</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Revisa, aprueba, rechaza o elimina publicaciones de la comunidad.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {(Object.keys(TAB_CONFIG) as Tab[]).map(t => {
          const cfg = TAB_CONFIG[t]
          const isActive = tab === t
          return (
            <Link
              key={t}
              href={`/admin/comunidad?tab=${t}`}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                isActive
                  ? cfg.activeClass
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {cfg.label}
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? '' : 'text-gray-600'
                }`}
                style={{ background: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}
              >
                {counts[t]}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Lista */}
      {posts.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
        >
          <MessageSquare size={32} className="mx-auto mb-3 opacity-20 text-white" />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {TAB_CONFIG[tab].emptyText}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map(post => {
            const authorName = authorMap[post.author_id] || 'Usuario desconocido'
            const date = new Date(post.created_at).toLocaleDateString('es-CL', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            })
            const isVideo = post.media_url && String(post.media_url).match(/\.(mp4|mov|webm)/)

            return (
              <div
                key={post.id}
                className="rounded-xl border p-4"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span className="text-sm font-semibold text-white">{authorName}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          CATEGORY_COLORS[post.category] || 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {CATEGORY_LABELS[post.category] || post.category}
                      </span>
                      <span
                        className="flex items-center gap-1 text-[10px]"
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                      >
                        <Clock size={10} /> {date}
                      </span>
                    </div>

                    {/* Título */}
                    {post.title && (
                      <p className="text-sm font-bold text-white mb-1">{post.title}</p>
                    )}

                    {/* Contenido */}
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      {post.content}
                    </p>

                    {/* Media */}
                    {post.media_url && (
                      <div className="mt-3 rounded-lg overflow-hidden max-h-48">
                        {isVideo ? (
                          <video
                            src={String(post.media_url)}
                            controls
                            className="w-full max-h-48 object-contain bg-black"
                          />
                        ) : (
                          <img
                            src={String(post.media_url)}
                            alt="media"
                            className="w-full max-h-48 object-cover"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <ModerationActions postId={post.id} status={tab} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
