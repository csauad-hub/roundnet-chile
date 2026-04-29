import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className }: { src: string; alt: string; width?: number; height?: number; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} className={className} />
  ),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className, onClick }: { href: string; children: React.ReactNode; className?: string; onClick?: () => void }) => (
    <a href={href} className={className} onClick={onClick}>{children}</a>
  ),
}))

import { createClient } from '@/lib/supabase/client'
vi.mock('@/lib/supabase/client')

import Topbar from './Topbar'

function makeMockSupabase(user: object | null, role: string) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  }
}

describe('Topbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('unauthenticated state', () => {
    it('shows Login button when no user', async () => {
      vi.mocked(createClient).mockReturnValue(makeMockSupabase(null, '') as any)
      render(<Topbar />)
      await waitFor(() => {
        expect(screen.getByText('Entrar')).toBeInTheDocument()
      })
    })

    it('Login button links to /auth', async () => {
      vi.mocked(createClient).mockReturnValue(makeMockSupabase(null, '') as any)
      render(<Topbar />)
      await waitFor(() => {
        expect(screen.getByText('Entrar').closest('a')).toHaveAttribute('href', '/auth')
      })
    })
  })

  describe('authenticated regular user', () => {
    it('shows user initials when logged in', async () => {
      vi.mocked(createClient).mockReturnValue(makeMockSupabase(
        { user_metadata: { full_name: 'Juan Pérez' } }, 'user'
      ) as any);
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        json: () => Promise.resolve({ role: 'user' }),
      })
      render(<Topbar />)
      await waitFor(() => {
        expect(screen.getByText('JP')).toBeInTheDocument()
      })
    })

    it('initials link to /perfil', async () => {
      vi.mocked(createClient).mockReturnValue(makeMockSupabase(
        { user_metadata: { full_name: 'Juan Pérez' } }, 'user'
      ) as any);
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        json: () => Promise.resolve({ role: 'user' }),
      })
      render(<Topbar />)
      await waitFor(() => {
        expect(screen.getByText('JP').closest('a')).toHaveAttribute('href', '/perfil')
      })
    })

    it('does not show Admin or Crear buttons', async () => {
      vi.mocked(createClient).mockReturnValue(makeMockSupabase(
        { user_metadata: { full_name: 'Regular User' } }, 'user'
      ) as any);
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        json: () => Promise.resolve({ role: 'user' }),
      })
      render(<Topbar />)
      await waitFor(() => screen.getByText('RU'))
      expect(screen.queryByText('Admin')).not.toBeInTheDocument()
      expect(screen.queryByText('Crear')).not.toBeInTheDocument()
    })
  })

  describe('admin user', () => {
    beforeEach(() => {
      vi.mocked(createClient).mockReturnValue(makeMockSupabase(
        { user_metadata: { full_name: 'Admin User' } }, 'admin'
      ) as any);
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        json: () => Promise.resolve({ role: 'admin' }),
      })
    })

    it('shows Admin button', async () => {
      render(<Topbar />)
      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument()
      })
    })

    it('Admin button links to /admin', async () => {
      render(<Topbar />)
      await waitFor(() => {
        expect(screen.getByText('Admin').closest('a')).toHaveAttribute('href', '/admin')
      })
    })

    it('shows Crear button', async () => {
      render(<Topbar />)
      await waitFor(() => {
        expect(screen.getByText('Crear')).toBeInTheDocument()
      })
    })

    it('opens dropdown with Torneo and Noticia options on Crear click', async () => {
      const user = userEvent.setup()
      render(<Topbar />)
      const crearBtn = await screen.findByText('Crear')
      await user.click(crearBtn)
      expect(screen.getByText('Torneo')).toBeInTheDocument()
      expect(screen.getByText('Noticia')).toBeInTheDocument()
    })

    it('Torneo option links to /admin/torneos/nuevo', async () => {
      const user = userEvent.setup()
      render(<Topbar />)
      const crearBtn = await screen.findByText('Crear')
      await user.click(crearBtn)
      expect(screen.getByText('Torneo').closest('a')).toHaveAttribute('href', '/admin/torneos/nuevo')
    })

    it('Noticia option links to /admin/noticias/nuevo', async () => {
      const user = userEvent.setup()
      render(<Topbar />)
      const crearBtn = await screen.findByText('Crear')
      await user.click(crearBtn)
      expect(screen.getByText('Noticia').closest('a')).toHaveAttribute('href', '/admin/noticias/nuevo')
    })
  })

  describe('title prop', () => {
    it('shows custom title instead of brand name', async () => {
      vi.mocked(createClient).mockReturnValue(makeMockSupabase(null, '') as any)
      render(<Topbar title="Torneos" />)
      expect(screen.getByText('Torneos')).toBeInTheDocument()
    })
  })
})
