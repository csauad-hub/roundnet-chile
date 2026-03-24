'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, MessageSquare, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
const NAV = [{ href:'/', label:'Inicio', Icon:Home },{ href:'/torneos', label:'Torneos', Icon:Trophy },{ href:'/comunidad', label:'Comunidad', Icon:MessageSquare },{ href:'/jugadores', label:'Jugadores', Icon:Users }]
export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-200 z-50 shadow-[0_-4px_20px_rgba(26,58,143,0.07)]">
      <div className="flex pb-safe pt-2">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-1 py-1 cursor-pointer">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-all', active && 'bg-blue-50')}>
                <Icon size={20} className={cn('transition-colors', active ? 'text-blue-600' : 'text-slate-400')} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={cn('text-[10px] font-semibold font-display tracking-wide transition-colors', active ? 'text-blue-600' : 'text-slate-400')}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}