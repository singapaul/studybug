import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new in StudyBug.",
};

interface ChangelogEntry {
  date: string;
  version: string;
  changes: { tag: "New" | "Improved" | "Fixed"; text: string }[];
}

// Newest first. Add new releases to the top of this array.
const ENTRIES: ChangelogEntry[] = [
  {
    date: "June 2026",
    version: "Worksheets & polish",
    changes: [
      { tag: "New", text: "Full worksheet editor — edit any question, reorder sections, and change question types." },
      { tag: "New", text: "Export worksheets as student and answer-key PDFs." },
      { tag: "New", text: "Organise worksheets into folders, with duplicate and bulk actions." },
      { tag: "New", text: "Matching, ordering, and table-completion question types, plus exam-board alignment." },
      { tag: "New", text: "Dark mode across the dashboard." },
      { tag: "Improved", text: "Progress dashboard now shows per-subject and per-game breakdowns, insights, date filtering, and CSV export." },
      { tag: "New", text: "Per-game stats and the ability to generate a worksheet from any game or library deck." },
    ],
  },
  {
    date: "Earlier",
    version: "Core platform",
    changes: [
      { tag: "New", text: "Eight game types, AI generation from documents, and a pre-built revision library." },
      { tag: "New", text: "Sharing, progress tracking, and Stripe-powered Pro subscriptions." },
    ],
  },
];

const TAG_STYLES: Record<ChangelogEntry["changes"][number]["tag"], string> = {
  New: "bg-primary/10 text-primary",
  Improved: "bg-secondary/10 text-secondary",
  Fixed: "bg-muted text-muted-foreground",
};

export default function ChangelogPage() {
  return (
    <div className="container max-w-2xl py-16 sm:py-24">
      <div className="mb-12">
        <h1 className="font-display text-4xl font-bold mb-2">Changelog</h1>
        <p className="text-muted-foreground">The latest improvements and fixes in StudyBug.</p>
      </div>

      <div className="space-y-12">
        {ENTRIES.map((entry) => (
          <div key={entry.version} className="relative border-l-2 border-border pl-6">
            <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-primary" />
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{entry.date}</p>
            <h2 className="font-display text-xl font-bold mb-4">{entry.version}</h2>
            <ul className="space-y-3">
              {entry.changes.map((c, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Badge variant="secondary" className={`shrink-0 ${TAG_STYLES[c.tag]}`}>{c.tag}</Badge>
                  <span className="text-sm">{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
