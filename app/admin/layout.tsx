import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Trophy, Users, Newspaper, LogOut, Home } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]

  let accessToken: string | undefined

  if (projectRef) {
    const baseName = `sb-${projectRef}-auth-token`

    // Try single cookie first, then chunked
    let tokenValue = cookieStore.get(baseName)?.value
    if (!tokenValue) {
      const chunks: string[] = []
      for (let i = 0; i < 10; i++) {
        const chunk = cookieStore.get(`${baseName}.${i}`)?.value
        if (!chunk) break
        chunks.push(chunk)
      }
      if (chunks.length > 0) tokenValue = chunks.join('')
    }

    if (tokenValue) {
      try {
        // Handle base64- prefix used by @supabase/ssr v0.5+
        let decoded = decodeURIComponent(tokenValue)
        if (decoded.startsWith('base64-')) {
          decoded = atob(decoded.slice(7))
        }
        accessToken = JSON.parse(decoded).access_token
      } catch {
        try {
          let val = tokenValue
          if (val.startsWith('base64-')) {
            val = atob(val.slice(7))
          }
          accessToken = JSON.parse(val).access_token
        } catch {}
      }
    }
  }

  if (!accessToken) redirect('/auth?next=/admin')

  const admin = createAdminClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: { user } } = await admin.auth.getUser(accessToken)
  if (!user) redirect('/auth?next=/admin')

  const { data: profile } = await admin
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const displayName = profile?.full_name || user.email || 'Admin'

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 100 }} className="bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-52 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 h-full">
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="text-white font-semibold text-sm">Panel Admin</span>
        </div>
        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors">
            <LayoutDashboard className="w-4 h-4 shrink-0" /> Dashboard
          </Link>
          <Link href="/admin/torneos" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors">
            <Trophy className="w-4 h-4 shrink-0" /> Torneos
          </Link>
          <Link href="/admin/usuarios" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors">
            <Users className="w-4 h-4 shrink-0" /> Usuarios
          </Link>
          <Link href="/admin/noticias" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors">
            <Newspaper className="w-4 h-4 shrink-0" /> Noticias
          </Link>
        </nav>
        {/* Bottom */}
        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/5 text-sm transition-colors border border-cyan-400/20 hover:border-cyan-300/40">
            <Home className="w-4 h-4 shrink-0" /> Ver App
          </Link>
          <div className="flex items-center gap-2.5 px-3 py-2 text-gray-400 text-sm">
            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white font-medium shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-xs">{displayName}</span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors">
              <LogOut className="w-4 h-4 shrink-0" /> Salir
            </button>
          </form>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 min-w-0">
        {children}
      </main>
    </div>
  )
}
