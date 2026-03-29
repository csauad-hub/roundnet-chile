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
      try { accessToken = JSON.parse(decodeURIComponent(tokenValue)).access_token }
      catch { try { accessToken = JSON.parse(tokenValue).access_token } catch {} }
    }
  }
  if (!accessToken) redirect('/auth?next=/admin')
  const admin = createAdminClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: { user } } = await admin.auth.getUser(accessToken)
  if (!user) redirect('/auth?next=/admin')
  const { data: profile } = await admin.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')
  const displayName = profile?.full_name || user.email || 'Admin'

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-white font-semibold">Panel Admin</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/admin/torneos" className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
                <Trophy className="w-4 h-4" />
                Torneos
              </Link>
              <Link href="/admin/usuarios" className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
                <Users className="w-4 h-4" />
                Usuarios
              </Link>
              <Link href="/admin/noticias" className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
                <Newspaper className="w-4 h-4" />
                Noticias
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm transition-colors border border-cyan-400/30 hover:border-cyan-300/50 px-3 py-1.5 rounded-lg">
                <Home className="w-4 h-4" />
                Ver App
              </Link>
              <span className="text-gray-300 text-sm">{displayName}</span>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
