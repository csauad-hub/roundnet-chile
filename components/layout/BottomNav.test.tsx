import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockUsePathname = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

import BottomNav from './BottomNav'

describe('BottomNav', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  describe('rendering', () => {
    it('renders all four navigation items', () => {
      render(<BottomNav />)
      expect(screen.getByText('Inicio')).toBeInTheDocument()
      expect(screen.getByText('Torneos')).toBeInTheDocument()
      expect(screen.getByText('Comunidad')).toBeInTheDocument()
      expect(screen.getByText('Jugadores')).toBeInTheDocument()
    })

    it('links have correct hrefs', () => {
      render(<BottomNav />)
      expect(screen.getByText('Inicio').closest('a')).toHaveAttribute('href', '/')
      expect(screen.getByText('Torneos').closest('a')).toHaveAttribute('href', '/torneos')
      expect(screen.getByText('Comunidad').closest('a')).toHaveAttribute('href', '/comunidad')
      expect(screen.getByText('Jugadores').closest('a')).toHaveAttribute('href', '/jugadores')
    })
  })

  describe('active state', () => {
    it('marks Inicio as active when pathname is /', () => {
      mockUsePathname.mockReturnValue('/')
      render(<BottomNav />)
      expect(screen.getByText('Inicio')).toHaveClass('text-blue-600')
    })

    it('marks Torneos as active when pathname is /torneos', () => {
      mockUsePathname.mockReturnValue('/torneos')
      render(<BottomNav />)
      expect(screen.getByText('Torneos')).toHaveClass('text-blue-600')
    })

    it('marks Comunidad as active when pathname is /comunidad', () => {
      mockUsePathname.mockReturnValue('/comunidad')
      render(<BottomNav />)
      expect(screen.getByText('Comunidad')).toHaveClass('text-blue-600')
    })

    it('marks Jugadores as active when pathname is /jugadores', () => {
      mockUsePathname.mockReturnValue('/jugadores')
      render(<BottomNav />)
      expect(screen.getByText('Jugadores')).toHaveClass('text-blue-600')
    })

    it('keeps inactive items in slate color', () => {
      mockUsePathname.mockReturnValue('/')
      render(<BottomNav />)
      expect(screen.getByText('Torneos')).toHaveClass('text-slate-400')
      expect(screen.getByText('Comunidad')).toHaveClass('text-slate-400')
      expect(screen.getByText('Jugadores')).toHaveClass('text-slate-400')
    })

    it('marks no item active on an unrelated route', () => {
      mockUsePathname.mockReturnValue('/noticias')
      render(<BottomNav />)
      expect(screen.getByText('Inicio')).toHaveClass('text-slate-400')
      expect(screen.getByText('Torneos')).toHaveClass('text-slate-400')
    })
  })
})
