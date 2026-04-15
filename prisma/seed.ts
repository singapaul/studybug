/**
 * Database seed script.
 *
 * Reads LIBRARY_MANIFEST and seed-data JSON files, then upserts all
 * LibrarySubject, LibraryTopic, and LibraryDeck rows.
 *
 * Run: npx ts-node --project tsconfig.scripts.json prisma/seed.ts
 * Or:  npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { LIBRARY_MANIFEST } from './library-manifest'

const db = new PrismaClient()

async function main() {
  let subjectCount = 0
  let topicCount = 0
  let deckCount = 0
  let skippedCount = 0

  for (const subject of LIBRARY_MANIFEST) {
    const dbSubject = await db.librarySubject.upsert({
      where: { slug: subject.slug },
      update: {
        name: subject.name,
        icon: subject.icon,
        color: subject.color,
        isFree: subject.isFree,
        sortOrder: subject.sortOrder,
      },
      create: {
        name: subject.name,
        slug: subject.slug,
        icon: subject.icon,
        color: subject.color,
        isFree: subject.isFree,
        sortOrder: subject.sortOrder,
      },
    })
    subjectCount++

    for (let i = 0; i < subject.topics.length; i++) {
      const topic = subject.topics[i]
      const dbTopic = await db.libraryTopic.upsert({
        where: { subjectId_slug: { subjectId: dbSubject.id, slug: topic.slug } },
        update: {
          name: topic.name,
          description: topic.description ?? null,
          sortOrder: i,
        },
        create: {
          subjectId: dbSubject.id,
          name: topic.name,
          slug: topic.slug,
          description: topic.description ?? null,
          sortOrder: i,
        },
      })
      topicCount++

      const seedFile = path.join(__dirname, 'seed-data', subject.slug, `${topic.slug}.json`)
      if (!fs.existsSync(seedFile)) {
        console.warn(`  ⚠  No seed data for ${subject.slug}/${topic.slug} — skipping deck`)
        skippedCount++
        continue
      }

      const data = JSON.parse(fs.readFileSync(seedFile, 'utf-8'))
      const items = data.items

      await db.libraryDeck.upsert({
        where: { topicId: dbTopic.id },
        update: { items, tags: topic.tags, itemCount: items.length },
        create: {
          topicId: dbTopic.id,
          name: `${subject.name}: ${topic.name}`,
          items,
          tags: topic.tags,
          itemCount: items.length,
        },
      })
      deckCount++
    }
  }

  console.log(`\n✅ Seed complete`)
  console.log(`   Subjects upserted: ${subjectCount}`)
  console.log(`   Topics upserted:   ${topicCount}`)
  console.log(`   Decks upserted:    ${deckCount}`)
  if (skippedCount > 0) {
    console.log(`   Skipped (no data): ${skippedCount}`)
  }
}

main()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
