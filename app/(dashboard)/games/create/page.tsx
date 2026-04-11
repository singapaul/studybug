'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { GAME_TEMPLATES } from '@/lib/game-templates'
import { GameTypeCard } from '@/components/games/GameTypeCard'

export default function CreateGamePage() {
  const router = useRouter()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          href="/games"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Games
        </Link>
        <h1 className="text-2xl font-bold font-display">Choose a Game Type</h1>
        <p className="text-muted-foreground mt-1">
          Pick the format that best suits what you want to teach
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAME_TEMPLATES.map((template) => (
          <GameTypeCard
            key={template.type}
            template={template}
            onClick={() => router.push(`/games/build/${template.type}`)}
          />
        ))}
      </div>
    </div>
  )
}
