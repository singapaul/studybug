import {
  QuestionType,
  MarkingMode,
  DifferentiationMode,
  ExamBoard,
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
  matching: '- matching: provide a "pairs" array of at least 2 { "left", "right" } objects (e.g. term → definition). The "answer" summarises the correct pairing. Omit "options".',
  ordering: '- ordering: provide an "items" array of at least 2 strings IN THE CORRECT ORDER; they are displayed shuffled to the student. The "answer" states the correct sequence. Omit "options".',
  tableCompletion: '- tableCompletion: provide a "table" object { "headers": [...], "rows": [[...]] }; mark each cell the student must fill with the literal token "[blank]". The "answer" lists the missing cell values in order. Omit "options".',
}

function markingRuleFor(markingMode: MarkingMode): string {
  return {
    markSchemeWithPoints: 'The answer is a numbered list of creditable points, one per mark.',
    answersOnly: 'The answer is a single concise sentence — no marking criteria.',
    detailedExemplar: 'The answer is a model exemplar response showing what a full-marks answer looks like.',
    none: 'The answer field MUST be the empty string "".',
  }[markingMode]
}

function examBoardRuleFor(examBoard?: ExamBoard): string {
  return examBoard && examBoard !== 'none'
    ? `Align to the ${examBoard} specification and use ${examBoard} terminology and assessment style.`
    : 'No specific exam board.'
}

const QUESTION_SHAPE = `{
  "id": "string",
  "type": "multipleChoice | shortAnswer | extendedResponse | trueFalse | fillInTheBlank | matching | ordering | tableCompletion",
  "text": "string",
  "marks": 1,
  "answer": "string",
  "difficulty": "support | core | stretch",
  "options": ["string"],
  "pairs": [{ "left": "string", "right": "string" }],
  "items": ["string"],
  "table": { "headers": ["string"], "rows": [["string"]] },
  "hint": "string"
}`

const QUESTION_FIELD_RULES = `Set "options" only for multipleChoice; "pairs" only for matching; "items" only for ordering; "table" only for tableCompletion. Omit fields that do not apply.
Use concrete, named subject content. Do not use judgement words: ${NO_JUDGEMENT_TERMS.map((t) => `"${t}"`).join(', ')}.`

interface RefineCommonInput {
  yearGroup: string
  markingMode: MarkingMode
  examBoard?: ExamBoard
}

/** System prompt for regenerating a single question. */
export function buildQuestionRegenPrompt(input: RefineCommonInput): string {
  return `You are refining ONE question on a UK-schools worksheet. Return ONLY a single JSON question object — no markdown, no commentary — in this exact shape:

${QUESTION_SHAPE}

Keep the same "id" as the question you are given unless asked otherwise. You may change "type" if the instruction requests it; otherwise keep it.

Year-group depth: ${yearGroupDepthGuidance(input.yearGroup)}
Marking style: ${markingRuleFor(input.markingMode)}
Exam board: ${examBoardRuleFor(input.examBoard)}
Type rules (apply to the resulting type):
${Object.values(TYPE_RULES).join('\n')}
${QUESTION_FIELD_RULES}`
}

/** System prompt for adding new questions to an existing worksheet. */
export function buildAddQuestionsPrompt(
  input: RefineCommonInput & { count: number; questionTypes: QuestionType[] },
): string {
  const typeRules = input.questionTypes.map((t) => TYPE_RULES[t]).join('\n')
  return `You are adding ${input.count} NEW question(s) to a UK-schools worksheet. Return ONLY JSON in this exact shape — no markdown, no commentary:

{ "questions": [ ${QUESTION_SHAPE} ] }

Produce exactly ${input.count} question(s). Do NOT duplicate the existing questions you are shown — cover different points. Give each a unique "id".

Use these question types: ${input.questionTypes.join(', ')}.
Year-group depth: ${yearGroupDepthGuidance(input.yearGroup)}
Marking style: ${markingRuleFor(input.markingMode)}
Exam board: ${examBoardRuleFor(input.examBoard)}
Type rules:
${typeRules}
${QUESTION_FIELD_RULES}`
}

interface BuildSystemPromptInput {
  questionTypes: QuestionType[]
  markingMode: MarkingMode
  differentiation: DifferentiationMode
  yearGroup: string
  hasSource: boolean
  examBoard?: ExamBoard
  /** Remix mode: mirror a supplied blueprint's structure with brand-new questions. */
  remix?: boolean
}

