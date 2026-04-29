import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

const mockSignUp = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signUp: mockSignUp } }),
}))

import RegisterPage from './page'

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('form rendering', () => {
    it('renders all input fields', () => {
      render(<RegisterPage />)
      expect(screen.getByPlaceholderText('Nombre completo')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('correo@ejemplo.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)')).toBeInTheDocument()
    })

    it('renders submit button', () => {
      render(<RegisterPage />)
      expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument()
    })

    it('renders link back to login', () => {
      render(<RegisterPage />)
      expect(screen.getByText('Inicia sesión').closest('a')).toHaveAttribute('href', '/auth')
    })

    it('password field has minLength of 6', () => {
      render(<RegisterPage />)
      const passwordInput = screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)')
      expect(passwordInput).toHaveAttribute('minLength', '6')
    })
  })

  describe('successful registration', () => {
    it('shows success screen with email confirmation message', async () => {
      mockSignUp.mockResolvedValue({ error: null })
      const user = userEvent.setup()
      render(<RegisterPage />)

      await user.type(screen.getByPlaceholderText('Nombre completo'), 'Juan Pérez')
      await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'juan@example.com')
      await user.type(screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => {
        expect(screen.getByText('¡Revisa tu email!')).toBeInTheDocument()
      })
    })

    it('shows the submitted email address in success screen', async () => {
      mockSignUp.mockResolvedValue({ error: null })
      const user = userEvent.setup()
      render(<RegisterPage />)

      await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'juan@example.com')
      await user.type(screen.getByPlaceholderText('Nombre completo'), 'Juan')
      await user.type(screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)'), 'pass123')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => {
        expect(screen.getByText('juan@example.com')).toBeInTheDocument()
      })
    })

    it('success screen has link back to login', async () => {
      mockSignUp.mockResolvedValue({ error: null })
      const user = userEvent.setup()
      render(<RegisterPage />)

      await user.type(screen.getByPlaceholderText('Nombre completo'), 'Juan')
      await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'j@e.com')
      await user.type(screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)'), 'pass123')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => screen.getByText('¡Revisa tu email!'))
      expect(screen.getByText('← Volver al login').closest('a')).toHaveAttribute('href', '/auth')
    })

    it('passes full_name in user metadata', async () => {
      mockSignUp.mockResolvedValue({ error: null })
      const user = userEvent.setup()
      render(<RegisterPage />)

      await user.type(screen.getByPlaceholderText('Nombre completo'), 'Juan Pérez')
      await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'juan@example.com')
      await user.type(screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)'), 'pass123')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'juan@example.com',
          password: 'pass123',
          options: { data: { full_name: 'Juan Pérez' } },
        })
      })
    })
  })

  describe('registration failure', () => {
    it('shows error message returned by Supabase', async () => {
      mockSignUp.mockResolvedValue({ error: { message: 'User already registered' } })
      const user = userEvent.setup()
      render(<RegisterPage />)

      await user.type(screen.getByPlaceholderText('Nombre completo'), 'Juan')
      await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'existing@example.com')
      await user.type(screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)'), 'pass123')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => {
        expect(screen.getByText('User already registered')).toBeInTheDocument()
      })
    })

    it('remains on the form after failure', async () => {
      mockSignUp.mockResolvedValue({ error: { message: 'Some error' } })
      const user = userEvent.setup()
      render(<RegisterPage />)

      await user.type(screen.getByPlaceholderText('Nombre completo'), 'Juan')
      await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'j@e.com')
      await user.type(screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)'), 'pass')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => screen.getByText('Some error'))
      expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows loading text while request is in flight', async () => {
      mockSignUp.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 200))
      )
      const user = userEvent.setup()
      render(<RegisterPage />)

      await user.type(screen.getByPlaceholderText('Nombre completo'), 'Juan')
      await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'j@e.com')
      await user.type(screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)'), 'pass123')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      expect(screen.getByRole('button', { name: 'Creando cuenta...' })).toBeInTheDocument()
    })
  })
})
