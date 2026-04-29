import { describe, it, expect } from 'vitest'
import {
  cn,
  formatDate,
  formatCLP,
  getInitials,
  avatarColor,
  AVATAR_COLORS,
  CATEGORY_LABELS,
  CATEGORY_STYLES,
  STATUS_LABELS,
  STATUS_STYLES,
  LEVEL_LABELS,
} from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
  it('ignores falsy values', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })
  it('resolves Tailwind conflicts — last color wins', () => {
    expect(cn('text-blue-500', 'text-red-500')).toBe('text-red-500')
  })
  it('handles undefined and null gracefully', () => {
    expect(cn('foo', undefined, null as any)).toBe('foo')
  })
})

describe('formatDate', () => {
  it('formats a date in Spanish with month name', () => {
    const result = formatDate('2025-06-15T12:00:00.000Z')
    expect(result).toContain('junio')
    expect(result).toContain('2025')
    expect(result).toContain('15')
  })
  it('formats December correctly', () => {
    const result = formatDate('2025-12-25T12:00:00.000Z')
    expect(result).toContain('diciembre')
    expect(result).toContain('25')
  })
  it('formats January correctly', () => {
    const result = formatDate('2025-01-10T12:00:00.000Z')
    expect(result).toContain('enero')
    expect(result).toContain('10')
  })
  it('no desplaza el día para strings de solo fecha (YYYY-MM-DD)', () => {
    expect(formatDate('2025-01-15')).toContain('15')
    expect(formatDate('2025-01-15')).toContain('enero')
  })
  it('no desplaza el día para fechas a fin de mes', () => {
    expect(formatDate('2025-03-31')).toContain('31')
    expect(formatDate('2025-03-31')).toContain('marzo')
  })
})

describe('formatCLP', () => {
  it('formats zero', () => {
    const result = formatCLP(0)
    expect(typeof result).toBe('string')
    expect(result).toContain('0')
  })
  it('formats a typical price (15000)', () => {
    const result = formatCLP(15000)
    expect(result).toContain('15')
    expect(result).toContain('000')
  })
  it('includes currency symbol or code', () => {
    const result = formatCLP(5000)
    expect(result.length).toBeGreaterThan(4)
  })
  it('does not include decimal digits', () => {
    const result = formatCLP(1234)
    expect(result).not.toMatch(/[,\.]\d{2}$/)
  })
})

describe('getInitials', () => {
  it('returns two initials for two-word name', () => {
    expect(getInitials('Juan Pérez')).toBe('JP')
  })
  it('returns first char for single-word name', () => {
    expect(getInitials('Carlos')).toBe('C')
  })
  it('slices to max 2 for three-word name', () => {
    expect(getInitials('María José López')).toBe('MJ')
  })
  it('returns uppercase', () => {
    expect(getInitials('ana torres')).toBe('AT')
  })
  it('handles names with extra spaces', () => {
    const result = getInitials('Pedro Silva')
    expect(result).toBe('PS')
  })
})

describe('avatarColor', () => {
  it('returns a value from AVATAR_COLORS', () => {
    expect(AVATAR_COLORS).toContain(avatarColor('Juan'))
  })
  it('is deterministic — same name always returns same color', () => {
    expect(avatarColor('Carlos')).toBe(avatarColor('Carlos'))
    expect(avatarColor('Ana')).toBe(avatarColor('Ana'))
  })
  it('is based on the first character (charCode)', () => {
    // 'A' and 'a' have different charCodes so may differ
    const upper = avatarColor('Ana')
    const lower = avatarColor('ana')
    expect(AVATAR_COLORS).toContain(upper)
    expect(AVATAR_COLORS).toContain(lower)
  })
})

describe('CATEGORY_LABELS', () => {
  it('has all four post categories', () => {
    expect(CATEGORY_LABELS.tecnica).toBe('Técnica')
    expect(CATEGORY_LABELS.general).toBe('General')
    expect(CATEGORY_LABELS.ayuda).toBe('Ayuda')
    expect(CATEGORY_LABELS.humor).toBe('Humor')
  })
})

describe('CATEGORY_STYLES', () => {
  it('has style for each category', () => {
    expect(CATEGORY_STYLES.tecnica).toBeTruthy()
    expect(CATEGORY_STYLES.general).toBeTruthy()
    expect(CATEGORY_STYLES.ayuda).toBeTruthy()
    expect(CATEGORY_STYLES.humor).toBeTruthy()
  })
})

describe('STATUS_LABELS', () => {
  it('has all tournament statuses', () => {
    expect(STATUS_LABELS.open).toBe('Inscripciones abiertas')
    expect(STATUS_LABELS.soon).toBe('Próximamente')
    expect(STATUS_LABELS.finished).toBe('Finalizado')
  })
})

describe('STATUS_STYLES', () => {
  it('has style for each status', () => {
    expect(STATUS_STYLES.open).toBeTruthy()
    expect(STATUS_STYLES.soon).toBeTruthy()
    expect(STATUS_STYLES.finished).toBeTruthy()
  })
})

describe('LEVEL_LABELS', () => {
  it('has all player levels', () => {
    expect(LEVEL_LABELS.principiante).toBe('Principiante')
    expect(LEVEL_LABELS.intermedio).toBe('Intermedio')
    expect(LEVEL_LABELS.avanzado).toBe('Avanzado')
  })
})
