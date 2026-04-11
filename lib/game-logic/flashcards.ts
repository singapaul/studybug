export interface CardProgress {
  cardId: string
  known: boolean | null
  viewed: boolean
}

export function computeFlashcardsScore(progress: CardProgress[]): number {
  if (progress.length === 0) return 0
  const known = progress.filter((p) => p.known === true).length
  return (known / progress.length) * 100
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
