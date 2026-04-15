'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Sparkles,
  Upload,
  Loader2,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useGenerateGames, useCreateGame, GeneratedGameData } from '@/hooks/use-games'
import {
  GameType,
  GameData,
  FlashcardsGameData,
  PairsGameData,
  MultipleChoiceGameData,
  FillInTheBlankGameData,
  SpeedRoundGameData,
} from '@/types/game'
import { getTemplateName, getTemplateByType } from '@/lib/game-templates'
import { FlashcardsBuilder } from '@/components/games/FlashcardsBuilder'
import { PairsBuilder } from '@/components/games/PairsBuilder'
import { MultipleChoiceBuilder } from '@/components/games/MultipleChoiceBuilder'
import { FillInTheBlankBuilder } from '@/components/games/FillInTheBlankBuilder'
import { SpeedRoundBuilder } from '@/components/games/SpeedRoundBuilder'

type Phase = 'upload' | 'loading' | 'review'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function SectionHeader({
  type,
  itemCount,
  expanded,
  saved,
  onToggle,
}: {
  type: GameType
  itemCount: number
  expanded: boolean
  saved: boolean
  onToggle: () => void
}) {
  const name = getTemplateName(type)
  const canExpand = itemCount > 0 && !saved

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 select-none',
        canExpand && 'cursor-pointer hover:bg-muted/40',
        saved && 'bg-green-50 dark:bg-green-950/20',
        !canExpand && !saved && 'opacity-50',
      )}
      onClick={canExpand ? onToggle : undefined}
    >
      <div className="flex items-center gap-3">
        {saved ? (
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
        ) : canExpand ? (
          expanded
            ? <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
            : <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        )}
        <span className="font-medium">{name}</span>
        {saved ? (
          <Badge variant="outline" className="text-green-700 border-green-300 text-xs">Saved</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">{itemCount} items</Badge>
        )}
      </div>
      {itemCount === 0 && (
        <span className="text-xs text-muted-foreground">Not enough content</span>
      )}
    </div>
  )
}

