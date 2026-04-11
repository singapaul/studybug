'use client'

import {
  LayoutGrid, BookOpen, CheckCircle, Zap, Move,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GameTemplate } from '@/types/game'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutGrid,
  BookOpen,
  CheckCircle,
  Zap,
  Move,
}

interface GameTypeCardProps {
  template: GameTemplate
  onClick: () => void
}

export function GameTypeCard({ template, onClick }: GameTypeCardProps) {
  const Icon = ICON_MAP[template.icon] ?? LayoutGrid

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl border bg-card p-5 text-left shadow-sm transition-all hover:shadow-md hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div
        className={cn(
          'mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white',
          template.color
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>

      <ul className="space-y-1">
        {template.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-muted-foreground">
        Min. {template.minItems} items
      </p>
    </button>
  )
}
