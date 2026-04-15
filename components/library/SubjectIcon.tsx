import { Atom, BookOpen, Calculator, Dna, FlaskConical, Languages, Landmark } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Atom,
  BookOpen,
  Calculator,
  Dna,
  FlaskConical,
  Languages,
  Landmark,
}

export function SubjectIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? BookOpen
  return <Icon className={className} />
}
