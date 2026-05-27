import {
  QuestionType,
  MarkingMode,
  DifferentiationMode,
} from '@/types/worksheet'

const FORBIDDEN_PHRASES = [
  'central concept', 'process', 'impact', 'significance',
  'major features', 'how they interact', 'structural process',
  'static, unchanging',
]

const NO_JUDGEMENT_TERMS = ['correctly', 'accurately', 'valid']

function yearGroupDepthGuidance(yearGroup: string): string {
  const match = yearGroup.match(/Year (\d+)/)
  if (!match) return 'Use age-appropriate language and depth.'
  const yr = parseInt(match[1], 10)
  if (yr <= 8) return 'Year 1–8 — stick to recall and define. Simple vocabulary, concrete examples.'
  if (yr <= 10) return 'Year 9–10 — mix recall with classify, compare, describe. Begin to introduce abstract terms.'
  return 'Year 11+ — require explain, analyse, evaluate. Include numerical values, equations or case studies where relevant.'
}

const TYPE_RULES: Record<QuestionType, string> = {
  multipleChoice: '- multipleChoice: 3–4 plausible options; exactly one correct; distractors must be tempting but wrong.',
  shortAnswer: '- shortAnswer: 1–2 sentence written response. Mark scheme = one idea per mark.',
  extendedResponse: '- extendedResponse: paragraph-length. Mark scheme lists discrete creditable points.',
  trueFalse: '- trueFalse: statement to assess; answer is "True" or "False" with one-sentence justification.',
  fillInTheBlank: '- fillInTheBlank: sentence must contain exactly one [blank] marker; answer = the word(s) that fill it.',
}

interface BuildSystemPromptInput {
  questionTypes: QuestionType[]
  markingMode: MarkingMode
  differentiation: DifferentiationMode
  yearGroup: string
  hasSource: boolean
}

export function buildSystemPrompt(input: BuildSystemPromptInput): string {
  const typeRules = input.questionTypes.map((t) => TYPE_RULES[t]).join('\n')
  const depth = yearGroupDepthGuidance(input.yearGroup)
  const groundingRule = input.hasSource
    ? 'You have been supplied with source material. Generate ONLY from that material — never invent facts beyond it. If the source does not cover something, omit it.'
    : 'No source material has been supplied. Generate only low-stakes recall / define questions on commonly-taught curriculum content. Keep total marks ≤12.'

  const differentiationRule =
    input.differentiation === 'threeTier'
      ? 'Each section must include support, core, and stretch difficulty questions — use the `difficulty` field.'
      : 'Set `difficulty` to "core" on all questions.'

  const markingRule = {
    markSchemeWithPoints: 'For each question, the answer is a numbered list of creditable points, one per mark.',
    answersOnly: 'Each answer is a single concise sentence — no marking criteria.',
    detailedExemplar: 'Each answer is a model exemplar response showing what a full-marks answer looks like.',
    none: 'Each answer field MUST be the empty string "".',
  }[input.markingMode]

  return `You are a worksheet generator for UK schools. Produce a structured JSON worksheet for tutors to print and use with their students.

Return ONLY valid JSON — no markdown, no commentary. Use this exact shape:

{
  "title": "string",
  "topic": "string",
  "subject": "string",
  "yearGroup": "string",
  "level": "string",
  "teacherOverview": {
    "intendedUse": "string",
    "timeEstimate": "string",
    "equipmentNeeded": ["string"],
    "differentiationNotes": { "support": "string", "stretch": "string" },
    "misconceptions": ["string"],
    "assumptions": ["string"],
    "optionalChallenge": "string",
    "challengeAnswer": "string"
  },
  "vocabularyBox": [{ "term": "string", "definition": "string" }],
  "sections": [{
    "title": "string",
    "instructions": "string",
    "questions": [{
      "id": "string",
      "type": "multipleChoice | shortAnswer | extendedResponse | trueFalse | fillInTheBlank",
      "text": "string",
      "marks": 1,
      "answer": "string",
      "difficulty": "support | core | stretch",
      "options": ["string"],
      "hint": "string"
    }]
  }],
  "extensionTask": "string",
  "totalMarks": 0
}

Year-group depth:
${depth}

Question type rules:
${typeRules}

Differentiation:
${differentiationRule}

Marking style:
${markingRule}

Grounding:
${groundingRule}

Mark scheme discipline (when marks > 0):
- One idea per mark. No padding.
- DO NOT use judgement words: ${NO_JUDGEMENT_TERMS.map((t) => `"${t}"`).join(', ')}.
- Mark schemes describe what a student must produce, not how good their writing is.

Language discipline:
- DO NOT use these vague phrases in any field: ${FORBIDDEN_PHRASES.map((p) => `"${p}"`).join(', ')}.
- Use concrete, named subject content (e.g., "mitochondria", "Pythagoras' theorem", "Treaty of Versailles") rather than abstractions.

totalMarks MUST equal the sum of all question marks across sections.
Question ids are simple strings like "q1", "q2".
Set "options" only for multipleChoice questions; omit on other types.
Set "hint" only when it materially helps a struggling student; otherwise omit.`
}
