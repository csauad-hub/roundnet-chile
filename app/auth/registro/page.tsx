'use client'
import { useState } from 'react'
import { Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSuccess(true)
  }

  if (success) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="text-5xl mb-4">📧</div>
      <h2 className="font-display font-black text-xl text-blue-600 mb-2">¡Revisa tu email!</h2>
      <p className="text-sm text-slate-500 text-center mb-1">Te enviamos un link de confirmación a</p>
      <p className="text-sm font-semibold text-slate-700">{email}</p>
      <Link href="/auth" className="mt-6 text-blue-600 text-sm font-semibold">← Volver al login</Link>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1" style={{background:'linear-gradient(90deg,#C8102E 40%,#1A3A8F 40%)'}} />
      <div className="absolute w-96 h-96 rounded-full bg-blue-50 -top-24 -right-32" />
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="font-display font-black text-4xl text-blue-600 mb-2">RN<span className="text-red-500">CL</span></div>
        <h1 className="font-display font-black text-2xl text-blue-600 mb-1">Crear cuenta</h1>
        <p className="text-sm text-slate-500 mb-8">Únete a la comunidad</p>
        {error && <p className="text-xs text-red-500 mb-3 text-center bg-red-50 w-full px-3 py-2 rounded-lg">{error}</p>}
        <form onSubmit={handleRegister} className="w-full space-y-3">
          <div className="card flex items-center gap-2.5 px-4 py-3">
            <User size={15} className="text-slate-400" />
            <input type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} className="flex-1 text-sm outline-none bg-transparent placeholder-slate-400" required />
          </div>
          <div className="card flex items-center gap-2.5 px-4 py-3">
            <Mail size={15} className="text-slate-400" />
            <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 text-sm outline-none bg-transparent placeholder-slate-400" required />
          </div>
          <div className="card flex items-center gap-2.5 px-4 py-3">
            <Lock size={15} className="text-slate-400" />
            <input type="password" placeholder="Contraseña (mín. 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)} className="flex-1 text-sm outline-none bg-transparent placeholder-slate-400" minLength={6} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-6">¿Ya tienes cuenta? <Link href="/auth" className="text-blue-600 font-semibold">Inicia sesión</Link></p>
      </div>
    </div>
  )
}
