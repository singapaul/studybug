import {
  Game,
  GameType,
  FlashcardsGameData,
  PairsGameData,
  SwipeGameData,
  SplatGameData,
  MultipleChoiceGameData,
} from '@/types/game'

const NOW = new Date('2026-04-02T12:00:00Z')
const PAST = new Date('2026-01-01T12:00:00Z')

const flashcardsData: FlashcardsGameData = {
  description: 'Practice your multiplication tables',
  cards: [
    { id: 'fc1', front: '6 × 7', back: '42' },
    { id: 'fc2', front: '8 × 9', back: '72' },
    { id: 'fc3', front: '7 × 8', back: '56' },
    { id: 'fc4', front: '9 × 6', back: '54' },
    { id: 'fc5', front: '12 × 12', back: '144' },
  ],
}

const pairsData: PairsGameData = {
  description: 'Match French words with their English translations',
  items: [
    { id: 'p1', leftText: 'Bonjour', rightText: 'Hello' },
    { id: 'p2', leftText: 'Merci', rightText: 'Thank you' },
    { id: 'p3', leftText: 'Au revoir', rightText: 'Goodbye' },
    { id: 'p4', leftText: 'Oui', rightText: 'Yes' },
    { id: 'p5', leftText: 'Non', rightText: 'No' },
    { id: 'p6', leftText: "S'il vous plaît", rightText: 'Please' },
  ],
}

const swipeData: SwipeGameData = {
  description: 'Swipe right if the statement is true, left if false',
  items: [
    { id: 'sw1', statement: 'The capital of France is Paris', isCorrect: true },
    { id: 'sw2', statement: 'The capital of Spain is Barcelona', isCorrect: false, explanation: 'The capital of Spain is Madrid' },
    { id: 'sw3', statement: 'The capital of Germany is Berlin', isCorrect: true },
    { id: 'sw4', statement: 'The capital of Italy is Venice', isCorrect: false, explanation: 'The capital of Italy is Rome' },
    { id: 'sw5', statement: 'The capital of Japan is Tokyo', isCorrect: true },
    { id: 'sw6', statement: 'The capital of Australia is Sydney', isCorrect: false, explanation: 'The capital of Australia is Canberra' },
    { id: 'sw7', statement: 'The capital of Canada is Ottawa', isCorrect: true },
    { id: 'sw8', statement: 'The capital of Brazil is Rio de Janeiro', isCorrect: false, explanation: 'The capital of Brazil is Brasília' },
    { id: 'sw9', statement: 'The capital of China is Beijing', isCorrect: true },
    { id: 'sw10', statement: 'The capital of Egypt is Alexandria', isCorrect: false, explanation: 'The capital of Egypt is Cairo' },
  ],
}

const splatData: SplatGameData = {
  description: 'Solve the algebra problems quickly!',
  timeLimit: 10,
  items: [
    { id: 'sp1', question: 'What is x if 2x = 10?', answer: '5' },
    { id: 'sp2', question: 'What is x if x + 7 = 12?', answer: '5' },
    { id: 'sp3', question: 'What is x if 3x = 15?', answer: '5' },
    { id: 'sp4', question: 'What is x if x − 4 = 6?', answer: '10' },
    { id: 'sp5', question: 'What is x if 4x = 20?', answer: '5' },
    { id: 'sp6', question: 'What is x if x + 3 = 10?', answer: '7' },
    { id: 'sp7', question: 'What is x if 5x = 25?', answer: '5' },
    { id: 'sp8', question: 'What is x if 2x + 1 = 9?', answer: '4' },
    { id: 'sp9', question: 'What is x if x / 2 = 6?', answer: '12' },
    { id: 'sp10', question: 'What is x if 3x − 3 = 12?', answer: '5' },
  ],
}

const multipleChoiceData: MultipleChoiceGameData = {
  description: 'Test your knowledge of world capitals',
  questions: [
    {
      id: 'mc1',
      question: 'What is the capital of France?',
      options: [
        { id: 'mc1a', text: 'Paris', isCorrect: true },
        { id: 'mc1b', text: 'Lyon', isCorrect: false },
        { id: 'mc1c', text: 'Marseille', isCorrect: false },
        { id: 'mc1d', text: 'Nice', isCorrect: false },
      ],
    },
    {
      id: 'mc2',
      question: 'What is the capital of Japan?',
      options: [
        { id: 'mc2a', text: 'Osaka', isCorrect: false },
        { id: 'mc2b', text: 'Kyoto', isCorrect: false },
        { id: 'mc2c', text: 'Tokyo', isCorrect: true },
        { id: 'mc2d', text: 'Hiroshima', isCorrect: false },
      ],
    },
    {
      id: 'mc3',
      question: 'What is the capital of Australia?',
      options: [
        { id: 'mc3a', text: 'Sydney', isCorrect: false },
        { id: 'mc3b', text: 'Melbourne', isCorrect: false },
        { id: 'mc3c', text: 'Brisbane', isCorrect: false },
        { id: 'mc3d', text: 'Canberra', isCorrect: true },
      ],
    },
    {
      id: 'mc4',
      question: 'What is the capital of Brazil?',
      options: [
        { id: 'mc4a', text: 'Rio de Janeiro', isCorrect: false },
        { id: 'mc4b', text: 'Brasília', isCorrect: true },
        { id: 'mc4c', text: 'São Paulo', isCorrect: false },
        { id: 'mc4d', text: 'Salvador', isCorrect: false },
      ],
    },
    {
      id: 'mc5',
      question: 'What is the capital of Canada?',
      options: [
        { id: 'mc5a', text: 'Toronto', isCorrect: false },
        { id: 'mc5b', text: 'Vancouver', isCorrect: false },
        { id: 'mc5c', text: 'Ottawa', isCorrect: true },
        { id: 'mc5d', text: 'Montreal', isCorrect: false },
      ],
    },
  ],
}

export const SEED_GAMES: Game[] = [
  {
    id: 'game-1',
    userId: 'mock-user-1',
    name: 'Times Tables',
    gameType: GameType.FLASHCARDS,
    gameData: JSON.stringify(flashcardsData),
    createdAt: PAST,
    updatedAt: PAST,
  },
  {
    id: 'game-2',
    userId: 'mock-user-1',
    name: 'French Vocabulary',
    gameType: GameType.PAIRS,
    gameData: JSON.stringify(pairsData),
    createdAt: PAST,
    updatedAt: PAST,
  },
  {
    id: 'game-3',
    userId: 'mock-user-1',
    name: 'Capital Cities',
    gameType: GameType.SWIPE,
    gameData: JSON.stringify(swipeData),
    createdAt: PAST,
    updatedAt: PAST,
  },
  {
    id: 'game-4',
    userId: 'mock-user-1',
    name: 'Algebra Basics',
    gameType: GameType.SPLAT,
    gameData: JSON.stringify(splatData),
    createdAt: PAST,
    updatedAt: PAST,
  },
  {
    id: 'game-5',
    userId: 'mock-user-1',
    name: 'World Capitals Quiz',
    gameType: GameType.MULTIPLE_CHOICE,
    gameData: JSON.stringify(multipleChoiceData),
    createdAt: NOW,
    updatedAt: NOW,
  },
]
