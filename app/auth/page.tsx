'use client'

import { Suspense, useState, useEffect } from 'react'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

// Inner component — uses useSearchParams, must be inside <Suspense>
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Show error from URL param (e.g. after a failed OAuth callback redirect)
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) {
      setError('No se pudo iniciar sesión con Google. Por favor, intenta de nuevo.')
    }
  }, [searchParams])

  const next = searchParams.get('next') ?? '/'

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    if (error) {
      setError('No se pudo conectar con Google. Por favor, intenta de nuevo.')
      setLoading(false)
    }
    // No setLoading(false) on success — the browser navigates away
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push(next)
    }
  }

  function handleGuest() {
    document.cookie = 'guest_bypass=1; path=/; max-age=86400'
    router.push('/')
  }

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
      <Image src="/logo.svg" alt="Roundnet Chile" width={80} height={80} className="object-contain mb-2" />
      <h1 className="font-display font-black text-2xl text-blue-600">Roundnet <span className="text-red-500">Chile</span></h1>
      <p className="text-sm text-slate-500 mt-1 mb-8">La comunidad nacional</p>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 rounded-xl py-3.5 text-sm font-semibold text-slate-700 hover:border-blue-300 mb-4 shadow-sm disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
        Continuar con Google
      </button>

      <div className="w-full flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400">o con email</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {error && <p className="text-xs text-red-500 mt-2 mb-1 bg-red-50 w-full text-center px-3 py-2 rounded-lg">{error}</p>}

      <form onSubmit={handleLogin} className="w-full mt-3 space-y-3">
        <div className="card flex items-center gap-2.5 px-4 py-3">
          <Mail size={15} className="text-slate-400" />
          <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 text-sm outline-none bg-transparent placeholder-slate-400" required />
        </div>
        <div className="card flex items-center gap-2.5 px-4 py-3">
          <Lock size={15} className="text-slate-400" />
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="flex-1 text-sm outline-none bg-transparent placeholder-slate-400" required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-60">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="text-xs text-slate-400 mt-5">¿No tienes cuenta? <Link href="/auth/registro" className="text-blue-600 font-semibold">Regístrate gratis</Link></p>

      <button onClick={handleGuest} className="mt-4 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
        Continuar sin iniciar sesión <ArrowRight size={12} />
      </button>
    </div>
  )
}

// Outer page — wraps LoginForm in Suspense (required for useSearchParams in App Router)
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1" style={{background:'linear-gradient(90deg,#C8102E 40%,#1A3A8F 40%)'}} />
      <div className="absolute w-96 h-96 rounded-full bg-blue-50 -top-24 -right-32" />
      <div className="absolute w-64 h-64 rounded-full bg-red-50 -bottom-16 -left-24" />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
