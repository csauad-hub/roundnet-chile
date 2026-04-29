'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, X, Check, RefreshCw, AlertCircle } from 'lucide-react'

type Profile = { id: string; full_name: string | null; avatar_url: string | null }
type RankingEntry = {
  id: string
  position: number
  name: string
  points: number
  season: number
  category: string
  profile_id: string | null
  profiles: Profile | null
}

const CATEGORIES = ['Varones', 'Damas'] as const
const SEASONS = [2025, 2024, 2023]

const emptyForm = {
  position: '',
  name: '',
  points: '',
  season: '2025',
  category: 'Varones',
  profile_id: '',
}

export default function AdminRankingPage() {
  const supabase = createClient()
  const [entries, setEntries] = useState<RankingEntry[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [categoria, setCategoria] = useState<'Varones' | 'Damas'>('Varones')
  const [season, setSeason] = useState(2025)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [recalcMsg, setRecalcMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('ranking')
      .select('*, profiles(id, full_name, avatar_url)')
      .eq('season', season)
      .eq('category', categoria)
      .order('position')
    setEntries((data as RankingEntry[]) ?? [])
    setLoading(false)
  }, [categoria, season, supabase])

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .order('full_name')
      .then(({ data }) => setProfiles(data ?? []))
  }, [supabase])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  async function handleRecalculate() {
    setRecalculating(true)
    setRecalcMsg(null)
    const res = await fetch('/api/admin/ranking/recalcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ season }),
    })
    const json = await res.json()
    if (res.ok) {
      setRecalcMsg({ type: 'ok', text: `Ranking ${season} recalculado exitosamente desde resultados de torneos.` })
      await fetchEntries()
    } else {
      setRecalcMsg({ type: 'error', text: json.error ?? 'Error al recalcular' })
    }
    setRecalculating(false)
  }

  function openNew() {
    setEditId(null)
    setForm({ ...emptyForm, category: categoria, season: String(season) })
    setShowForm(true)
  }

  function openEdit(entry: RankingEntry) {
    setEditId(entry.id)
    setForm({
      position: String(entry.position),
      name: entry.name,
      points: String(entry.points),
      season: String(entry.season),
      category: entry.category,
      profile_id: entry.profile_id ?? '',
    })
    setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      position: Number(form.position),
      name: form.name.trim(),
      points: Number(form.points),
      season: Number(form.season),
      category: form.category,
      profile_id: form.profile_id || null,
    }
    if (editId) {
      await supabase.from('ranking').update(payload).eq('id', editId)
    } else {
      await supabase.from('ranking').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    await fetchEntries()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta entrada del ranking?')) return
    await supabase.from('ranking').delete().eq('id', id)
    await fetchEntries()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Ranking</h1>
          <p className="text-gray-400 mt-1">Gestiona y recalcula el ranking por temporada</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#00E5FF] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#00E5FF]/90 transition-colors"
        >
          <Plus size={16} /> Nueva entrada
        </button>
      </div>

      {/* Recalcular desde torneos */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Recalcular desde resultados de torneos</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Suma los puntos de todos los torneos de la temporada {season} y actualiza el ranking automáticamente.
            </p>
            {recalcMsg && (
              <div className={`flex items-center gap-1.5 mt-2 text-xs ${recalcMsg.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
                {recalcMsg.type === 'ok' ? <Check size={13} /> : <AlertCircle size={13} />}
                {recalcMsg.text}
              </div>
            )}
          </div>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <RefreshCw size={14} className={recalculating ? 'animate-spin' : ''} />
            {recalculating ? 'Calculando...' : 'Recalcular'}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5">
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategoria(c)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                categoria === c ? 'bg-[#00E5FF] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={season}
          onChange={e => setSeason(Number(e.target.value))}
          className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5"
        >
          {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#00E5FF]/30 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>No hay entradas de ranking para esta categoría/temporada.</p>
          <button onClick={openNew} className="mt-3 text-[#00E5FF] text-sm hover:underline">
            Agregar manualmente →
          </button>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Pos</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Jugador</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Puntos</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Perfil</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-bold text-sm">{entry.position}</td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium text-sm">{entry.name}</p>
                  </td>
                  <td className="px-6 py-4 text-[#00E5FF] font-bold text-sm">{entry.points}</td>
                  <td className="px-6 py-4">
                    {entry.profiles ? (
                      <span className="flex items-center gap-2 text-emerald-400 text-xs">
                        {entry.profiles.avatar_url && (
                          <img src={entry.profiles.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                        )}
                        <Check size={12} />
                        {entry.profiles.full_name ?? '—'}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-xs">Sin vincular</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(entry)}
                        className="p-1.5 text-gray-400 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 rounded-lg transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">
                {editId ? 'Editar entrada' : 'Nueva entrada manual'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Posición</label>
                <input
                  type="number"
                  value={form.position}
                  onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Puntos</label>
                <input
                  type="number"
                  value={form.points}
                  onChange={e => setForm(f => ({ ...f, points: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2"
                  placeholder="1000"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nombre visible en ranking</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2"
                placeholder="Nombre del jugador"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Categoría</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-gray-800 border border-white/10 text-white text-sm rounded-lg px-3 py-2"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Temporada</label>
                <select
                  value={form.season}
                  onChange={e => setForm(f => ({ ...f, season: e.target.value }))}
                  className="w-full bg-gray-800 border border-white/10 text-white text-sm rounded-lg px-3 py-2"
                >
                  {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Vincular con usuario <span className="text-gray-600">(opcional)</span>
              </label>
              <select
                value={form.profile_id}
                onChange={e => setForm(f => ({ ...f, profile_id: e.target.value }))}
                className="w-full bg-gray-800 border border-white/10 text-white text-sm rounded-lg px-3 py-2"
              >
                <option value="">— Sin vincular —</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name ?? p.id}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.position || !form.points}
                className="flex-1 px-4 py-2 rounded-lg bg-[#00E5FF] text-black text-sm font-semibold hover:bg-[#00E5FF]/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
