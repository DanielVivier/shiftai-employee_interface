import { describe, test, expect } from 'vitest'
import { getProvider } from '../model'

describe('getProvider', () => {
  test('claude- prefix returns Anthropic provider object', () => {
    const p = getProvider('claude-sonnet-4-6')
    expect(p).toBeDefined()
  })

  test('gpt- prefix returns OpenAI provider object', () => {
    const p = getProvider('gpt-4o')
    expect(p).toBeDefined()
  })

  test('unknown model throws', () => {
    expect(() => getProvider('gemini-pro')).toThrow('Unknown model: gemini-pro')
  })
})
