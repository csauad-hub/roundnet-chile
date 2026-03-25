import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Shield, Calendar } from 'lucide-react'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/perfil')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Usuario'
  const isAdmin = profile?.role === 'admin'
  const joinDate = new Date(user.created_at).toLocaleDateString('es-CL', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#0d0d1a' }}>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Tu información de cuenta en Roundnet Chile
          </p>
        </div>

        {/* Avatar + name card */}
        <div className="rounded-2xl p-6 border flex items-center gap-5" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover ring-2"
              style={{ ringColor: '#00E5FF' }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #00E5FF22, #7B2FFF22)', border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF' }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-white">{displayName}</h2>
            <div className="flex items-center gap-2 mt-1">
              {isAdmin ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,229,255,0.15)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.3)' }}>
                  Admin
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Usuario
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Mail size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Correo</p>
              <p className="text-sm text-white">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Shield size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Rol</p>
              <p className="text-sm text-white capitalize">{profile?.role || 'usuario'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-5 py-4">
            <Calendar size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Miembro desde</p>
              <p className="text-sm text-white">{joinDate}</p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            Cerrar sesión
          </button>
        </form>

        {isAdmin && (
          <a
            href="/admin"
            className="block w-full py-3 rounded-xl text-sm font-medium text-center transition-all hover:opacity-80"
            style={{ background: 'rgba(0,229,255,0.1)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.2)' }}
          >
            Ir al Panel Admin →
          </a>
        )}
      </div>
    </div>
  )
}
