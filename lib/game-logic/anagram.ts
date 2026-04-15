export function scramble(word: string): string[] {
  const letters = word.split('')
  if (letters.length <= 1) return letters

  // Guarantee the result is different from the original
  let shuffled: string[]
  let attempts = 0
  do {
    shuffled = [...letters].sort(() => Math.random() - 0.5)
    attempts++
  } while (shuffled.join('') === word && attempts < 100)

  return shuffled
}

export function checkAnagram(selected: string[], correct: string): boolean {
  return selected.join('').toLowerCase() === correct.toLowerCase()
}
