export interface ManifestTopic {
  name: string
  slug: string
  description?: string
  tags: string[]
}

export interface ManifestSubject {
  name: string
  slug: string
  icon: string
  color: string
  isFree: boolean
  sortOrder: number
  topics: ManifestTopic[]
}

export const LIBRARY_MANIFEST: ManifestSubject[] = [
  // FREE SUBJECTS
  {
    name: 'Biology',
    slug: 'biology',
    icon: 'Dna',
    color: 'bg-green-500',
    isFree: true,
    sortOrder: 1,
    topics: [
      { name: 'Cell Structure', slug: 'cell-structure', tags: ['GCSE', 'AQA', 'OCR'] },
      { name: 'Photosynthesis', slug: 'photosynthesis', tags: ['GCSE', 'AQA', 'OCR'] },
      { name: 'Respiration', slug: 'respiration', tags: ['GCSE'] },
      { name: 'DNA and Genetics', slug: 'dna-and-genetics', tags: ['GCSE', 'AQA'] },
      { name: 'The Digestive System', slug: 'digestive-system', tags: ['GCSE'] },
      { name: 'Ecosystems', slug: 'ecosystems', tags: ['GCSE', 'AQA'] },
      { name: 'Evolution', slug: 'evolution', tags: ['GCSE', 'AQA', 'OCR'] },
      { name: 'Hormones', slug: 'hormones', tags: ['GCSE'] },
    ],
  },
  {
    name: 'French',
    slug: 'french',
    icon: 'Languages',
    color: 'bg-blue-500',
    isFree: true,
    sortOrder: 2,
    topics: [
      { name: 'Essential Verbs', slug: 'essential-verbs', tags: ['GCSE', 'beginner'] },
      { name: 'Family and Relationships', slug: 'family', tags: ['GCSE', 'AQA'] },
      { name: 'Food and Drink', slug: 'food-and-drink', tags: ['GCSE', 'beginner'] },
      { name: 'Travel and Transport', slug: 'travel', tags: ['GCSE', 'AQA'] },
      { name: 'Adjectives', slug: 'adjectives', tags: ['GCSE', 'beginner'] },
      { name: 'Numbers and Time', slug: 'numbers-time', tags: ['GCSE', 'beginner'] },
      { name: 'Health and Body', slug: 'health-body', tags: ['GCSE'] },
      { name: 'Town and Environment', slug: 'town-environment', tags: ['GCSE', 'AQA'] },
    ],
  },
  // PRO SUBJECTS
  {
    name: 'Chemistry',
    slug: 'chemistry',
    icon: 'FlaskConical',
    color: 'bg-purple-500',
    isFree: false,
    sortOrder: 3,
    topics: [
      { name: 'Atomic Structure', slug: 'atomic-structure', tags: ['GCSE', 'AQA'] },
      { name: 'The Periodic Table', slug: 'periodic-table', tags: ['GCSE'] },
      { name: 'Chemical Bonding', slug: 'chemical-bonding', tags: ['GCSE', 'AQA'] },
      { name: 'Acids and Bases', slug: 'acids-bases', tags: ['GCSE'] },
      { name: 'Rates of Reaction', slug: 'rates-of-reaction', tags: ['GCSE', 'AQA'] },
    ],
  },
  {
    name: 'Physics',
    slug: 'physics',
    icon: 'Atom',
    color: 'bg-yellow-500',
    isFree: false,
    sortOrder: 4,
    topics: [
      { name: 'Forces and Motion', slug: 'forces-and-motion', tags: ['GCSE', 'AQA'] },
      { name: 'Energy', slug: 'energy', tags: ['GCSE'] },
      { name: 'Electricity', slug: 'electricity', tags: ['GCSE', 'AQA'] },
      { name: 'Waves', slug: 'waves', tags: ['GCSE', 'AQA'] },
      { name: 'Space Physics', slug: 'space-physics', tags: ['GCSE'] },
    ],
  },
  {
    name: 'History',
    slug: 'history',
    icon: 'Landmark',
    color: 'bg-amber-600',
    isFree: false,
    sortOrder: 5,
    topics: [
      { name: 'World War Two', slug: 'world-war-two', tags: ['GCSE', 'AQA'] },
      { name: 'The Cold War', slug: 'cold-war', tags: ['GCSE', 'AQA'] },
      { name: 'The Weimar Republic', slug: 'weimar-republic', tags: ['GCSE'] },
      { name: 'Nazi Germany', slug: 'nazi-germany', tags: ['GCSE', 'AQA'] },
    ],
  },
  {
    name: 'Spanish',
    slug: 'spanish',
    icon: 'Languages',
    color: 'bg-red-500',
    isFree: false,
    sortOrder: 6,
    topics: [
      { name: 'Essential Verbs', slug: 'essential-verbs', tags: ['GCSE', 'beginner'] },
      { name: 'Family and Relationships', slug: 'family', tags: ['GCSE', 'AQA'] },
      { name: 'Food and Drink', slug: 'food-and-drink', tags: ['GCSE', 'beginner'] },
      { name: 'Travel and Holidays', slug: 'travel-holidays', tags: ['GCSE', 'AQA'] },
      { name: 'Town and Environment', slug: 'town-environment', tags: ['GCSE'] },
    ],
  },
  {
    name: 'Mathematics',
    slug: 'mathematics',
    icon: 'Calculator',
    color: 'bg-indigo-500',
    isFree: false,
    sortOrder: 7,
    topics: [
      { name: 'Algebra Fundamentals', slug: 'algebra-fundamentals', tags: ['GCSE'] },
      { name: 'Geometry and Shapes', slug: 'geometry-shapes', tags: ['GCSE'] },
      { name: 'Statistics and Probability', slug: 'statistics-probability', tags: ['GCSE', 'AQA'] },
      { name: 'Number and Arithmetic', slug: 'number-arithmetic', tags: ['GCSE'] },
    ],
  },
  {
    name: 'English Literature',
    slug: 'english-literature',
    icon: 'BookOpen',
    color: 'bg-rose-500',
    isFree: false,
    sortOrder: 8,
    topics: [
      { name: 'Romeo and Juliet', slug: 'romeo-and-juliet', tags: ['GCSE', 'AQA'] },
      { name: 'Macbeth', slug: 'macbeth', tags: ['GCSE', 'AQA'] },
      { name: 'An Inspector Calls', slug: 'an-inspector-calls', tags: ['GCSE'] },
      { name: 'A Christmas Carol', slug: 'a-christmas-carol', tags: ['GCSE', 'AQA'] },
    ],
  },
]
