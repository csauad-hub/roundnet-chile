import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Trophy, Instagram, ExternalLink } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'

export default async function ComunidadPage() {
  const supabase = await createClient()
  const [{ count: players }, { count: tournaments }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('tournaments').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="flex flex-col min-h-screen animate-in">
      <Topbar title="Comunidad" />
      <main className="flex-1 pb-24 bg-slate-50">

        {/* Stats */}
        <section className="px-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-5 text-center">
              <p className="text-3xl font-black text-blue-600 mb-1">{players ?? 0}</p>
              <p className="text-xs font-medium text-slate-500">Jugadores</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-3xl font-black text-blue-600 mb-1">{tournaments ?? 0}</p>
              <p className="text-xs font-medium text-slate-500">Torneos realizados</p>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="px-4 mt-4">
          <div className="card p-5">
            <h2 className="font-display font-black text-base text-slate-800 mb-3">¿Qué es Roundnet?</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Roundnet (también conocido como Spikeball) es un deporte de raqueta que se juega 2 contra 2.
              Los equipos se alternan golpeando una pelota hacia una red redonda. Si el equipo contrario no
              puede devolver la pelota, el equipo atacante anota un punto.
            </p>
            <p className="text-sm leading-relaxed text-slate-600 mt-3">
              En Chile, la comunidad sigue creciendo con torneos en todo el país. ¡Únete y empieza a jugar!
            </p>
          </div>
        </section>

        {/* Links */}
        <section className="px-4 mt-4">
          <h2 className="section-title mb-2.5">Síguenos</h2>
          <div className="flex flex-col gap-2">
            <a
              href="https://www.instagram.com/roundnetchile"
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center gap-4 px-4 py-4"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-pink-50">
                <Instagram size={20} className="text-pink-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Instagram</p>
                <p className="text-xs text-slate-400">@roundnetchile</p>
              </div>
              <ExternalLink size={14} className="text-slate-300" />
            </a>

            <Link
              href="/torneos"
              className="card flex items-center gap-4 px-4 py-4"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50">
                <Trophy size={20} className="text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Torneos</p>
                <p className="text-xs text-slate-400">Ver calendario de torneos</p>
              </div>
            </Link>
          </div>
        </section>

      </main>
      <BottomNav />
    </div>
  )
}
