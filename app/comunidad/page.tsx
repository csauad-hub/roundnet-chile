import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Trophy, Instagram, ExternalLink, Globe } from 'lucide-react'

export default async function ComunidadPage() {
  const supabase = createClient()

  const [{ count: players }, { count: tournaments }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('tournaments').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#0d0d1a' }}>
      <div className="max-w-2xl mx-auto space-y-10">

        {/* Hero */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #00E5FF22, #7B2FFF22)', border: '1px solid rgba(0,229,255,0.25)' }}>
            <Users size={28} style={{ color: '#00E5FF' }} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Comunidad</h1>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
            La comunidad de Roundnet Chile está creciendo.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-5 text-center border" style={{ background: 'rgba(0,229,255,0.05)', borderColor: 'rgba(0,229,255,0.15)' }}>
            <p className="text-4xl font-bold mb-1" style={{ color: '#00E5FF' }}>{players ?? 0}</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Jugadores registrados</p>
          </div>
          <div className="rounded-2xl p-5 text-center border" style={{ background: 'rgba(123,47,255,0.05)', borderColor: 'rgba(123,47,255,0.15)' }}>
            <p className="text-4xl font-bold mb-1" style={{ color: '#7B2FFF' }}>{tournaments ?? 0}</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Torneos realizados</p>
          </div>
        </div>

        {/* About */}
        <div className="rounded-2xl p-6 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <h2 className="text-lg font-semibold text-white mb-3">¿Qué es Roundnet?</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Roundnet (también conocido como Spikeball) es un deporte de raqueta que se juega 2 contra 2.
            Los equipos se alternan golpeando una pelota hacia una red redonda. Si el equipo contrario
            no puede devolver la pelota, el equipo atacante anota un punto.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
            En Chile, la comunidad sigue creciendo con torneos en todo el país.
            ¡Únete y empieza a jugar!
          </p>
        </div>

        {/* Links */}
        <div>
          <h2 className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Síguenos</h2>
          <div className="space-y-3">
            <a
              href="https://www.instagram.com/roundnetchile"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-4 py-4 rounded-xl border transition-all hover:border-pink-400/30"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(236,72,153,0.15)' }}>
                <Instagram size={18} style={{ color: '#ec4899' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Instagram</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>@roundnetchile</p>
              </div>
              <ExternalLink size={14} className="ml-auto" style={{ color: 'rgba(255,255,255,0.3)' }} />
            </a>

            <Link
              href="/torneos"
              className="flex items-center gap-4 px-4 py-4 rounded-xl border transition-all hover:border-cyan-400/30"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,229,255,0.15)' }}>
                <Trophy size={18} style={{ color: '#00E5FF' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Torneos</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Ver calendario de torneos</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
