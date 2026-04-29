'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIAS = ['Varones', 'Damas', 'Open', 'Múltiple']
const ESTADOS = [
  { value: 'upcoming', label: 'Próximo' },
  { value: 'ongoing', label: 'En curso' },
  { value: 'finished', label: 'Finalizado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export default function NuevoTorneoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    location: '',
    city: '',
    date: '',
    max_teams: '',
    price_per_team: '',
    category: 'Open',
    status: 'upcoming',
    fwango_url: '',
    description: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      name: form.name,
      location: form.location,
      city: form.city,
      date: form.date || null,
      max_teams: form.max_teams ? parseInt(form.max_teams) : null,
      price_per_team: form.price_per_team ? parseFloat(form.price_per_team) : null,
      category: form.category,
      status: form.status,
      fwango_url: form.fwango_url || null,
      description: form.description || null,
    }

    const { error: insertError } = await supabase.from('tournaments').insert([payload])

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin/torneos')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Nuevo Torneo</h1>
        <p className="text-gray-400 mt-1">Completa los datos para crear un torneo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nombre del torneo *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Ej: 1° Fecha Nacional La Serena 2026"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
          />
        </div>

        {/* Ciudad + Lugar */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Ciudad *</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              placeholder="Santiago"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Lugar *</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="Parque O'Higgins"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
            />
          </div>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
          />
        </div>

        {/* Categoría + Estado */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
            >
              {ESTADOS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Equipos máx + Precio */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Equipos máximos
            </label>
            <input
              type="number"
              name="max_teams"
              value={form.max_teams}
              onChange={handleChange}
              min={1}
              placeholder="32"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Precio por equipo (CLP)
            </label>
            <input
              type="number"
              name="price_per_team"
              value={form.price_per_team}
              onChange={handleChange}
              min={0}
              placeholder="15000"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
            />
          </div>
        </div>

        {/* Link Fwango */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Link Fwango
          </label>
          <input
            type="url"
            name="fwango_url"
            value={form.fwango_url}
            onChange={handleChange}
            placeholder="https://fwango.io/torneo"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Información adicional sobre el torneo..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20 resize-none"
          />
        </div>

        {/* Botones */}
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
            {loading ? 'Guardando...' : 'Crear Torneo'}
          </button>
        </div>
      </form>
    </div>
  )
}
