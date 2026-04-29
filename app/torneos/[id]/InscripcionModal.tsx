'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Search, Upload, CheckCircle, AlertCircle, ImageIcon } from 'lucide-react'

type Profile = { id: string; full_name: string | null; avatar_url: string | null }

const CATEGORIES = ['Varones', 'Damas'] as const

interface Props {
  tournamentId: string
  tournamentName: string
  pricePerTeam: number | null
  userId: string
}

export default function InscripcionModal({ tournamentId, tournamentName, pricePerTeam, userId }: Props) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'form' | 'success' | 'error'>('form')
  const [errorMsg, setErrorMsg] = useState('')

  // Mis datos
  const [myProfile, setMyProfile] = useState<Profile | null>(null)

  // Pareja
  const [partnerQuery, setPartnerQuery] = useState('')
  const [partnerResults, setPartnerResults] = useState<Profile[]>([])
  const [selectedPartner, setSelectedPartner] = useState<Profile | null>(null)
  const [searching, setSearching] = useState(false)

  // Formulario
  const [category, setCategory] = useState<'Varones' | 'Damas'>('Varones')
  const [notes, setNotes] = useState('')

  // Comprobante
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', userId)
      .single()
      .then(({ data }) => setMyProfile(data))
  }, [open, userId, supabase])

  const searchPartner = useCallback(async (q: string) => {
    if (q.length < 2) { setPartnerResults([]); return }
    setSearching(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .neq('id', userId)
      .ilike('full_name', `%${q}%`)
      .limit(8)
    setPartnerResults(data ?? [])
    setSearching(false)
  }, [userId, supabase])

  useEffect(() => {
    const t = setTimeout(() => searchPartner(partnerQuery), 300)
    return () => clearTimeout(t)
  }, [partnerQuery, searchPartner])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setProofFile(file)
    const reader = new FileReader()
    reader.onload = () => setProofPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function resetForm() {
    setStep('form')
    setPartnerQuery('')
    setPartnerResults([])
    setSelectedPartner(null)
    setCategory('Varones')
    setNotes('')
    setProofFile(null)
    setProofPreview(null)
    setErrorMsg('')
  }

  async function handleSubmit() {
    if (!selectedPartner) { setErrorMsg('Debes seleccionar tu pareja'); return }
    if (!proofFile) { setErrorMsg('Debes subir el comprobante de pago'); return }

    setSubmitting(true)
    setErrorMsg('')

    try {
      // 1. Subir comprobante a Supabase Storage
      setUploading(true)
      const ext = proofFile.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/${tournamentId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(path, proofFile, { upsert: true })

      if (uploadError) throw new Error('Error al subir comprobante: ' + uploadError.message)
      setUploading(false)

      // 2. Crear inscripción
      const res = await fetch('/api/inscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournament_id: tournamentId,
          player2_id: selectedPartner.id,
          category,
          payment_proof: path,
          notes: notes || null,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error al inscribirse')

      setStep('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido')
      setStep('error')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); resetForm() }}
        className="w-full mt-3 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold text-center shadow-md hover:bg-blue-700 transition-colors"
      >
        Inscribirse ahora →
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="font-display font-black text-base text-slate-800">Inscripción</h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[240px]">{tournamentName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {step === 'success' ? (
                <div className="flex flex-col items-center text-center py-6 gap-4">
                  <CheckCircle size={48} className="text-emerald-500" />
                  <div>
                    <p className="font-display font-black text-lg text-slate-800">¡Inscripción enviada!</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Tu comprobante fue enviado. Un administrador verificará el pago y confirmará tu inscripción pronto.
                    </p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold"
                  >
                    Entendido
                  </button>
                </div>
              ) : step === 'error' ? (
                <div className="flex flex-col items-center text-center py-6 gap-4">
                  <AlertCircle size={48} className="text-red-500" />
                  <div>
                    <p className="font-display font-black text-lg text-slate-800">Algo salió mal</p>
                    <p className="text-sm text-red-500 mt-2">{errorMsg}</p>
                  </div>
                  <button
                    onClick={() => setStep('form')}
                    className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              ) : (
                <>
                  {/* Jugador 1 (yo) */}
                  <section>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Jugador 1 (tú)</p>
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                      {myProfile?.avatar_url ? (
                        <img src={myProfile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                          {(myProfile?.full_name ?? '?')[0]}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-slate-800">
                        {myProfile?.full_name ?? 'Tu perfil'}
                      </span>
                    </div>
                  </section>

                  {/* Jugador 2 */}
                  <section>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Jugador 2 (pareja)</p>
                    {selectedPartner ? (
                      <div className="flex items-center gap-3 bg-emerald-50 rounded-xl px-4 py-3">
                        {selectedPartner.avatar_url ? (
                          <img src={selectedPartner.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold flex-shrink-0">
                            {(selectedPartner.full_name ?? '?')[0]}
                          </div>
                        )}
                        <span className="flex-1 text-sm font-semibold text-slate-800">
                          {selectedPartner.full_name}
                        </span>
                        <button
                          onClick={() => { setSelectedPartner(null); setPartnerQuery('') }}
                          className="text-xs text-slate-400 hover:text-red-500"
                        >
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                          <Search size={14} className="text-slate-400 flex-shrink-0" />
                          <input
                            type="text"
                            value={partnerQuery}
                            onChange={e => setPartnerQuery(e.target.value)}
                            placeholder="Buscar por nombre..."
                            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                          />
                          {searching && (
                            <div className="w-3 h-3 border-2 border-blue-400/40 border-t-blue-500 rounded-full animate-spin" />
                          )}
                        </div>
                        {partnerResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden max-h-48 overflow-y-auto">
                            {partnerResults.map(p => (
                              <button
                                key={p.id}
                                onClick={() => { setSelectedPartner(p); setPartnerQuery(''); setPartnerResults([]) }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                              >
                                {p.avatar_url ? (
                                  <img src={p.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                                    {(p.full_name ?? '?')[0]}
                                  </div>
                                )}
                                <span className="text-sm text-slate-800">{p.full_name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {partnerQuery.length >= 2 && !searching && partnerResults.length === 0 && (
                          <p className="text-xs text-slate-400 mt-2 px-1">No se encontraron jugadores con ese nombre</p>
                        )}
                      </div>
                    )}
                  </section>

                  {/* Categoría */}
                  <section>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Categoría</p>
                    <div className="flex gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                            category === cat
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Comprobante de pago */}
                  <section>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Comprobante de pago</p>
                    {pricePerTeam && (
                      <p className="text-xs text-slate-500 mb-3">
                        Transfiere <strong>${Number(pricePerTeam).toLocaleString('es-CL')}</strong> y sube la foto del comprobante.
                      </p>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {proofPreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <img src={proofPreview} alt="Comprobante" className="w-full max-h-48 object-contain" />
                        <button
                          onClick={() => { setProofFile(null); setProofPreview(null); if (fileRef.current) fileRef.current.value = '' }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full flex flex-col items-center gap-2 py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-300 hover:text-blue-400 transition-colors"
                      >
                        <div className="flex gap-2">
                          <ImageIcon size={20} />
                          <Upload size={20} />
                        </div>
                        <span className="text-xs font-medium">Toca para subir foto o tomar una</span>
                      </button>
                    )}
                  </section>

                  {/* Notas opcionales */}
                  <section>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Notas <span className="font-normal">(opcional)</span></p>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Algún comentario para el organizador..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-300 resize-none"
                    />
                  </section>

                  {errorMsg && (
                    <p className="text-xs text-red-500 bg-red-50 px-4 py-3 rounded-xl">{errorMsg}</p>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {step === 'form' && (
              <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedPartner || !proofFile}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  {uploading ? 'Subiendo comprobante...' : submitting ? 'Enviando inscripción...' : 'Enviar inscripción'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
