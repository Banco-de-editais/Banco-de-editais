export const QUALIS_LEVELS = Object.freeze(['B4', 'B3', 'B2', 'B1', 'A4', 'A3', 'A2', 'A1'])

const QUALIS_RANKS = new Map(QUALIS_LEVELS.map((level, index) => [level, index]))

export function isQualisLevel(value) {
  return QUALIS_RANKS.has(value)
}

export function compareQualis(left, right) {
  if (!isQualisLevel(left) || !isQualisLevel(right)) return null
  return QUALIS_RANKS.get(left) - QUALIS_RANKS.get(right)
}

export function compareOptionalQualis(left, right, direction = 'asc') {
  const leftIsKnown = isQualisLevel(left)
  const rightIsKnown = isQualisLevel(right)

  if (!leftIsKnown && !rightIsKnown) return 0
  if (!leftIsKnown) return 1
  if (!rightIsKnown) return -1

  return compareQualis(left, right) * (direction === 'desc' ? -1 : 1)
}
