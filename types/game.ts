export enum GameType {
  PAIRS = 'PAIRS',
  FLASHCARDS = 'FLASHCARDS',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SPLAT = 'SPLAT',
  SWIPE = 'SWIPE',
}

export interface Game {
  id: string
  userId: string
  name: string
  gameType: GameType
  gameData: string // JSON string of type-specific data
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

export type GameData =
  | PairsGameData
  | FlashcardsGameData
  | MultipleChoiceGameData
  | SplatGameData
  | SwipeGameData

export interface CreateGameInput {
  name: string
  gameType: GameType
  gameData: GameData
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
