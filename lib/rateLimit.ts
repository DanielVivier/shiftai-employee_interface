export function getRateLimitKey(userId: string): string {
  return `chat:${userId}`
}