export function buildSystemPrompt(input: BuildSystemPromptInput): string {
  const typeRules = input.questionTypes.map((t) => TYPE_RULES[t]).join('\n')
  const depth = yearGroupDepthGuidance(input.yearGroup)
  const examBoardRule =
    input.examBoard && input.examBoard !== 'none'
      ? `Align questions to the ${input.examBoard} specification. Set "examBoard" to "${input.examBoard}" and populate "specPoints" with the specific spec reference points covered (e.g. "3.1.2 Photosynthesis"). Use ${input.examBoard} terminology and assessment style.`
      : 'No specific exam board. Omit "examBoard" and "specPoints".'
  const groundingRule = input.remix
    ? 'You are producing a PARALLEL VERSION from the blueprint supplied in the user message. Generate brand-new, curriculum-appropriate questions on the given topic that fit the blueprint\'s structure. Total marks should match the blueprint — ignore any general marks cap.'
    : input.hasSource
      ? 'You have been supplied with source material. Generate ONLY from that material — never invent facts beyond it. If the source does not cover something, omit it.'
      : 'No source material has been supplied. Generate only low-stakes recall / define questions on commonly-taught curriculum content. Keep total marks ≤12.'

  const differentiationRule = {
    mixedAbility:
      'This worksheet is for a mixed-ability class. Each section must include support, core, and stretch difficulty questions — use the `difficulty` field so every learner is catered for.',
    higher:
      'Pitch the ENTIRE worksheet at the higher/more-demanding band. Use higher-tier command words (explain, analyse, evaluate, justify), harder numerical values, multi-step problems and case studies. Set every question\'s `difficulty` to "core" or "stretch" only — never "support".',
    foundation:
      'Pitch the ENTIRE worksheet at the foundation/accessible band. Use plain language, scaffolding, concrete examples and shorter steps; break demanding tasks down. Set every question\'s `difficulty` to "support" or "core" only — never "stretch".',
  }[input.differentiation]

  const markingRule = {
    markSchemeWithPoints: 'For each question, the answer is a numbered list of creditable points, one per mark.',
    answersOnly: 'Each answer is a single concise sentence — no marking criteria.',
    detailedExemplar: 'Each answer is a model exemplar response showing what a full-marks answer looks like.',
    none: 'Each answer field MUST be the empty string "".',
  }[input.markingMode]

  const prompt = `You are a worksheet generator for UK schools. Produce a structured JSON worksheet for tutors to print and use with their students.

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
      "type": "multipleChoice | shortAnswer | extendedResponse | trueFalse | fillInTheBlank | matching | ordering | tableCompletion",
      "text": "string",
      "marks": 1,
      "answer": "string",
      "difficulty": "support | core | stretch",
      "options": ["string"],
      "pairs": [{ "left": "string", "right": "string" }],
      "items": ["string"],
      "table": { "headers": ["string"], "rows": [["string"]] },
      "hint": "string"
    }]
  }],
  "extensionTask": "string",
  "totalMarks": 0,
  "examBoard": "AQA | Edexcel | OCR | WJEC",
  "specPoints": ["string"]
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

Exam board alignment:
${examBoardRule}

Mark scheme discipline (when marks > 0):
- One idea per mark. No padding.
- DO NOT use judgement words: ${NO_JUDGEMENT_TERMS.map((t) => `"${t}"`).join(', ')}.
- Mark schemes describe what a student must produce, not how good their writing is.

Language discipline:
- DO NOT use these vague phrases in any field: ${FORBIDDEN_PHRASES.map((p) => `"${p}"`).join(', ')}.
- Use concrete, named subject content (e.g., "mitochondria", "Pythagoras' theorem", "Treaty of Versailles") rather than abstractions.

totalMarks MUST equal the sum of all question marks across sections.
Question ids are simple strings like "q1", "q2".
Set "options" only for multipleChoice questions; "pairs" only for matching; "items" only for ordering; "table" only for tableCompletion. Omit fields that do not apply to a question's type.
Set "hint" only when it materially helps a struggling student; otherwise omit.`

  return input.remix ? `${prompt}\n\n${REMIX_DIRECTIVE}` : prompt
}

const REMIX_DIRECTIVE = `REMIX MODE — PARALLEL VERSION:
The user message contains a BLUEPRINT describing an existing worksheet's structure: its sections and, for each question, the type, marks, difficulty and the skill/assessment objective it targets. Produce a NEW worksheet that mirrors this blueprint:
- Same number of sections, in the same order.
- Same number of questions per section; each new question keeps the SAME type, marks and difficulty as its corresponding blueprint slot.
- Each new question must assess the SAME objective/skill as its blueprint slot, but be a genuinely NEW question — do NOT reuse the original's wording, numbers or examples.
- Only deviate from a slot's difficulty if the differentiation band above forbids it, in which case pick the nearest allowed difficulty.`

/** System prompt for the remix extraction pass: read an uploaded worksheet, emit its blueprint. */
export function buildBlueprintExtractionPrompt(): string {
  return `You are analysing an existing UK-schools worksheet or test to capture its STRUCTURE (a "blueprint") — NOT its content. Return ONLY valid JSON — no markdown, no commentary — in this exact shape:

{
  "subject": "string",
  "topic": "string",
  "yearGroup": "string",
  "level": "string",
  "examBoard": "AQA | Edexcel | OCR | WJEC",
  "markingMode": "markSchemeWithPoints | answersOnly | detailedExemplar | none",
  "sections": [{
    "title": "string",
    "instructions": "string",
    "questions": [{
      "type": "multipleChoice | shortAnswer | extendedResponse | trueFalse | fillInTheBlank | matching | ordering | tableCompletion",
      "marks": 1,
      "difficulty": "support | core | stretch",
      "objective": "string"
    }]
  }]
}

Rules:
- One blueprint question entry per source question, IN ORDER, grouped into the same sections. If the source has no clear sections, use a single section.
- Classify EVERY source question into the NEAREST of the eight supported types. Map unsupported formats: a calculation → shortAnswer (or extendedResponse if working must be shown); an essay / long-answer → extendedResponse; label-a-diagram or define → shortAnswer; choose-the-answer → multipleChoice.
- "marks": the marks shown for the question; if none shown, estimate from demand (1 recall, 2–3 short, 4+ extended).
- "difficulty": infer from command words and marks — recall/define = support, describe/apply = core, explain/analyse/evaluate = stretch.
- "objective": one concise phrase naming the skill/knowledge assessed (e.g. "balance a chemical equation", "explain causes of WW1"). Do NOT copy the question wording.
- Infer subject/topic/yearGroup/level from the content; use "" if genuinely unknown. Omit examBoard/markingMode if unclear.
- Do NOT include question text, options or answers — only the structure above.`
}

/** System prompt for the remix generation pass: mirror a blueprint with new questions. */
export function buildRemixSystemPrompt(input: Omit<BuildSystemPromptInput, 'remix' | 'hasSource'>): string {
  return buildSystemPrompt({ ...input, hasSource: false, remix: true })
}
