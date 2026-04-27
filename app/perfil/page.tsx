import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Mail, Shield, Calendar, ChevronRight, LayoutDashboard } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import PlayerProfileForm from './PlayerProfileForm'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/perfil')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Usuario'
  const isAdmin = profile?.role === 'admin'
  const joinDate = new Date(user.created_at).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex flex-col min-h-screen animate-in">
      <Topbar title="Mi Perfil" />
      <main className="flex-1 pb-24 bg-slate-50">
        {/* Avatar card */}
        <section className="px-4 mt-4">
          <div className="card p-5 flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
                {initial}
              </div>
            )}
            <div>
              <h2 className="font-display font-black text-lg text-slate-800">{displayName}</h2>
              <span className={
                isAdmin
                  ? 'text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200'
              }>
                {isAdmin ? 'Admin' : 'Usuario'}
              </span>
            </div>
          </div>
        </section>

        {/* Info rows */}
        <section className="px-4 mt-4">
          <div className="card divide-y divide-slate-100">
            <div className="flex items-center gap-4 px-5 py-4">
              <Mail size={16} className="text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Correo</p>
                <p className="text-sm font-medium text-slate-800 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-5 py-4">
              <Shield size={16} className="text-slate-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">Rol</p>
                <p className="text-sm font-medium text-slate-800 capitalize">{profile?.role || 'usuario'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-5 py-4">
              <Calendar size={16} className="text-slate-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">Miembro desde</p>
                <p className="text-sm font-medium text-slate-800">{joinDate}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Player profile form */}
        <PlayerProfileForm profile={{
          id: user.id,
          full_name: profile?.full_name || null,
          city: profile?.city || null,
          region: profile?.region || null,
          instagram: profile?.instagram || null,
          phone: profile?.phone || null,
          visible_in_directory: profile?.visible_in_directory ?? false,
        }} />

        {/* Admin link */}
        {isAdmin && (
          <section className="px-4 mt-4">
            <Link
              href="/admin"
              className="card flex items-center gap-4 px-5 py-4"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <LayoutDashboard size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Panel de administración</p>
                <p className="text-xs text-slate-400">Gestionar torneos, noticias y usuarios</p>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </Link>
          </section>
        )}

        {/* Sign out */}
        <section className="px-4 mt-4">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl text-sm font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </section>
      </main>
      <BottomNav />
    </div>
  )
}
