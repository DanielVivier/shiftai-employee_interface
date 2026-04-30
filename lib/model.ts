import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'

export function getProvider(model: string) {
  if (model.startsWith('claude-')) {
    return anthropic(model)
  }
  if (model.startsWith('gpt-')) {
    return openai(model)
  }
  throw new Error(`Unknown model: ${model}`)
}
