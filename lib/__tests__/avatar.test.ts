import { describe, test, expect } from 'vitest'
import { getAvatarColor, getAvatarInitials } from '../avatar'

const PALETTE = [
  '#5E81AC', '#88C0D0', '#EBCB8B', '#A3BE8C',
  '#BF616A', '#D08770', '#B48EAD', '#81A1C1',
]

describe('getAvatarColor', () => {
  test('same id always returns same color', () => {
    const id = 'abc-123-uuid'
    expect(getAvatarColor(id)).toBe(getAvatarColor(id))
  })

  test('result is always in the palette', () => {
    const id = 'abc-123-uuid'
    expect(PALETTE).toContain(getAvatarColor(id))
  })

  test('different ids can produce different colors', () => {
    const c1 = getAvatarColor('aaaa-0000')
    const c2 = getAvatarColor('zzzz-9999')
    expect(PALETTE).toContain(c1)
    expect(PALETTE).toContain(c2)
  })
})

describe('getAvatarInitials', () => {
  test('two words → two initials', () => {
    expect(getAvatarInitials('Jane Smith')).toBe('JS')
  })

  test('single word → one initial', () => {
    expect(getAvatarInitials('Alice')).toBe('A')
  })

  test('three words → two initials (first two)', () => {
    expect(getAvatarInitials('John Paul Jones')).toBe('JP')
  })
})
