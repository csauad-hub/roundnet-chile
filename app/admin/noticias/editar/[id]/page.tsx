'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EditarNoticiaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    link: '',
    published_at: '',
  })

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single()
      if (error || !data) { setError('Noticia no encontrada'); setFetching(false); return }
      setForm({
        title: data.title ?? '',
        description: data.description ?? '',
        image_url: data.image_url ?? '',
        link: data.link ?? '',
        published_at: data.published_at ? data.published_at.split('T')[0] : '',
      })
      setFetching(false)
    }
    if (id) load()
  }, [id])

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.from('news').update({
      title: form.title,
      description: form.description || null,
      image_url: form.image_url || null,
      link: form.link || null,
      published_at: form.published_at || null,
    }).eq('id', id)
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/admin/noticias')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta noticia?')) return
    setLoading(true)
    await supabase.from('news').delete().eq('id', id)
    router.push('/admin/noticias')
    router.refresh()
  }

  const cls = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"

  if (fetching) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#00E5FF]/30 border-t-[#00E5FF] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Editar Noticia</h1>
          <p className="text-gray-400 mt-1 text-xs font-mono">{id}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors disabled:opacity-50"
        >
          Eliminar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Título *</label>
          <input type="text" name="title" value={form.title} onChange={handle} required className={cls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
          <textarea name="description" value={form.description} onChange={handle} rows={4} className={cls + " resize-none"} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">URL de imagen</label>
          <input type="url" name="image_url" value={form.image_url} onChange={handle} placeholder="https://..." className={cls} />
          {form.image_url && (
            <div className="mt-2 rounded-lg overflow-hidden border border-white/10 h-40 bg-white/5">
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Link externo</label>
          <input type="url" name="link" value={form.link} onChange={handle} placeholder="https://..." className={cls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Fecha de publicación</label>
          <input type="date" name="published_at" value={form.published_at} onChange={handle} className={cls} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-[#00E5FF] text-black font-semibold hover:bg-[#00E5FF]/90 transition-colors disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
