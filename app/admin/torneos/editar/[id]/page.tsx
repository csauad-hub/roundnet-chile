'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIAS = ['Varones', 'Damas', 'Open', 'Múltiple']
const ESTADOS = [
  { value: 'upcoming', label: 'Próximo' },
  { value: 'ongoing', label: 'En curso' },
  { value: 'finished', label: 'Finalizado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export default function EditarTorneoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', location: '', city: '', date: '',
    max_teams: '', price_per_team: '',
    category: 'Open', status: 'upcoming',
    fwango_url: '', description: '',
  })

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('tournaments').select('*').eq('id', id).single()
      if (error || !data) { setError('Torneo no encontrado'); setFetching(false); return }
      setForm({
        name: data.name ?? '',
        location: data.location ?? '',
        city: data.city ?? '',
        date: data.date ? data.date.split('T')[0] : '',
        max_teams: data.max_teams?.toString() ?? '',
        price_per_team: data.price_per_team?.toString() ?? '',
        category: data.category ?? 'Open',
        status: data.status ?? 'upcoming',
        fwango_url: data.fwango_url ?? '',
        description: data.description ?? '',
      })
      setFetching(false)
    }
    if (id) load()
  }, [id])

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error: err } = await supabase.from('tournaments').update({
      name: form.name, location: form.location, city: form.city,
      date: form.date || null,
      max_teams: form.max_teams ? parseInt(form.max_teams) : null,
      price_per_team: form.price_per_team ? parseFloat(form.price_per_team) : null,
      category: form.category, status: form.status,
      fwango_url: form.fwango_url || null,
      description: form.description || null,
    }).eq('id', id)
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/admin/torneos'); router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este torneo?')) return
    setLoading(true)
    await supabase.from('tournaments').delete().eq('id', id)
    router.push('/admin/torneos'); router.refresh()
  }

  const cls = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
  const selCls = "w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00E5FF]/50"

  if (fetching) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#00E5FF]/30 border-t-[#00E5FF] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Editar Torneo</h1>
          <p className="text-gray-400 mt-1 text-xs font-mono">{id}</p>
        </div>
        <button onClick={handleDelete} disabled={loading}
          className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors disabled:opacity-50">
          Eliminar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nombre *</label>
          <input type="text" name="name" value={form.name} onChange={handle} required className={cls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Ciudad *</label>
            <input type="text" name="city" value={form.city} onChange={handle} required className={cls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Lugar *</label>
            <input type="text" name="location" value={form.location} onChange={handle} required className={cls} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
          <input type="date" name="date" value={form.date} onChange={handle} className={cls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
            <select name="category" value={form.category} onChange={handle} className={selCls}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
            <select name="status" value={form.status} onChange={handle} className={selCls}>
              {ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Equipos máximos</label>
            <input type="number" name="max_teams" value={form.max_teams} onChange={handle} min={1} className={cls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Precio (CLP)</label>
            <input type="number" name="price_per_team" value={form.price_per_team} onChange={handle} min={0} className={cls} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Link Fwango</label>
          <input type="url" name="fwango_url" value={form.fwango_url} onChange={handle} className={cls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
          <textarea name="description" value={form.description} onChange={handle} rows={3} className={cls + " resize-none"} />
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
