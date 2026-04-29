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
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

const mockPush = vi.fn()
const mockSearchParamsGet = vi.fn().mockReturnValue(null)

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockSearchParamsGet }),
}))

const mockSignInWithPassword = vi.fn()
const mockSignInWithOAuth = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}))

import LoginPage from './page'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParamsGet.mockReturnValue(null)
    // Restore the mock after clearAllMocks since it's captured by closure
    mockPush.mockReset()
  })

  describe('form rendering', () => {
    it('renders Google login button', () => {
      render(<LoginPage />)
      expect(screen.getByText('Continuar con Google')).toBeInTheDocument()
    })

    it('renders email field', () => {
      render(<LoginPage />)
      expect(screen.getByPlaceholderText('correo@ejemplo.com')).toBeInTheDocument()
    })

    it('renders password field', () => {
      render(<LoginPage />)
      expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument()
    })

    it('renders Ingresar submit button', () => {
      render(<LoginPage />)
      expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument()
    })

    it('renders link to registration', () => {
      render(<LoginPage />)
      expect(screen.getByText('Regístrate gratis').closest('a')).toHaveAttribute('href', '/auth/registro')
    })

    it('renders guest bypass button', () => {
      render(<LoginPage />)
      expect(screen.getByText('Continuar sin iniciar sesión')).toBeInTheDocument()
    })
  })

  describe('successful login', () => {
    it('redirects to / by default', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null })
      const user = userEvent.setup()
      render(<LoginPage />)

      await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Contraseña'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Ingresar' }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('redirects to the "next" param when present', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null })
      mockSearchParamsGet.mockImplementation((key: string) =>
        key === 'next' ? '/perfil' : null
      )
      const user = userEvent.setup()
      render(<LoginPage />)

      await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Contraseña'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Ingresar' }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/perfil')
      })
    })
  })

  describe('failed login', () => {
    it('shows error message on wrong credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
      const user = userEvent.setup()
      render(<LoginPage />)

      await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'wrong@example.com')
      await user.type(screen.getByPlaceholderText('Contraseña'), 'wrongpass')
      await user.click(screen.getByRole('button', { name: 'Ingresar' }))

      await waitFor(() => {
        expect(screen.getByText('Email o contraseña incorrectos')).toBeInTheDocument()
      })
    })

    it('does not redirect on failure', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
      const user = userEvent.setup()
      render(<LoginPage />)

      await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'w@e.com')
      await user.type(screen.getByPlaceholderText('Contraseña'), 'wrong')
      await user.click(screen.getByRole('button', { name: 'Ingresar' }))

      await waitFor(() => screen.getByText('Email o contraseña incorrectos'))
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('URL error param', () => {
    it('shows OAuth error message when ?error param is present', () => {
      mockSearchParamsGet.mockImplementation((key: string) =>
        key === 'error' ? 'oauth_error' : null
      )
      render(<LoginPage />)
      expect(
        screen.getByText('No se pudo iniciar sesión con Google. Por favor, intenta de nuevo.')
      ).toBeInTheDocument()
    })
  })

  describe('guest mode', () => {
    it('sets guest_bypass cookie and redirects to /', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      await user.click(screen.getByText('Continuar sin iniciar sesión'))

      expect(document.cookie).toContain('guest_bypass=1')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('loading state', () => {
    it('shows loading text while login is in progress', async () => {
      mockSignInWithPassword.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 200))
      )
      const user = userEvent.setup()
      render(<LoginPage />)

      await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Contraseña'), 'pass123')
      await user.click(screen.getByRole('button', { name: 'Ingresar' }))

      expect(screen.getByRole('button', { name: 'Ingresando...' })).toBeInTheDocument()
    })
  })
})
