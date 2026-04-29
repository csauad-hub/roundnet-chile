'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Check, X, Eye, Plus, Trash2, Trophy, Save, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'

type Profile = { id: string; full_name: string | null; avatar_url: string | null }
type Registration = {
  id: string
  player1_id: string
  player2_id: string
  category: string
  status: string
  registered_at: string
  notes: string | null
  payment_proof: string | null
  player1: Profile | null
  player2: Profile | null
}
type PointScale = { id?: string; position: number; points: number }
type Result = {
  id?: string
  player1_id: string
  player2_id: string
  player1_name?: string
  player2_name?: string
  category: string
  position: number
  season: number
}

const CATEGORIES = ['Varones', 'Damas'] as const
const SEASONS = [2025, 2024, 2023]

export default function AdminTorneoGestionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [tournament, setTournament] = useState<{ name: string; status: string } | null>(null)
  const [tab, setTab] = useState<'escala' | 'inscripciones' | 'resultados'>('inscripciones')

  // ── Escala ──────────────────────────────────────────────────
  const [scale, setScale] = useState<PointScale[]>([])
  const [scaleSaving, setScaleSaving] = useState(false)

  // ── Inscripciones ─────────────────────────────────────────
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [regFilter, setRegFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')
  const [loadingRegs, setLoadingRegs] = useState(true)

  // ── Resultados ────────────────────────────────────────────
  const [results, setResults] = useState<Result[]>([])
  const [resultsSeason, setResultsSeason] = useState(2025)
  const [savingResults, setSavingResults] = useState(false)
  const [confirmedRegs, setConfirmedRegs] = useState<Registration[]>([])

  // Player search for results
  const [searchQuery, setSearchQuery] = useState<Record<string, string>>({})
  const [searchResults, setSearchResults] = useState<Record<string, Profile[]>>({})

  const fetchTournament = useCallback(async () => {
    const { data } = await supabase.from('tournaments').select('name, status').eq('id', id).single()
    setTournament(data)
  }, [id, supabase])

  const fetchScale = useCallback(async () => {
    const { data } = await supabase
      .from('tournament_point_scale')
      .select('id, position, points')
      .eq('tournament_id', id)
      .order('position')
    if (!data || data.length === 0) {
      // Escala por defecto
      setScale([
        { position: 1, points: 100 }, { position: 2, points: 80 },
        { position: 3, points: 65 },  { position: 4, points: 50 },
        { position: 5, points: 35 },  { position: 6, points: 35 },
        { position: 7, points: 20 },  { position: 8, points: 20 },
        { position: 9, points: 10 },
      ])
    } else {
      setScale(data)
    }
  }, [id, supabase])

  const fetchRegistrations = useCallback(async () => {
    setLoadingRegs(true)
    const { data } = await supabase
      .from('tournament_registrations')
      .select(`
        id, player1_id, player2_id, category, status, registered_at, notes, payment_proof,
        player1:profiles!player1_id(id, full_name, avatar_url),
        player2:profiles!player2_id(id, full_name, avatar_url)
      `)
      .eq('tournament_id', id)
      .order('registered_at', { ascending: false })
    setRegistrations((data as unknown as Registration[]) ?? [])
    setConfirmedRegs(((data as unknown as Registration[]) ?? []).filter(r => r.status === 'confirmed'))
    setLoadingRegs(false)
  }, [id, supabase])

  const fetchResults = useCallback(async () => {
    const { data } = await supabase
      .from('tournament_results')
      .select(`
        id, player1_id, player2_id, category, position, season,
        player1:profiles!player1_id(id, full_name),
        player2:profiles!player2_id(id, full_name)
      `)
      .eq('tournament_id', id)
      .order('position')
    if (data) {
      setResults(data.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        player1_id: r.player1_id as string,
        player2_id: r.player2_id as string,
        player1_name: (r.player1 as Profile | null)?.full_name ?? undefined,
        player2_name: (r.player2 as Profile | null)?.full_name ?? undefined,
        category: r.category as string,
        position: r.position as number,
        season: r.season as number,
      })))
    }
  }, [id, supabase])

  useEffect(() => {
    fetchTournament()
    fetchScale()
    fetchRegistrations()
    fetchResults()
  }, [fetchTournament, fetchScale, fetchRegistrations, fetchResults])

  // ── Escala: guardar ──────────────────────────────────────
  async function saveScale() {
    setScaleSaving(true)
    for (const row of scale) {
      await supabase.from('tournament_point_scale').upsert(
        { tournament_id: id, position: row.position, points: row.points },
        { onConflict: 'tournament_id,position' }
      )
    }
    await fetchScale()
    setScaleSaving(false)
  }

  // ── Inscripciones: confirmar/rechazar ────────────────────
  async function updateStatus(regId: string, status: 'confirmed' | 'cancelled') {
    await fetch(`/api/admin/inscripcion/${regId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchRegistrations()
  }

  async function viewProof(regId: string) {
    const res = await fetch(`/api/admin/inscripcion/${regId}`)
    const { url } = await res.json()
    if (url) window.open(url, '_blank')
    else alert('No hay comprobante disponible')
  }

  // ── Resultados: agregar desde inscriptos ─────────────────
  function addFromRegistration(reg: Registration) {
    const alreadyAdded = results.some(
      r => r.player1_id === reg.player1_id && r.player2_id === reg.player2_id && r.category === reg.category
    )
    if (alreadyAdded) return
    setResults(prev => [...prev, {
      player1_id: reg.player1_id,
      player2_id: reg.player2_id,
      player1_name: reg.player1?.full_name ?? undefined,
      player2_name: reg.player2?.full_name ?? undefined,
      category: reg.category,
      position: prev.length + 1,
      season: resultsSeason,
    }])
  }

  async function searchPlayers(key: string, q: string) {
    if (q.length < 2) { setSearchResults(prev => ({ ...prev, [key]: [] })); return }
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .ilike('full_name', `%${q}%`)
      .limit(6)
    setSearchResults(prev => ({ ...prev, [key]: data ?? [] }))
  }

  function updateResult(idx: number, field: keyof Result, value: unknown) {
    setResults(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  function removeResult(idx: number) {
    setResults(prev => prev.filter((_, i) => i !== idx))
  }

  async function saveResults() {
    setSavingResults(true)
    // Eliminar resultados anteriores de este torneo
    await supabase.from('tournament_results').delete().eq('tournament_id', id)
    // Insertar nuevos
    if (results.length > 0) {
      const { error } = await supabase.from('tournament_results').insert(
        results.map(r => ({
          tournament_id: id,
          player1_id: r.player1_id,
          player2_id: r.player2_id,
          category: r.category,
          position: r.position,
          season: resultsSeason,
        }))
      )
      if (error) alert('Error: ' + error.message)
    }
    await fetchResults()
    setSavingResults(false)
  }

  const filteredRegs = registrations.filter(r => regFilter === 'all' || r.status === regFilter)

  const statusBadge: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-600',
  }
  const statusLabel: Record<string, string> = {
    pending: 'Pendiente', confirmed: 'Confirmado', cancelled: 'Cancelado',
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/torneos" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{tournament?.name ?? 'Torneo'}</h1>
          <p className="text-gray-400 text-sm">Gestión de inscripciones y resultados</p>
        </div>
        <Link
          href={`/admin/torneos/editar/${id}`}
          className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          Editar datos
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
        {(['inscripciones', 'escala', 'resultados'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-[#00E5FF] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t === 'inscripciones' ? `Inscripciones (${registrations.length})` : t === 'escala' ? 'Escala de puntos' : 'Resultados'}
          </button>
        ))}
      </div>

      {/* ── TAB INSCRIPCIONES ─────────────────────────────── */}
      {tab === 'inscripciones' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(f => (
              <button
                key={f}
                onClick={() => setRegFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  regFilter === f ? 'bg-[#00E5FF] text-black' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                {f === 'all' ? 'Todas' : statusLabel[f]}
              </button>
            ))}
          </div>

          {loadingRegs ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#00E5FF]/30 border-t-[#00E5FF] rounded-full animate-spin" />
            </div>
          ) : filteredRegs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">No hay inscripciones{regFilter !== 'all' ? ` con estado "${statusLabel[regFilter]}"` : ''}</div>
          ) : (
            <div className="space-y-3">
              {filteredRegs.map(reg => (
                <div key={reg.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusBadge[reg.status] ?? 'bg-white/10 text-gray-400'}`}>
                          {statusLabel[reg.status] ?? reg.status}
                        </span>
                        <span className="text-[10px] text-gray-500">{reg.category}</span>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {reg.player1?.full_name ?? '—'} & {reg.player2?.full_name ?? '—'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(reg.registered_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {reg.notes && (
                        <p className="text-xs text-gray-400 mt-1 italic">"{reg.notes}"</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {reg.payment_proof && (
                        <button
                          onClick={() => viewProof(reg.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Eye size={12} /> Comprobante
                        </button>
                      )}
                      {reg.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(reg.id, 'confirmed')}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          >
                            <Check size={12} /> Confirmar
                          </button>
                          <button
                            onClick={() => updateStatus(reg.id, 'cancelled')}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <X size={12} /> Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB ESCALA DE PUNTOS ──────────────────────────── */}
      {tab === 'escala' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Define los puntos que otorga cada posición en este torneo. Estos valores se usarán al recalcular el ranking.</p>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center px-4 py-2 border-b border-white/10 text-xs text-gray-400 font-medium uppercase tracking-wider">
              <span className="w-24">Posición</span>
              <span className="flex-1">Puntos</span>
            </div>
            {scale.map((row, idx) => (
              <div key={row.position} className={`flex items-center px-4 py-2.5 ${idx < scale.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="w-24 flex items-center gap-2">
                  <span className="text-base">
                    {row.position === 1 ? '🥇' : row.position === 2 ? '🥈' : row.position === 3 ? '🥉' : ''}
                  </span>
                  <span className="text-sm font-semibold text-white">{row.position}°</span>
                </div>
                <input
                  type="number"
                  min={0}
                  value={row.points}
                  onChange={e => setScale(prev => prev.map((r, i) => i === idx ? { ...r, points: Number(e.target.value) } : r))}
                  className="w-24 bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#00E5FF]/50"
                />
                <span className="text-xs text-gray-500 ml-2">pts</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setScale(prev => [...prev, { position: (prev[prev.length - 1]?.position ?? 0) + 1, points: 10 }])}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <Plus size={14} /> Agregar posición
            </button>
            <button
              onClick={saveScale}
              disabled={scaleSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00E5FF] text-black text-sm font-semibold hover:bg-[#00E5FF]/90 transition-colors disabled:opacity-50"
            >
              <Save size={14} /> {scaleSaving ? 'Guardando...' : 'Guardar escala'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB RESULTADOS ────────────────────────────────── */}
      {tab === 'resultados' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-400">Temporada</label>
              <select
                value={resultsSeason}
                onChange={e => setResultsSeason(Number(e.target.value))}
                className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5"
              >
                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Agregar desde inscriptos confirmados */}
          {confirmedRegs.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Agregar desde inscriptos confirmados:</p>
              <div className="flex flex-wrap gap-2">
                {confirmedRegs.map(reg => {
                  const added = results.some(r => r.player1_id === reg.player1_id && r.player2_id === reg.player2_id)
                  return (
                    <button
                      key={reg.id}
                      onClick={() => addFromRegistration(reg)}
                      disabled={added}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                        added
                          ? 'bg-white/5 border-white/5 text-gray-600 cursor-default'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Plus size={11} />
                      {reg.player1?.full_name?.split(' ')[0]} & {reg.player2?.full_name?.split(' ')[0]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tabla de resultados */}
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((res, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Trophy size={13} className="text-[#00E5FF]" />
                      <input
                        type="number"
                        min={1}
                        value={res.position}
                        onChange={e => updateResult(idx, 'position', Number(e.target.value))}
                        className="w-14 bg-white/5 border border-white/10 text-white text-sm rounded-lg px-2 py-1 text-center"
                      />
                      <span className="text-xs text-gray-500">°</span>
                    </div>
                    <select
                      value={res.category}
                      onChange={e => updateResult(idx, 'category', e.target.value)}
                      className="bg-[#1a1a2e] border border-white/10 text-white text-xs rounded-lg px-2 py-1"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                      onClick={() => removeResult(idx)}
                      className="ml-auto p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Jugadores */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(['player1', 'player2'] as const).map(key => {
                      const nameKey = key === 'player1' ? 'player1_name' : 'player2_name'
                      const idKey = key === 'player1' ? 'player1_id' : 'player2_id'
                      const searchKey = `${idx}_${key}`
                      return (
                        <div key={key} className="relative">
                          <p className="text-gray-500 mb-1">{key === 'player1' ? 'Jugador 1' : 'Jugador 2'}</p>
                          <div className="relative">
                            <input
                              type="text"
                              value={searchQuery[searchKey] ?? res[nameKey] ?? ''}
                              onChange={e => {
                                setSearchQuery(prev => ({ ...prev, [searchKey]: e.target.value }))
                                searchPlayers(searchKey, e.target.value)
                              }}
                              placeholder="Buscar jugador..."
                              className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 pr-7"
                            />
                            <Search size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
                          </div>
                          {(searchResults[searchKey] ?? []).length > 0 && (
                            <div className="absolute top-full mt-1 left-0 right-0 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                              {(searchResults[searchKey] ?? []).map(p => (
                                <button
                                  key={p.id}
                                  onClick={() => {
                                    updateResult(idx, idKey, p.id)
                                    updateResult(idx, nameKey, p.full_name ?? undefined)
                                    setSearchQuery(prev => ({ ...prev, [searchKey]: '' }))
                                    setSearchResults(prev => ({ ...prev, [searchKey]: [] }))
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-white/10 text-xs text-gray-200 transition-colors"
                                >
                                  {p.full_name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No hay resultados ingresados. Agrega equipos desde los inscriptos o manualmente.
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setResults(prev => [...prev, {
                player1_id: '', player2_id: '', category: 'Varones',
                position: prev.length + 1, season: resultsSeason,
              }])}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <Plus size={14} /> Agregar equipo
            </button>
            <button
              onClick={saveResults}
              disabled={savingResults || results.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00E5FF] text-black text-sm font-semibold hover:bg-[#00E5FF]/90 transition-colors disabled:opacity-50"
            >
              <Save size={14} /> {savingResults ? 'Guardando...' : 'Guardar resultados'}
            </button>
          </div>

          {results.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-gray-400 mb-2">Tras guardar, recalcula el ranking global desde el panel de ranking.</p>
              <button
                onClick={() => router.push('/admin/ranking')}
                className="flex items-center gap-1.5 text-xs text-[#00E5FF] hover:underline"
              >
                <RefreshCw size={12} /> Ir a recalcular ranking →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
