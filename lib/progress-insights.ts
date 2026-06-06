export interface AttemptRecord {
  scorePercentage: number;
  timeTaken: number;
  createdAt: Date;
  gameName: string;
  gameType: string;
  subject: string | null;
}

export interface SubjectBreakdown {
  subject: string;
  attempts: number;
  averageScore: number;
}

export interface TypeBreakdown {
  gameType: string;
  attempts: number;
  averageScore: number;
}

export interface Insight {
  type: "strength" | "weakness" | "trend";
  message: string;
}

const UNCATEGORISED = "Uncategorised";

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Serialise attempts to CSV (header + one row per attempt). */
export function attemptsToCsv(attempts: AttemptRecord[]): string {
  const header = ["Game", "Subject", "Type", "Score (%)", "Time (s)", "Date"];
  const rows = attempts.map((a) => [
    csvCell(a.gameName),
    csvCell(a.subject ?? UNCATEGORISED),
    csvCell(a.gameType),
    csvCell(a.scorePercentage),
    csvCell(Math.round(a.timeTaken / 1000)),
    csvCell(a.createdAt.toISOString().slice(0, 10)),
  ].join(","));
  return [header.join(","), ...rows].join("\n");
}

/** Keep attempts within the last `days` (relative to `now`). `null` = no filter. */
export function filterAttemptsByDays(
  attempts: AttemptRecord[],
  days: number | null,
  now: Date = new Date(),
): AttemptRecord[] {
  if (days == null) return attempts;
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  return attempts.filter((a) => a.createdAt.getTime() >= cutoff);
}

function averageOf(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}

export function computeSubjectBreakdown(attempts: AttemptRecord[]): SubjectBreakdown[] {
  const groups = new Map<string, number[]>();
  for (const a of attempts) {
    const key = a.subject?.trim() || UNCATEGORISED;
    const list = groups.get(key) ?? [];
    list.push(a.scorePercentage);
    groups.set(key, list);
  }
  return Array.from(groups.entries())
    .map(([subject, scores]) => ({ subject, attempts: scores.length, averageScore: averageOf(scores) }))
    .sort((a, b) => b.averageScore - a.averageScore);
}

export function computeTypeBreakdown(attempts: AttemptRecord[]): TypeBreakdown[] {
  const groups = new Map<string, number[]>();
  for (const a of attempts) {
    const list = groups.get(a.gameType) ?? [];
    list.push(a.scorePercentage);
    groups.set(a.gameType, list);
  }
  return Array.from(groups.entries())
    .map(([gameType, scores]) => ({ gameType, attempts: scores.length, averageScore: averageOf(scores) }))
    .sort((a, b) => b.averageScore - a.averageScore);
}

/** Rule-based insights: strongest/weakest subject (>= 2 attempts each) and an overall trend. */
export function deriveInsights(attempts: AttemptRecord[]): Insight[] {
  if (attempts.length < 3) return [];
  const insights: Insight[] = [];

  const subjects = computeSubjectBreakdown(attempts).filter((s) => s.attempts >= 2);
  if (subjects.length >= 2) {
    const strongest = subjects[0];
    const weakest = subjects[subjects.length - 1];
    if (strongest.subject !== weakest.subject) {
      insights.push({
        type: "strength",
        message: `${strongest.subject} is your strongest subject (${strongest.averageScore}% average).`,
      });
      insights.push({
        type: "weakness",
        message: `${weakest.subject} could use more practice (${weakest.averageScore}% average).`,
      });
    }
  }

  // Trend: compare the average of the earlier half vs the later half (chronological).
  const chronological = [...attempts].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const mid = Math.floor(chronological.length / 2);
  const firstHalf = averageOf(chronological.slice(0, mid).map((a) => a.scorePercentage));
  const secondHalf = averageOf(chronological.slice(mid).map((a) => a.scorePercentage));
  const delta = secondHalf - firstHalf;
  if (delta >= 5) {
    insights.push({ type: "trend", message: `Your scores are improving — up ${delta}% recently. Keep it up!` });
  } else if (delta <= -5) {
    insights.push({ type: "trend", message: `Your scores have dipped ${Math.abs(delta)}% recently — revisit your weaker topics.` });
  }

  return insights;
}
