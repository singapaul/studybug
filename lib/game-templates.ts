import { GameType, GameTemplate } from '@/types/game'

export const GAME_TEMPLATES: GameTemplate[] = [
  {
    type: GameType.PAIRS,
    name: 'Pairs',
    description: 'Match cards in pairs - perfect for vocabulary, translations, or concept matching',
    icon: 'LayoutGrid',
    color: 'bg-blue-500',
    features: [
      'Match left and right cards',
      'Great for vocabulary practice',
      'Visual learning with images',
      'Track matching speed',
    ],
    minItems: 3,
  },
  {
    type: GameType.FLASHCARDS,
    name: 'Flashcards',
    description: 'Flip cards to study - ideal for memorization and self-paced learning',
    icon: 'BookOpen',
    color: 'bg-purple-500',
    features: [
      'Front and back card content',
      'Self-paced studying',
      'Optional images on both sides',
      'Track study progress',
    ],
    minItems: 5,
  },
  {
    type: GameType.MULTIPLE_CHOICE,
    name: 'Multiple Choice',
    description: 'Quiz with 2-4 answer options - great for testing knowledge and comprehension',
    icon: 'CheckCircle',
    color: 'bg-green-500',
    features: [
      '2-4 answer options per question',
      'Instant feedback',
      'Perfect for assessments',
      'Score tracking',
    ],
    minItems: 5,
  },
  {
    type: GameType.SPLAT,
    name: 'Splat',
    description: 'Fast-paced tapping game - tap the correct answer before time runs out',
    icon: 'Zap',
    color: 'bg-orange-500',
    features: [
      'Timed challenges',
      'Quick thinking required',
      'Engaging and competitive',
      'High score tracking',
    ],
    minItems: 10,
  },
  {
    type: GameType.SWIPE,
    name: 'Swipe',
    description: 'Swipe left or right - true/false style rapid decision-making game',
    icon: 'Move',
    color: 'bg-pink-500',
    features: [
      'Swipe right for correct',
      'Swipe left for incorrect',
      'Fast-paced gameplay',
      'Intuitive mobile interface',
    ],
    minItems: 10,
  },
  {
    type: GameType.FILL_IN_THE_BLANK,
    name: 'Fill in the Blank',
    description: 'Complete sentences by filling in the missing word - great for language and grammar',
    icon: 'PenLine',
    color: 'bg-teal-500',
    features: [
      'Type the missing word',
      'Case-insensitive matching',
      'Instant feedback',
      'Perfect for language learning',
    ],
    minItems: 5,
  },
  {
    type: GameType.SPEED_ROUND,
    name: 'Speed Round',
    description: 'Race against the clock - answer as many questions as possible before time runs out',
    icon: 'Timer',
    color: 'bg-red-500',
    features: [
      'Configurable timer (30-120s)',
      '4 answer options per question',
      'Score based on correct answers',
      'High-pressure challenge',
    ],
    minItems: 10,
  },
  {
    type: GameType.ANAGRAM,
    name: 'Anagram Solver',
    description: 'Unscramble letters to form the correct word - tests spelling and vocabulary',
    icon: 'Shuffle',
    color: 'bg-violet-500',
    features: [
      'Click letters to build answer',
      'Optional hints per word',
      'Reveal button available',
      'Great for spelling practice',
    ],
    minItems: 5,
  },
]

export function getTemplateByType(type: GameType): GameTemplate | undefined {
  return GAME_TEMPLATES.find((t) => t.type === type)
}

export function getTemplateColor(type: GameType): string {
  return getTemplateByType(type)?.color ?? 'bg-gray-500'
}

export function getTemplateIcon(type: GameType): string {
  return getTemplateByType(type)?.icon ?? 'Gamepad2'
}

export function getTemplateName(type: GameType): string {
  return getTemplateByType(type)?.name ?? type
}
