import { describe, test, expect } from 'vitest'
import { getRateLimitKey } from '../rateLimit'

describe('getRateLimitKey', () => {
  test('key format includes user id', () => {
    expect(getRateLimitKey('user-abc-123')).toBe('chat:user-abc-123')
  })

  test('different users produce different keys', () => {
    expect(getRateLimitKey('user-a')).not.toBe(getRateLimitKey('user-b'))
  })
})
