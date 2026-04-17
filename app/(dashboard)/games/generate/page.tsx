'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Sparkles,
  Upload,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useGenerateGames, useCreateGame, GeneratedGameData } from '@/hooks/use-games'
import { useLibrarySubjects } from '@/hooks/use-library'
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

const ALL_TYPES = ['flashcards', 'pairs', 'multipleChoice', 'fillInTheBlank', 'speedRound'] as const
type GameTypeKey = typeof ALL_TYPES[number]

const TYPE_LABELS: Record<GameTypeKey, string> = {
  flashcards: 'Flashcards',
  pairs: 'Pairs',
  multipleChoice: 'Multiple Choice',
  fillInTheBlank: 'Fill in the Blank',
  speedRound: 'Speed Round',
}

const LOADING_MESSAGES = [
  'Reading your document…',
  'Extracting key concepts…',
  'Building flashcards…',
  'Creating matching pairs…',
  'Writing multiple choice questions…',
  'Generating fill-in-the-blank sentences…',
  'Putting together speed round questions…',
  'Almost there…',
]

function LoadingPhase() {
  const [msgIndex, setMsgIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length), 4000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-lg">Generating your games…</p>
        <p className="text-sm text-muted-foreground mt-1">{LOADING_MESSAGES[msgIndex]}</p>
      </div>
    </div>
  )
}