export default function GeneratePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [topic, setTopic] = useState('')
  const [generated, setGenerated] = useState<GeneratedGameData | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const { mutate: generateGames } = useGenerateGames()
  const { mutateAsync: createGame } = useCreateGame()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    if (selected && selected.size > MAX_FILE_SIZE) {
      toast.error('File exceeds 10MB limit')
      return
    }
    setFile(selected)
  }

  const handleGenerate = () => {
    if (!file) return
    setPhase('loading')
    generateGames(
      { file, topic: topic.trim() || undefined },
      {
        onSuccess: (data) => {
          setGenerated(data)
          setSaved({})
          setExpanded({
            flashcards: data.flashcards.length > 0,
            pairs: data.pairs.length > 0,
            multipleChoice: data.multipleChoice.length > 0,
            fillInTheBlank: data.fillInTheBlank.length > 0,
            speedRound: data.speedRound.length > 0,
          })
          setPhase('review')
        },
        onError: (err: unknown) => {
          const e = err as { message?: string; code?: string }
          setPhase('upload')
          if (e.code === 'PRO_REQUIRED') {
            toast.error('Pro plan required for AI generation')
          } else if (e.code === 'GENERATION_LIMIT_REACHED') {
            toast.error('Daily generation limit reached (10/day). Resets at midnight.')
          } else {
            toast.error(e.message ?? 'Generation failed. Please try again.')
          }
        },
      },
    )
  }

  const handleReset = () => {
    setPhase('upload')
    setFile(null)
    setTopic('')
    setGenerated(null)
    setSaved({})
    setExpanded({})
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSaveSection = async (
    key: string,
    name: string,
    gameData: GameData,
    gameType: GameType,
  ) => {
    try {
      await createGame({ name, gameType, gameData })
      toast.success(`${getTemplateName(gameType)} game saved!`)
      setSaved((prev) => ({ ...prev, [key]: true }))
      setExpanded((prev) => ({ ...prev, [key]: false }))
    } catch (err: unknown) {
      const e = err as { code?: string }
      if (e.code === 'GAME_LIMIT_REACHED') {
        toast.error('Game limit reached. Upgrade to Pro to save more games.')
      } else {
        toast.error('Failed to save game')
      }
    }
  }

  const suggestedName = file ? file.name.replace(/\.[^.]+$/, '') : ''

  // ─── Upload phase ─────────────────────────────────────────────────────────

  if (phase === 'upload') {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <Link
          href="/games/create"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-display">Generate from Document</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Upload a PDF or text file and AI will generate flashcards, pairs, multiple choice,
            fill-in-the-blank, and speed round questions.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label>Document</Label>
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                  file
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-muted-foreground/20 hover:border-muted-foreground/40',
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                {file ? (
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF or TXT, up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">
                Topic focus{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="topic"
                placeholder="e.g. Photosynthesis, World War II, Spanish verbs"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Helps AI focus on the most relevant content
              </p>
            </div>

            <Button className="w-full" onClick={handleGenerate} disabled={!file}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Games
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Loading phase ────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg">Generating your games…</p>
          <p className="text-sm text-muted-foreground mt-1">
            Reading your document and creating study content
          </p>
        </div>
      </div>
    )
  }

  // ─── Review phase ─────────────────────────────────────────────────────────

  if (!generated) return null

  const sections = [
    {
      key: 'flashcards',
      type: GameType.FLASHCARDS,
      itemCount: generated.flashcards.length,
      minItems: getTemplateByType(GameType.FLASHCARDS)?.minItems ?? 5,
      gameData: { cards: generated.flashcards } as FlashcardsGameData,
    },
    {
      key: 'pairs',
      type: GameType.PAIRS,
      itemCount: generated.pairs.length,
      minItems: getTemplateByType(GameType.PAIRS)?.minItems ?? 3,
      gameData: { items: generated.pairs } as PairsGameData,
    },
    {
      key: 'multipleChoice',
      type: GameType.MULTIPLE_CHOICE,
      itemCount: generated.multipleChoice.length,
      minItems: getTemplateByType(GameType.MULTIPLE_CHOICE)?.minItems ?? 5,
      gameData: { questions: generated.multipleChoice } as MultipleChoiceGameData,
    },
    {
      key: 'fillInTheBlank',
      type: GameType.FILL_IN_THE_BLANK,
      itemCount: generated.fillInTheBlank.length,
      minItems: getTemplateByType(GameType.FILL_IN_THE_BLANK)?.minItems ?? 5,
      gameData: { items: generated.fillInTheBlank } as FillInTheBlankGameData,
    },
    {
      key: 'speedRound',
      type: GameType.SPEED_ROUND,
      itemCount: generated.speedRound.length,
      minItems: getTemplateByType(GameType.SPEED_ROUND)?.minItems ?? 10,
      gameData: { timeLimit: 60, items: generated.speedRound } as SpeedRoundGameData,
    },
  ]

  const savableSections = sections.filter((s) => s.itemCount > 0)
  const allSaved = savableSections.length > 0 && savableSections.every((s) => saved[s.key])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Upload another document
        </button>
        <h1 className="text-2xl font-bold font-display mb-1">Review Generated Games</h1>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-muted-foreground text-sm">
            {savableSections.length} game types generated
          </p>
          <Badge variant="outline" className="text-xs">
            {generated.remainingToday} of 10 generations remaining today
          </Badge>
        </div>
      </div>

      {allSaved ? (
        <Card className="mb-6">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <div>
              <p className="font-semibold text-lg">All games saved!</p>
              <p className="text-sm text-muted-foreground mt-1">Head to your games library to play them.</p>
            </div>
            <Button onClick={() => router.push('/games')}>View My Games</Button>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">
          Expand each section to review and edit the generated content, then save individual game types.
        </p>
      )}

      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.key} className="border rounded-lg overflow-hidden">
            <SectionHeader
              type={section.type}
              itemCount={section.itemCount}
              expanded={!!expanded[section.key]}
              saved={!!saved[section.key]}
              onToggle={() =>
                setExpanded((prev) => ({ ...prev, [section.key]: !prev[section.key] }))
              }
            />

            {!!expanded[section.key] && !saved[section.key] && (
              <div className="p-4 border-t bg-background">
                {section.itemCount < section.minItems && section.itemCount > 0 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-sm mb-4">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    Only {section.itemCount} items generated — you can add more manually before saving
                  </div>
                )}

                {section.key === 'flashcards' && (
                  <FlashcardsBuilder
                    initialName={suggestedName}
                    initialData={section.gameData as FlashcardsGameData}
                    onSave={(name, data) =>
                      handleSaveSection(section.key, name, data, section.type)
                    }
                    onCancel={() =>
                      setExpanded((prev) => ({ ...prev, [section.key]: false }))
                    }
                  />
                )}

                {section.key === 'pairs' && (
                  <PairsBuilder
                    initialName={suggestedName}
                    initialData={section.gameData as PairsGameData}
                    onSave={(name, data) =>
                      handleSaveSection(section.key, name, data, section.type)
                    }
                    onCancel={() =>
                      setExpanded((prev) => ({ ...prev, [section.key]: false }))
                    }
                  />
                )}

                {section.key === 'multipleChoice' && (
                  <MultipleChoiceBuilder
                    initialName={suggestedName}
                    initialData={section.gameData as MultipleChoiceGameData}
                    onSave={(name, data) =>
                      handleSaveSection(section.key, name, data, section.type)
                    }
                    onCancel={() =>
                      setExpanded((prev) => ({ ...prev, [section.key]: false }))
                    }
                  />
                )}

                {section.key === 'fillInTheBlank' && (
                  <FillInTheBlankBuilder
                    initialName={suggestedName}
                    initialData={section.gameData as FillInTheBlankGameData}
                    onSave={(name, data) =>
                      handleSaveSection(section.key, name, data, section.type)
                    }
                    onCancel={() =>
                      setExpanded((prev) => ({ ...prev, [section.key]: false }))
                    }
                  />
                )}

                {section.key === 'speedRound' && (
                  <SpeedRoundBuilder
                    initialName={suggestedName}
                    initialData={section.gameData as SpeedRoundGameData}
                    onSave={(name, data) =>
                      handleSaveSection(section.key, name, data, section.type)
                    }
                    onCancel={() =>
                      setExpanded((prev) => ({ ...prev, [section.key]: false }))
                    }
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
