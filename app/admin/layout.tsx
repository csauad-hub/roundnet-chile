import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Trophy, Users, Newspaper, LogOut } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/')

  const displayName = profile?.full_name || user.email || 'Admin'

  const navItems = [
    { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
    { href: '/admin/torneos', label: 'Torneos', Icon: Trophy },
    { href: '/admin/usuarios', label: 'Usuarios', Icon: Users },
    { href: '/admin/noticias', label: 'Noticias', Icon: Newspaper },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-1" style={{background:'linear-gradient(90deg,#C8102E 40%,#1A3A8F 40%)'}} />
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-blue-600">Admin</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 text-xs">Roundnet Chile</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:block">{displayName}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold">
              <LogOut size={14} /> Salir
            </button>
          </form>
        </div>
      </header>
      <nav className="bg-white border-b border-slate-100 px-3 flex gap-1 overflow-x-auto">
        {navItems.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg whitespace-nowrap transition-colors">
            <Icon size={14} />{label}
          </Link>
        ))}
      </nav>
      <main className="p-4 max-w-2xl mx-auto">{children}</main>
    </div>
  )
}
