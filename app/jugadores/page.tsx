export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'
import { MapPin, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function JugadoresPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, city, region, instagram, phone')
    .eq('visible_in_directory', true)
    .order('full_name', { ascending: true, nullsFirst: false })

  const list = data ?? []

  return (
    <div className="flex flex-col min-h-screen animate-in">
      <Topbar title="Jugadores" />
      <main className="flex-1 pb-24 bg-slate-50">
        <div className="px-4 pt-4">
          <p className="text-xs text-slate-400 mb-3">
            {list.length} jugador{list.length !== 1 ? 'es' : ''} en el directorio
          </p>

          {list.length === 0 ? (
            <div className="card p-8 text-center">
              <Users size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Aún no hay jugadores en el directorio</p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Los jugadores pueden aparecer aquí activando la opción
                &quot;Visible en directorio&quot; desde su perfil.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {list.map(p => {
                const initial = (p.full_name || '?')[0].toUpperCase()
                const location = [p.city, p.region].filter(Boolean).join(', ')
                return (
                  <Link key={p.id} href={`/jugadores/${p.id}`} className="card px-4 py-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
                    {p.avatar_url ? (
                      <img
                        src={p.avatar_url}
                        alt={p.full_name || ''}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                        {initial}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-black text-sm text-slate-800">
                        {p.full_name || 'Sin nombre'}
                      </p>
                      {location && (
                        <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <MapPin size={11} className="flex-shrink-0" />
                          {location}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
