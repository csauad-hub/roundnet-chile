import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Instagram, MessageCircle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import BottomNav from '@/components/layout/BottomNav'

export const dynamic = 'force-dynamic'

function whatsappUrl(phone: string): string {
  // Strip everything except digits, then build wa.me link
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}`
}

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: player } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, city, region, instagram, phone, visible_in_directory')
    .eq('id', id)
    .eq('visible_in_directory', true)
    .single()

  if (!player) notFound()

  const initial = (player.full_name || '?')[0].toUpperCase()
  const location = [player.city, player.region].filter(Boolean).join(', ')
  const igHandle = player.instagram?.replace('@', '')

  return (
    <div className="flex flex-col min-h-screen animate-in bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/jugadores">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <span className="font-display font-bold text-sm flex-1 text-slate-800">Perfil del jugador</span>
        </div>
      </div>

      <main className="flex-1 pb-24">
        {/* Hero */}
        <div className="bg-white border-b border-slate-100 px-5 pt-8 pb-6 flex flex-col items-center text-center">
          {player.avatar_url ? (
            <img
              src={player.avatar_url}
              alt={player.full_name || ''}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100 mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-black mb-4">
              {initial}
            </div>
          )}
          <h1 className="font-display font-black text-xl text-slate-800">
            {player.full_name || 'Jugador'}
          </h1>
          {location && (
            <p className="flex items-center gap-1 text-sm text-slate-400 mt-1">
              <MapPin size={13} />
              {location}
            </p>
          )}
        </div>

        {/* Contact buttons */}
        {(igHandle || player.phone) && (
          <section className="px-4 mt-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Contacto</p>
            <div className="flex flex-col gap-3">
              {igHandle && (
                <a
                  href={`https://instagram.com/${igHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card flex items-center gap-4 px-5 py-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0">
                    <Instagram size={18} className="text-pink-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Instagram</p>
                    <p className="text-sm font-semibold text-slate-800">@{igHandle}</p>
                  </div>
                  <span className="text-xs text-pink-500 font-medium">Ver perfil →</span>
                </a>
              )}

              {player.phone && (
                <a
                  href={whatsappUrl(player.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card flex items-center gap-4 px-5 py-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={18} className="text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">WhatsApp</p>
                    <p className="text-sm font-semibold text-slate-800">{player.phone}</p>
                  </div>
                  <span className="text-xs text-green-500 font-medium">Chatear →</span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* No contact info */}
        {!igHandle && !player.phone && (
          <section className="px-4 mt-5">
            <div className="card p-6 text-center">
              <p className="text-sm text-slate-400">Este jugador no ha compartido información de contacto.</p>
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
