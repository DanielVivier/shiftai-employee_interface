const PALETTE = [
  '#5E81AC',
  '#88C0D0',
  '#EBCB8B',
  '#A3BE8C',
  '#BF616A',
  '#D08770',
  '#B48EAD',
  '#81A1C1',
]

// Deterministic color from employee ID — same id always returns same color
export function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return PALETTE[hash % PALETTE.length]
}

export function getAvatarInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}
