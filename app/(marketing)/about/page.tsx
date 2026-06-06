import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Why StudyBug exists and what we believe about learning.",
};

const VALUES = [
  {
    icon: Target,
    title: "Built for real classrooms",
    body: "Every feature starts with a teacher or student problem — not a buzzword. If it doesn't help someone learn, it doesn't ship.",
  },
  {
    icon: Sparkles,
    title: "Make revision feel good",
    body: "Studying shouldn't be a slog. Games, instant feedback, and clear progress turn revision into something students actually return to.",
  },
  {
    icon: HeartHandshake,
    title: "Fair and accessible",
    body: "A generous free tier, transparent pricing, and an interface that works for everyone, on any device.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-primary py-24 text-white">
        <div className="absolute top-10 left-[10%] w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="container relative text-center max-w-3xl">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Revision that students don&apos;t dread
          </h1>
          <p className="text-lg text-white/90">
            StudyBug turns notes, topics, and curricula into interactive games and printable
            worksheets — so learning sticks and teachers get hours back.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-center mb-12">What we believe</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/40">
        <div className="container max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Start for free</h2>
          <p className="text-muted-foreground mb-8">
            Create your first game in minutes — no card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/sign-up">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/features">Explore features</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
