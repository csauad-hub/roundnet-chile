import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Avatar from './Avatar'

describe('Avatar', () => {
  describe('with image src', () => {
    it('renders an img element', () => {
      render(<Avatar name="Juan Pérez" src="https://example.com/photo.jpg" />)
      expect(screen.getByRole('img')).toBeInTheDocument()
    })
    it('uses src as image source', () => {
      render(<Avatar name="Juan Pérez" src="https://example.com/photo.jpg" />)
      expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/photo.jpg')
    })
    it('uses name as alt text', () => {
      render(<Avatar name="Juan Pérez" src="https://example.com/photo.jpg" />)
      expect(screen.getByRole('img')).toHaveAttribute('alt', 'Juan Pérez')
    })
  })

  describe('without image src', () => {
    it('renders initials for two-word name', () => {
      render(<Avatar name="Juan Pérez" />)
      expect(screen.getByText('JP')).toBeInTheDocument()
    })
    it('renders single initial for one-word name', () => {
      render(<Avatar name="Carlos" />)
      expect(screen.getByText('C')).toBeInTheDocument()
    })
    it('treats null src as no image', () => {
      render(<Avatar name="Juan Pérez" src={null} />)
      expect(screen.getByText('JP')).toBeInTheDocument()
    })
    it('does not render an img element', () => {
      render(<Avatar name="Juan Pérez" />)
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('sizes', () => {
    it('applies md size by default', () => {
      const { container } = render(<Avatar name="Test" />)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('w-9')
      expect(el.className).toContain('h-9')
    })
    it('applies sm size', () => {
      const { container } = render(<Avatar name="Test" size="sm" />)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('w-7')
      expect(el.className).toContain('h-7')
    })
    it('applies lg size', () => {
      const { container } = render(<Avatar name="Test" size="lg" />)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('w-12')
      expect(el.className).toContain('h-12')
    })
    it('applies xl size', () => {
      const { container } = render(<Avatar name="Test" size="xl" />)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('w-14')
      expect(el.className).toContain('h-14')
    })
  })

  describe('className prop', () => {
    it('merges custom className into the element', () => {
      const { container } = render(<Avatar name="Test" className="border-2" />)
      expect((container.firstChild as HTMLElement).className).toContain('border-2')
    })
  })
})
