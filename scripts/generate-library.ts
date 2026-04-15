/**
 * Library seed data generator.
 *
 * Reads LIBRARY_MANIFEST, calls Claude Haiku for each topic that doesn't yet have
 * a seed file, and writes the result to prisma/seed-data/[subject]/[topic].json.
 *
 * Run: npx ts-node --project tsconfig.scripts.json scripts/generate-library.ts
 *
 * Safe to re-run — skips existing files.
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { LIBRARY_MANIFEST } from '../prisma/library-manifest'

const MODEL = 'claude-haiku-4-5-20251001'
const OUTPUT_DIR = path.join(__dirname, '../prisma/seed-data')

interface LibraryItem {
  term: string
  definition: string
  sentence?: string
}

interface SeedFile {
  subject: string
  topic: string
  items: LibraryItem[]
}

function buildPrompt(subjectName: string, topicName: string, tags: string[]): string {
  const isGCSE = tags.includes('GCSE')
  const isLanguage = ['french', 'spanish'].includes(subjectName.toLowerCase())

  if (isLanguage) {
    return `You are a revision content generator for UK secondary school students.

Generate exactly 20 study items for the topic: ${subjectName} — ${topicName}
${isGCSE ? 'Target level: GCSE (ages 14–16)' : ''}

Return ONLY valid JSON with this exact shape (no markdown, no code fences, just the raw JSON):
{
  "items": [
    {
      "term": "key word or phrase in ${subjectName} (1–3 words)",
      "definition": "English translation or meaning",
      "sentence": "A sentence using [blank] in place of the term"
    }
  ]
}

Rules:
- term: the key ${subjectName} vocabulary word or phrase. Prefer single words where possible (needed for anagram game).
- definition: accurate English translation or clear meaning.
- sentence: must contain exactly one [blank] marker replacing the term. The sentence should be in ${subjectName}. Must make grammatical sense with the term filled in.
- Cover the full breadth of the topic — don't repeat similar concepts.
- Aim for vocabulary a student would encounter in a GCSE exam.`
  }

  return `You are a revision content generator for UK secondary school students.

Generate exactly 20 study items for the topic: ${subjectName} — ${topicName}
${isGCSE ? 'Target level: GCSE (ages 14–16)' : ''}

Return ONLY valid JSON with this exact shape (no markdown, no code fences, just the raw JSON):
{
  "items": [
    {
      "term": "key word or concept (ideally 1–3 words)",
      "definition": "clear, concise definition a student can memorise (1–2 sentences)",
      "sentence": "A sentence using [blank] in place of the term"
    }
  ]
}

Rules:
- term: the key concept to be memorised. Prefer single words where possible (needed for anagram game).
- definition: accurate, student-friendly explanation. No jargon without explanation.
- sentence: must contain exactly one [blank] marker replacing the term. Must make sense with the term filled in.
- Cover the full breadth of the topic — don't repeat similar concepts.
- Aim for terms a student would encounter in a GCSE exam.`
}

async function generateTopic(
  client: Anthropic,
  subjectName: string,
  subjectSlug: string,
  topicName: string,
  topicSlug: string,
  tags: string[],
): Promise<void> {
  const outputFile = path.join(OUTPUT_DIR, subjectSlug, `${topicSlug}.json`)

  if (fs.existsSync(outputFile)) {
    console.log(`  ⏭  ${subjectSlug}/${topicSlug} — already exists, skipping`)
    return
  }

  console.log(`  ⏳  ${subjectSlug}/${topicSlug} — generating...`)

  const prompt = buildPrompt(subjectName, topicName, tags)

  let raw: string
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })
    const block = message.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
    raw = block.text
  } catch (err) {
    console.error(`  ✗  ${subjectSlug}/${topicSlug} — Claude API error:`, err)
    return
  }

  // Strip markdown fences if present
  const json = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

  let parsed: { items: LibraryItem[] }
  try {
    parsed = JSON.parse(json)
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) {
      throw new Error('items array missing or empty')
    }
    // Validate each item has required fields
    for (const item of parsed.items) {
      if (typeof item.term !== 'string' || typeof item.definition !== 'string') {
        throw new Error(`Invalid item: ${JSON.stringify(item)}`)
      }
    }
  } catch (err) {
    console.error(`  ✗  ${subjectSlug}/${topicSlug} — Failed to parse response:`, err)
    console.error('  Raw response:', raw.slice(0, 300))
    return
  }

  const seedFile: SeedFile = {
    subject: subjectSlug,
    topic: topicSlug,
    items: parsed.items,
  }

  const dir = path.join(OUTPUT_DIR, subjectSlug)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(outputFile, JSON.stringify(seedFile, null, 2))
  console.log(`  ✓  ${subjectSlug}/${topicSlug} — ${parsed.items.length} items written`)
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY environment variable is not set')
    process.exit(1)
  }

  const client = new Anthropic({ apiKey })

  const subjectFilter = process.argv[2] // optional: only generate for one subject slug

  for (const subject of LIBRARY_MANIFEST) {
    if (subjectFilter && subject.slug !== subjectFilter) continue

    console.log(`\n📚 ${subject.name} (${subject.topics.length} topics)`)

    for (const topic of subject.topics) {
      await generateTopic(client, subject.name, subject.slug, topic.name, topic.slug, topic.tags)
      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  console.log('\n✅ Generation complete')
  console.log('Review the files in prisma/seed-data/ before running the seed script.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