export default function GeneratePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [topic, setTopic] = useState('')
  const [subject, setSubject] = useState<string>('')
  const [selectedTypes, setSelectedTypes] = useState<Set<GameTypeKey>>(new Set(ALL_TYPES))
  const [generated, setGenerated] = useState<GeneratedGameData | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [resetKeys, setResetKeys] = useState<Record<string, number>>({})

  const { mutate: generateGames } = useGenerateGames()
  const { mutateAsync: createGame } = useCreateGame()
  const { data: subjects = [] } = useLibrarySubjects()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    if (selected && selected.size > MAX_FILE_SIZE) {
      toast.error('File exceeds 10MB limit')
      return
    }
    setFile(selected)
  }

  const toggleType = (key: GameTypeKey) => {
    setSelectedTypes(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const handleGenerate = () => {
    if (!file || selectedTypes.size === 0 || !subject) return
    setPhase('loading')
    generateGames(
      { file, topic: topic.trim() || undefined, gameTypes: Array.from(selectedTypes) },
      {
        onSuccess: (data) => {
          setGenerated(data)
          setSaved({})
          setResetKeys({})
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
    setSubject('')
    setGenerated(null)
    setSaved({})
    setResetKeys({})
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSaveSection = async (
    key: string,
    name: string,
    gameData: GameData,
    gameType: GameType,
  ) => {
    try {
      await createGame({ name, gameType, gameData, subject: subject || undefined })
      toast.success(`${getTemplateName(gameType)} game saved!`)
      setSaved((prev) => ({ ...prev, [key]: true }))
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
            Upload a PDF or text file and AI will generate the game types you select.
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

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject…" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.slug} value={s.slug}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!subject && (
                <p className="text-xs text-muted-foreground">Required — helps organise your games</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Game types to generate</Label>
              <div className="space-y-2">
                {ALL_TYPES.map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      id={`type-${key}`}
                      checked={selectedTypes.has(key)}
                      onCheckedChange={() => toggleType(key)}
                    />
                    <label
                      htmlFor={`type-${key}`}
                      className="text-sm cursor-pointer select-none"
                    >
                      {TYPE_LABELS[key]}
                    </label>
                  </div>
                ))}
              </div>
              {selectedTypes.size === 0 && (
                <p className="text-xs text-destructive">Select at least one game type</p>
              )}
            </div>

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={!file || selectedTypes.size === 0 || !subject}
            >
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
    return <LoadingPhase />
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
            {savableSections.length} game type{savableSections.length !== 1 ? 's' : ''} generated
          </p>
          <Badge variant="outline" className="text-xs">
            {generated.remainingToday} of 10 generations remaining today
          </Badge>
        </div>
      </div>

      {allSaved ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <div>
              <p className="font-semibold text-lg">All games saved!</p>
              <p className="text-sm text-muted-foreground mt-1">Head to your games library to play them.</p>
            </div>
            <Button onClick={() => router.push('/games')}>View My Games</Button>
          </CardContent>
        </Card>
      ) : savableSections.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <p className="text-muted-foreground text-sm">
              No game content could be generated from this document.
            </p>
            <Button variant="outline" onClick={handleReset}>Try another document</Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={savableSections[0].key}>
          <TabsList className="mb-4 flex-wrap h-auto">
            {savableSections.map(s => (
              <TabsTrigger key={s.key} value={s.key} className="gap-1.5">
                {getTemplateName(s.type)}
                {saved[s.key] && <CheckCircle className="h-3.5 w-3.5 text-green-600" />}
              </TabsTrigger>
            ))}
          </TabsList>

          {savableSections.map(s => (
            <TabsContent key={s.key} value={s.key}>
              {saved[s.key] ? (
                <div className="flex items-center gap-3 p-6 rounded-lg border bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <p className="font-medium">{getTemplateName(s.type)} saved successfully.</p>
                </div>
              ) : (
                <>
                  {s.itemCount < s.minItems && (
                    <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg mb-4">
                      Only {s.itemCount} items generated — you can add more manually before saving.
                    </p>
                  )}

                  {s.key === 'flashcards' && (
                    <FlashcardsBuilder
                      key={resetKeys[s.key] ?? 0}
                      initialName={suggestedName}
                      initialData={s.gameData as FlashcardsGameData}
                      onSave={(name, data) => handleSaveSection(s.key, name, data, s.type)}
                      onCancel={() => setResetKeys(prev => ({ ...prev, [s.key]: (prev[s.key] ?? 0) + 1 }))}
                    />
                  )}
                  {s.key === 'pairs' && (
                    <PairsBuilder
                      key={resetKeys[s.key] ?? 0}
                      initialName={suggestedName}
                      initialData={s.gameData as PairsGameData}
                      onSave={(name, data) => handleSaveSection(s.key, name, data, s.type)}
                      onCancel={() => setResetKeys(prev => ({ ...prev, [s.key]: (prev[s.key] ?? 0) + 1 }))}
                    />
                  )}
                  {s.key === 'multipleChoice' && (
                    <MultipleChoiceBuilder
                      key={resetKeys[s.key] ?? 0}
                      initialName={suggestedName}
                      initialData={s.gameData as MultipleChoiceGameData}
                      onSave={(name, data) => handleSaveSection(s.key, name, data, s.type)}
                      onCancel={() => setResetKeys(prev => ({ ...prev, [s.key]: (prev[s.key] ?? 0) + 1 }))}
                    />
                  )}
                  {s.key === 'fillInTheBlank' && (
                    <FillInTheBlankBuilder
                      key={resetKeys[s.key] ?? 0}
                      initialName={suggestedName}
                      initialData={s.gameData as FillInTheBlankGameData}
                      onSave={(name, data) => handleSaveSection(s.key, name, data, s.type)}
                      onCancel={() => setResetKeys(prev => ({ ...prev, [s.key]: (prev[s.key] ?? 0) + 1 }))}
                    />
                  )}
                  {s.key === 'speedRound' && (
                    <SpeedRoundBuilder
                      key={resetKeys[s.key] ?? 0}
                      initialName={suggestedName}
                      initialData={s.gameData as SpeedRoundGameData}
                      onSave={(name, data) => handleSaveSection(s.key, name, data, s.type)}
                      onCancel={() => setResetKeys(prev => ({ ...prev, [s.key]: (prev[s.key] ?? 0) + 1 }))}
                    />
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
