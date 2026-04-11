export function isPairsComplete(matched: Set<string>, totalPairs: number): boolean {
  return matched.size === totalPairs
}

export function computePairsStars(moves: number, totalPairs: number): number {
  if (totalPairs === 0) return 1
  const efficiency = totalPairs / moves
  if (efficiency >= 1.0) return 3
  if (efficiency >= 0.5) return 2
  return 1
}
