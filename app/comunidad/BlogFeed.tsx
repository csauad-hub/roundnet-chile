'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Heart, Plus, Send, ChevronDown, ChevronUp, X, Image, AlertCircle } from 'lucide-react'

type PostCategory = 'tecnica' | 'general' | 'ayuda' | 'humor'

const CATEGORY_LABELS: Record<PostCategory, string> = {
  tecnica: 'Técnica',
  general: 'General',
  ayuda: 'Ayuda',
  humor: 'Humor',
}

const CATEGORY_COLORS: Record<PostCategory, string> = {
  tecnica: 'bg-blue-100 text-blue-700',
  general: 'bg-slate-100 text-slate-600',
  ayuda: 'bg-amber-100 text-amber-700',
  humor: 'bg-green-100 text-green-700',
}

interface Author {
  full_name: string | null
  avatar_url: string | null
}

interface Post {
  id: string
  author_id: string
  author: Author | null
  category: PostCategory
  title: string
  content: string
  media_url: string | null
  likes_count: number
  comments_count: number
  user_has_liked: boolean
  created_at: string
}

interface Comment {
  id: string
  post_id: string
  author_id: string
  author: Author | null
  content: string
  created_at: string
}

function Avatar({ name, url, size = 7 }: { name: string; url?: string | null; size?: number }) {
  const dim = `w-${size} h-${size}`
  const text = size <= 7 ? 'text-[10px]' : 'text-sm'
  if (url) return <img src={url} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />
  return (
    <div className={`${dim} rounded-full bg-blue-600 flex items-center justify-center text-white font-black ${text} flex-shrink-0`}>
      {name[0].toUpperCase()}
    </div>
  )
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

function normalizeAuthor(raw: unknown): Author | null {
  if (!raw) return null
  const obj = Array.isArray(raw) ? raw[0] : raw
  return (obj as Author) ?? null
}

const POST_SELECT = 'id, author_id, category, title, content, media_url, likes_count, comments_count, created_at'

export default function BlogFeed() {
  const supabase = createClient()

  const [posts, setPosts] = useState<Post[]>([])
  const [myPending, setMyPending] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<Author | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState<PostCategory>('general')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [filterCategory, setFilterCategory] = useState<PostCategory | 'all'>('all')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUserId(user?.id ?? null)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single()
        setUserProfile(profile ?? null)
      }
      fetchPosts(user?.id ?? null)
    })
  }, [])

  const fetchPosts = async (uid: string | null) => {
    setLoading(true)

    const approvedQ = supabase
      .from('posts')
      .select(POST_SELECT)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50)

    const pendingQ = uid
      ? supabase.from('posts').select(POST_SELECT).eq('status', 'pending').eq('author_id', uid).order('created_at', { ascending: false })
      : null

    const [approvedRes, pendingRes] = await Promise.all([approvedQ, pendingQ ?? Promise.resolve({ data: [] })])

    const approved = (approvedRes.data ?? []) as Record<string, unknown>[]
    const pending = (pendingRes.data ?? []) as Record<string, unknown>[]

    // Fetch author profiles separately to avoid FK join issues
    const allIds = [...new Set([...approved, ...pending].map(p => p.author_id as string))]
    const profileMap: Record<string, Author> = {}
    if (allIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', allIds)
      for (const p of profiles ?? []) {
        profileMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url }
      }
    }

    let likedIds = new Set<string>()
    if (uid && approved.length > 0) {
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', uid)
        .in('post_id', approved.map(p => p.id as string))
      likedIds = new Set((likes ?? []).map(l => l.post_id))
    }

    setPosts(approved.map(p => ({ ...(p as object), author: profileMap[p.author_id as string] ?? null, user_has_liked: likedIds.has(p.id as string) } as Post)))
    setMyPending(pending.map(p => ({ ...(p as object), author: profileMap[p.author_id as string] ?? null, user_has_liked: false } as Post)))
    setLoading(false)
  }

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      setSubmitError('El archivo no puede superar 50 MB.')
      return
    }
    setMediaFile(file)
    setMediaPreview(URL.createObjectURL(file))
    setSubmitError(null)
  }

  const clearMedia = () => {
    setMediaFile(null)
    if (mediaPreview) URL.revokeObjectURL(mediaPreview)
    setMediaPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleNewPost = async () => {
    if (!userId || submitting) return
    if (!newTitle.trim()) { setSubmitError('El título es obligatorio.'); return }
    if (!newContent.trim()) { setSubmitError('El contenido es obligatorio.'); return }

    setSubmitting(true)
    setSubmitError(null)

    let media_url: string | null = null

    if (mediaFile) {
      const ext = mediaFile.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(path, mediaFile, { upsert: false })

      if (uploadError) {
        setSubmitError(`Error al subir el archivo: ${uploadError.message}`)
        setSubmitting(false)
        return
      }

      const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(uploadData.path)
      media_url = urlData.publicUrl
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({ author_id: userId, category: newCategory, title: newTitle.trim(), content: newContent.trim(), media_url, status: 'pending' })
      .select('id, author_id, category, title, content, media_url, likes_count, comments_count, created_at')
      .single()

    if (error) {
      setSubmitError(`No se pudo publicar: ${error.message}`)
      setSubmitting(false)
      return
    }

    if (data) {
      const newPost: Post = {
        ...(data as object) as Post,
        author: userProfile,
        user_has_liked: false,
      }
      setMyPending(prev => [newPost, ...prev])
      setNewTitle('')
      setNewContent('')
      setNewCategory('general')
      clearMedia()
      setShowForm(false)
    }

    setSubmitting(false)
  }

  const handleLike = async (post: Post) => {
    if (!userId) return
    const liked = post.user_has_liked
    setPosts(prev => prev.map(p => p.id === post.id
      ? { ...p, user_has_liked: !liked, likes_count: liked ? p.likes_count - 1 : p.likes_count + 1 }
      : p
    ))
    if (liked) {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', userId)
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: userId })
    }
  }

  const togglePost = async (postId: string) => {
    if (expandedPost === postId) { setExpandedPost(null); return }
    setExpandedPost(postId)
    if (comments[postId]) return
    const { data: commentData } = await supabase
      .from('post_comments')
      .select('id, post_id, author_id, content, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    const cids = [...new Set((commentData ?? []).map(c => c.author_id))]
    const cProfileMap: Record<string, Author> = {}
    if (cids.length > 0) {
      const { data: cProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', cids)
      for (const p of cProfiles ?? []) {
        cProfileMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url }
      }
    }
    setComments(prev => ({ ...prev, [postId]: (commentData ?? []).map(c => ({ ...c, author: cProfileMap[c.author_id] ?? null })) }))
  }

  const handleComment = async (postId: string) => {
    const content = newComment[postId]?.trim()
    if (!userId || !content) return
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, author_id: userId, content })
      .select('id, post_id, author_id, content, created_at')
      .single()
    if (!error && data) {
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] ?? []), { ...data, author: userProfile }] }))
      setNewComment(prev => ({ ...prev, [postId]: '' }))
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
    }
  }

  const filteredPosts = filterCategory === 'all' ? posts : posts.filter(p => p.category === filterCategory)

  return (
    <section className="px-4 mt-4 mb-2">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="section-title">Foro de la comunidad</h2>
        {userId && (
          <button
            onClick={() => { setShowForm(v => !v); setSubmitError(null) }}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
          >
            <Plus size={13} /> Publicar
          </button>
        )}
      </div>

      {/* Filtros por categoría */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
        {(['all', 'tecnica', 'general', 'ayuda', 'humor'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors ${filterCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
          >
            {cat === 'all' ? 'Todo' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Formulario nueva publicación */}
      {showForm && (
        <div className="card p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-slate-800">Nueva publicación</p>
            <button onClick={() => { setShowForm(false); setSubmitError(null) }}>
              <X size={16} className="text-slate-400" />
            </button>
          </div>

          {/* Categoría */}
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Categoría</p>
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {(Object.keys(CATEGORY_LABELS) as PostCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors ${newCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Título */}
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Título <span className="text-red-400">*</span></p>
          <input
            type="text"
            value={newTitle}
            onChange={e => { setNewTitle(e.target.value); setSubmitError(null) }}
            placeholder="Ej: ¿Cómo mejorar el remate?"
            maxLength={120}
            className="w-full text-sm text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded-xl px-3 py-2.5 mb-4 focus:outline-none focus:border-blue-400"
          />

          {/* Contenido */}
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Contenido <span className="text-red-400">*</span></p>
          <textarea
            value={newContent}
            onChange={e => { setNewContent(e.target.value); setSubmitError(null) }}
            placeholder="Comparte tu pregunta, experiencia o idea con la comunidad..."
            rows={4}
            className="w-full text-sm text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded-xl p-3 resize-none mb-4 focus:outline-none focus:border-blue-400"
          />

          {/* Media */}
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Foto o video <span className="text-slate-300">(opcional)</span></p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaSelect}
            className="hidden"
          />

          {mediaPreview ? (
            <div className="relative mb-4 rounded-xl overflow-hidden bg-slate-100">
              {mediaFile?.type.startsWith('video/') ? (
                <video src={mediaPreview} controls className="w-full max-h-48 object-contain" />
              ) : (
                <img src={mediaPreview} alt="preview" className="w-full max-h-48 object-cover" />
              )}
              <button
                onClick={clearMedia}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 w-full border border-dashed border-slate-300 rounded-xl py-3 px-4 mb-4 text-sm text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              <Image size={18} />
              Subir foto o video
            </button>
          )}

          {/* Error */}
          {submitError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-3">
              <AlertCircle size={14} className="flex-shrink-0" />
              {submitError}
            </div>
          )}

          <button
            onClick={handleNewPost}
            disabled={submitting}
            className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            {submitting ? 'Publicando...' : 'Publicar'}
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2">Tu publicación será revisada por un admin antes de aparecer.</p>
        </div>
      )}

      {/* Posts propios pendientes de aprobación */}
      {myPending.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {myPending.map(post => (
            <div key={post.id} className="card overflow-hidden border border-amber-200">
              <div className="px-4 py-2 bg-amber-50">
                <span className="text-[11px] font-semibold text-amber-600">En revisión — visible solo para ti</span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={post.author?.full_name || 'Jugador'} url={post.author?.avatar_url} size={7} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{post.author?.full_name || 'Jugador'}</p>
                    <p className="text-[10px] text-slate-400">{formatTime(post.created_at)}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${CATEGORY_COLORS[post.category]}`}>
                    {CATEGORY_LABELS[post.category]}
                  </span>
                </div>
                {post.title && <p className="text-sm font-bold text-slate-800 mb-1">{post.title}</p>}
                <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de posts aprobados */}
      {loading ? (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-slate-100" />
                <div className="flex-1">
                  <div className="h-2.5 bg-slate-100 rounded w-1/3 mb-1.5" />
                  <div className="h-2 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
              <div className="h-3 bg-slate-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-full mb-1.5" />
              <div className="h-3 bg-slate-100 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="card p-8 text-center">
          <MessageSquare size={32} className="mx-auto mb-3 text-slate-200" />
          <p className="text-sm font-semibold text-slate-500">
            {filterCategory === 'all' ? 'Sé el primero en publicar' : `Sin publicaciones de ${CATEGORY_LABELS[filterCategory]}`}
          </p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Comparte preguntas, técnicas o lo que quieras sobre roundnet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredPosts.map(post => {
            const isExpanded = expandedPost === post.id
            const authorName = post.author?.full_name || 'Jugador'
            const postComments = comments[post.id] ?? []
            const isVideo = post.media_url && (post.media_url.includes('.mp4') || post.media_url.includes('.mov') || post.media_url.includes('.webm'))

            return (
              <div key={post.id} className="card overflow-hidden">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <Avatar name={authorName} url={post.author?.avatar_url} size={7} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{authorName}</p>
                      <p className="text-[10px] text-slate-400">{formatTime(post.created_at)}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${CATEGORY_COLORS[post.category]}`}>
                      {CATEGORY_LABELS[post.category]}
                    </span>
                  </div>

                  {/* Título */}
                  {post.title && (
                    <p className="text-sm font-bold text-slate-800 mb-1 leading-snug">{post.title}</p>
                  )}

                  {/* Contenido */}
                  <p className="text-sm text-slate-600 leading-relaxed">{post.content}</p>

                  {/* Media */}
                  {post.media_url && (
                    <div className="mt-3 rounded-xl overflow-hidden bg-slate-100">
                      {isVideo ? (
                        <video src={post.media_url} controls className="w-full max-h-64 object-contain" />
                      ) : (
                        <img src={post.media_url} alt={post.title || 'imagen'} className="w-full max-h-64 object-cover" />
                      )}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleLike(post)}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${post.user_has_liked ? 'text-red-500' : 'text-slate-400'}`}
                    >
                      <Heart size={14} fill={post.user_has_liked ? 'currentColor' : 'none'} />
                      {post.likes_count}
                    </button>
                    <button
                      onClick={() => togglePost(post.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"
                    >
                      <MessageSquare size={14} />
                      {post.comments_count} {post.comments_count === 1 ? 'comentario' : 'comentarios'}
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {/* Comentarios */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                    {postComments.length === 0 ? (
                      <p className="text-xs text-slate-400 py-1 mb-2">Sin comentarios aún. ¡Sé el primero!</p>
                    ) : (
                      <div className="flex flex-col gap-3 mb-3">
                        {postComments.map(c => {
                          const cName = c.author?.full_name || 'Jugador'
                          return (
                            <div key={c.id} className="flex gap-2">
                              <Avatar name={cName} url={c.author?.avatar_url} size={6} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-1.5">
                                  <p className="text-[11px] font-semibold text-slate-700">{cName}</p>
                                  <p className="text-[10px] text-slate-400">{formatTime(c.created_at)}</p>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{c.content}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {userId ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={newComment[post.id] ?? ''}
                          onChange={e => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') handleComment(post.id) }}
                          placeholder="Escribe un comentario..."
                          className="flex-1 text-xs bg-white border border-slate-200 rounded-full px-3 py-2 focus:outline-none focus:border-blue-400"
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          disabled={!newComment[post.id]?.trim()}
                          className="text-blue-600 disabled:text-slate-300 transition-colors"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Inicia sesión para comentar.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
