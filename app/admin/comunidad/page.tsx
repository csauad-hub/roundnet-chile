import { createAdminClient } from '@/lib/supabase/admin'
import { MessageSquare, Clock } from 'lucide-react'
import { ModerationActions } from './ModerationActions'

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

export default async function AdminComunidadPage() {
  const supabase = createAdminClient()

  const [{ data: pending }, { count: approvedCount }, { count: rejectedCount }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, category, title, content, media_url, created_at, author:profiles!author_id(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
  ])

  const posts = pending ?? []

  return (
    <div className="py-2 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Moderación del foro</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Revisa y aprueba las publicaciones antes de que sean visibles para la comunidad.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-4 border" style={{ background: 'rgba(234,179,8,0.06)', borderColor: 'rgba(234,179,8,0.15)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Pendientes</p>
          <p className="text-2xl font-bold text-amber-400">{posts.length}</p>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.15)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Aprobados</p>
          <p className="text-2xl font-bold text-green-400">{approvedCount ?? 0}</p>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.15)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Rechazados</p>
          <p className="text-2xl font-bold text-red-400">{rejectedCount ?? 0}</p>
        </div>
      </div>

      {/* Lista de pendientes */}
      <div>
        <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Por revisar ({posts.length})
        </h2>

        {posts.length === 0 ? (
          <div className="rounded-xl border p-10 text-center" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
            <MessageSquare size={32} className="mx-auto mb-3 opacity-20 text-white" />
            <p className="text-sm text-white/50">No hay publicaciones pendientes de revisión.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map(post => {
              const author = Array.isArray(post.author) ? post.author[0] : post.author
              const authorName = (author as { full_name?: string } | null)?.full_name || 'Usuario desconocido'
              const date = new Date(post.created_at).toLocaleDateString('es-CL', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })

              return (
                <div
                  key={post.id}
                  className="rounded-xl border p-4"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{authorName}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-gray-500/20 text-gray-400'}`}>
                          {CATEGORY_LABELS[post.category] || post.category}
                        </span>
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          <Clock size={10} /> {date}
                        </span>
                      </div>
                      {post.title && (
                        <p className="text-sm font-bold text-white mb-1">{post.title}</p>
                      )}
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        {post.content}
                      </p>
                      {post.media_url && (
                        <div className="mt-2 rounded-lg overflow-hidden max-h-40">
                          {String(post.media_url).match(/\.(mp4|mov|webm)/) ? (
                            <video src={String(post.media_url)} controls className="w-full max-h-40 object-contain bg-black" />
                          ) : (
                            <img src={String(post.media_url)} alt="media" className="w-full max-h-40 object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                    <ModerationActions postId={post.id} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
