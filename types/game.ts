export enum GameType {
  PAIRS = 'PAIRS',
  FLASHCARDS = 'FLASHCARDS',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SPLAT = 'SPLAT',
  SWIPE = 'SWIPE',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
  SPEED_ROUND = 'SPEED_ROUND',
  ANAGRAM = 'ANAGRAM',
}

export interface Game {
  id: string
  userId: string
  name: string
  gameType: GameType
  gameData: string // JSON string of type-specific data
  subject?: string | null
  shareToken?: string | null
  sourceLibraryDeckId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface PairsItem {
  id: string
  leftText: string
  rightText: string
  leftImage?: string
  rightImage?: string
}

export interface PairsGameData {
  description?: string
  items: PairsItem[]
}

export interface FlashcardItem {
  id: string
  front: string
  back: string
  frontImage?: string
  backImage?: string
}

export interface FlashcardsGameData {
  description?: string
  cards: FlashcardItem[]
}

export interface MultipleChoiceOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface MultipleChoiceQuestion {
  id: string
  question: string
  image?: string
  options: MultipleChoiceOption[]
}

export interface MultipleChoiceGameData {
  description?: string
  questions: MultipleChoiceQuestion[]
}

export interface SplatItem {
  id: string
  question: string
  answer: string
  image?: string
}

export interface SplatGameData {
  description?: string
  timeLimit?: number
  items: SplatItem[]
}

export interface SwipeItem {
  id: string
  statement: string
  isCorrect: boolean
  image?: string
  explanation?: string
}

export interface SwipeGameData {
  description?: string
  items: SwipeItem[]
}

export interface FillInTheBlankItem {
  id: string
  sentence: string // contains [blank] marker
  answer: string   // correct value for the blank
}

export interface FillInTheBlankGameData {
  description?: string
  items: FillInTheBlankItem[]
}

export interface SpeedRoundItem {
  id: string
  question: string
  answer: string
  distractors?: string[] // optional wrong answers; auto-generated from pool if absent
}

export interface SpeedRoundGameData {
  description?: string
  timeLimit: number // seconds: 30 | 60 | 90 | 120
  items: SpeedRoundItem[]
}

export interface AnagramItem {
  id: string
  word: string  // the correct answer
  hint?: string // optional clue shown above scrambled letters
}

export interface AnagramGameData {
  description?: string
  items: AnagramItem[]
}

export type GameData =
  | PairsGameData
  | FlashcardsGameData
  | MultipleChoiceGameData
  | SplatGameData
  | SwipeGameData
  | FillInTheBlankGameData
  | SpeedRoundGameData
  | AnagramGameData

export interface CreateGameInput {
  name: string
  gameType: GameType
  gameData: GameData
  subject?: string
}

export interface GameTemplate {
  type: GameType
  name: string
  description: string
  icon: string
  color: string
  features: string[]
  minItems: number
}
