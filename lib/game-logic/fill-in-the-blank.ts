export function checkAnswer(userInput: string, correct: string): boolean {
  return userInput.trim().toLowerCase() === correct.trim().toLowerCase()
}

export function parseSentenceParts(sentence: string): { before: string; after: string } {
  const index = sentence.indexOf('[blank]')
  if (index === -1) return { before: sentence, after: '' }
  return {
    before: sentence.slice(0, index),
    after: sentence.slice(index + '[blank]'.length),
  }
}
