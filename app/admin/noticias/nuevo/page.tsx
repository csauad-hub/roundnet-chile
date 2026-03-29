'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NuevaNoticiaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    link: '',
    published_at: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      title: form.title,
      description: form.description || null,
      image_url: form.image_url || null,
      link: form.link || null,
      published_at: form.published_at || null,
    }

    const { error: insertError } = await supabase.from('news').insert([payload])

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin/noticias')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Nueva Noticia</h1>
        <p className="text-gray-400 mt-1">Completa los datos para publicar una noticia</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Título *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Ej: Resultados 1° Fecha Nacional 2026"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Resumen o descripción de la noticia..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">URL de imagen</label>
          <input
            type="url"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
          />
          {form.image_url && (
            <div className="mt-2 rounded-lg overflow-hidden border border-white/10 h-40 bg-white/5">
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Link externo</label>
          <input
            type="url"
            name="link"
            value={form.link}
            onChange={handleChange}
            placeholder="https://instagram.com/... o artículo externo"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Fecha de publicación</label>
          <input
            type="date"
            name="published_at"
            value={form.published_at}
            onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-[#00E5FF] text-black font-semibold hover:bg-[#00E5FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Publicando...' : 'Publicar Noticia'}
          </button>
        </div>
      </form>
    </div>
  )
}
