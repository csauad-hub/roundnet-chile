'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Settings2 } from 'lucide-react'

type Tournament = { id: string; name: string; city: string; date: string; status: string }

export default function AdminTorneos() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('tournaments').select('id,name,city,date,status').order('date', { ascending: false })
      .then(({ data }) => { setTournaments(data ?? []); setLoading(false) })
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este torneo? Esta acción no se puede deshacer.')) return
    const { error } = await supabase.from('tournaments').delete().eq('id', id)
    if (!error) setTournaments(t => t.filter(x => x.id !== id))
    else alert('Error al eliminar: ' + error.message)
  }

  const statusLabel: Record<string, string> = {
    upcoming: 'Próximo',
    ongoing: 'En curso',
    finished: 'Finalizado',
    cancelled: 'Cancelado',
  }

  const statusColor: Record<string, string> = {
    upcoming: 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20',
    ongoing: 'bg-green-500/10 text-green-400 border border-green-500/20',
    finished: 'bg-white/5 text-gray-400 border border-white/10',
    cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Torneos</h1>
          <p className="text-gray-400 mt-1">{tournaments.length} torneos registrados</p>
        </div>
        <Link href="/admin/torneos/nuevo"
          className="flex items-center gap-2 bg-[#00E5FF] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#00E5FF]/90 transition-colors">
          <Plus size={16} /> Nuevo Torneo
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#00E5FF]/30 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : tournaments.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>No hay torneos todavía.</p>
          <Link href="/admin/torneos/nuevo" className="mt-3 inline-block text-[#00E5FF] text-sm hover:underline">
            Crear el primero →
          </Link>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Torneo</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Fecha</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Estado</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tournaments.map(t => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{t.city}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{t.date ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[t.status] ?? 'bg-white/5 text-gray-400'}`}>
                      {statusLabel[t.status] ?? t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/admin/torneos/${t.id}`}
                        className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Gestionar inscripciones y resultados">
                        <Settings2 size={15} />
                      </Link>
                      <Link href={`/admin/torneos/editar/${t.id}`}
                        className="p-1.5 text-gray-400 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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
    </div>
  )
}
