import Image from 'next/image'
import Link from 'next/link'
import { Bell } from 'lucide-react'
export default function Topbar({ title }: { title?: string }) {
  return (
    <>
      <div className="top-stripe" />
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/Logo Oficial Roundnet Chile-01.png" alt="Roundnet Chile" width={32} height={32} className="object-contain" />
            <div className="font-display font-extrabold text-sm leading-tight">
              {title ? <span className="text-slate-800">{title}</span> : <><span className="text-blue-600">Roundnet</span> <span className="text-red-500">Chile</span></>}
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button className="relative"><Bell size={22} className="text-slate-500" strokeWidth={1.8} /><span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" /></button>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold font-display">MA</div>
          </div>
        </div>
      </header>
    </>
  )
}
