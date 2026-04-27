'use client'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Instagram, Phone, MapPin, Eye, EyeOff, Save, User } from 'lucide-react'

type Props = {
  profile: {
    id: string
    full_name: string | null
    city: string | null
    region: string | null
    instagram: string | null
    phone: string | null
    visible_in_directory: boolean
  }
}

const REGIONS = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
  'Valparaíso', 'Metropolitana', 'O\'Higgins', 'Maule', 'Ñuble',
  'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes',
]

export default function PlayerProfileForm({ profile }: Props) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    city: profile.city || '',
    region: profile.region || '',
    instagram: profile.instagram || '',
    phone: profile.phone || '',
    visible_in_directory: profile.visible_in_directory ?? false,
  })

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setSaving(false)
      setError('Sesión expirada. Por favor recarga la página.')
      return
    }

    // upsert handles both insert (no row yet) and update
    const { error: err } = await supabase
      .from('profiles')
      .upsert({
        id: profile.id,
        full_name: form.full_name || null,
        city: form.city || null,
        region: form.region || null,
        instagram: form.instagram?.replace('@', '') || null,
        phone: form.phone || null,
        visible_in_directory: form.visible_in_directory,
        updated_at: new Date().toISOString(),
      })
    setSaving(false)
    if (err) {
      setError(`Error: ${err.message}`)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <section className="px-4 mt-4">
      <div className="card p-5">
        <h3 className="font-display font-black text-slate-800 mb-1">Editar perfil</h3>
        <p className="text-xs text-slate-400 mb-4">
          Esta información es opcional y controla cómo apareces en el directorio de jugadores.
        </p>

        {/* Nombre */}
        <div className="mb-3">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <User size={12} /> Nombre completo
          </label>
          <input
            type="text"
            value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            placeholder="Tu nombre"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Ciudad */}
        <div className="mb-3">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <MapPin size={12} /> Ciudad
          </label>
          <input
            type="text"
            value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            placeholder="Ej: Santiago"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Región */}
        <div className="mb-3">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <MapPin size={12} /> Región
          </label>
          <select
            value={form.region}
            onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Selecciona tu región</option>
            {REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Instagram */}
        <div className="mb-3">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <Instagram size={12} /> Instagram (sin @)
          </label>
          <input
            type="text"
            value={form.instagram}
            onChange={e => setForm(f => ({ ...f, instagram: e.target.value.replace('@', '') }))}
            placeholder="tu_usuario"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Teléfono */}
        <div className="mb-4">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <Phone size={12} /> Teléfono / WhatsApp
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+56 9 1234 5678"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Visible en directorio */}
        <button
          onClick={() => setForm(f => ({ ...f, visible_in_directory: !f.visible_in_directory }))}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border mb-4 transition-colors ${
            form.visible_in_directory
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            {form.visible_in_directory ? <Eye size={16} /> : <EyeOff size={16} />}
            <div className="text-left">
              <p className="text-sm font-semibold">
                {form.visible_in_directory ? 'Visible en el directorio' : 'No visible en el directorio'}
              </p>
              <p className="text-xs opacity-70">Aparece en la sección Jugadores</p>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full flex-shrink-0 transition-colors ${form.visible_in_directory ? 'bg-blue-600' : 'bg-slate-300'}`}>
            <div className={`w-4 h-4 mt-0.5 rounded-full bg-white shadow transition-transform ${form.visible_in_directory ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
          </div>
        </button>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
            saved
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60'
          }`}
        >
          <Save size={15} />
          {saved ? '¡Guardado ✓' : saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </section>
  )
}
