'use client'
import Image from 'next/image'
import Link from 'next/link'
import { LogIn, ShieldCheck, Plus, Trophy, Newspaper } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Topbar({ title }: { title?: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [initials, setInitials] = useState('?')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const supabase = createClient()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const name = user.user_metadata?.full_name || user.email || ''
        const parts = name.trim().split(' ')
        setInitials((parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase())
        const res = await fetch('/api/me')
        const data = await res.json()
        setIsAdmin(data.role === 'admin')
      }
    }
    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) { setInitials('?'); setIsAdmin(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowCreateMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <div className="top-stripe" />
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Roundnet Chile" width={32} height={32} className="object-contain" />
            <div className="font-display font-extrabold text-sm leading-tight">
              {title ? <span className="text-slate-800">{title}</span> : <><span className="text-blue-600">Roundnet</span> <span className="text-red-500">Chile</span></>}
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <Link href="/admin" className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                  <ShieldCheck size={13} /> Admin
                </Link>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowCreateMenu(!showCreateMenu)}
                    className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    <Plus size={13} /> Crear
                  </button>
                  {showCreateMenu && (
                    <div className="absolute right-0 top-9 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 min-w-[170px] z-50">
                      <p className="px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Crear nuevo</p>
                      <Link href="/admin/torneos/nuevo" onClick={() => setShowCreateMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium">
                        <Trophy size={15} className="text-blue-500" /> Torneo
                      </Link>
                      <Link href="/admin/noticias/nuevo" onClick={() => setShowCreateMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium">
                        <Newspaper size={15} className="text-blue-500" /> Noticia
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}

            {user ? (
              <Link href="/perfil" className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold font-display">
                {initials}
              </Link>
            ) : (
              <Link href="/auth" className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50">
                <LogIn size={14} /> Entrar
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
