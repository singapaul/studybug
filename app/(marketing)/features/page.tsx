'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Zap,
  BookOpen,
  Timer,
  CheckCircle,
  Pencil,
  BarChart3,
  Shuffle,
  LayoutGrid,
  Share2,
  Download,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { motion } from 'framer-motion';

const gameModes = [
  {
    icon: BookOpen,
    name: 'Flashcards',
    description: 'Flip cards to memorise terms and definitions',
    color: 'bg-purple-500',
    free: true,
  },
  {
    icon: LayoutGrid,
    name: 'Pairs',
    description: 'Match terms to their definitions side by side',
    color: 'bg-blue-500',
    free: true,
  },
  {
    icon: CheckCircle,
    name: 'Multiple Choice',
    description: 'Four-option quizzes with instant feedback',
    color: 'bg-green-500',
    free: true,
  },
  {
    icon: Zap,
    name: 'Splat',
    description: 'Tap the correct answer before time runs out',
    color: 'bg-orange-500',
    free: false,
  },
  {
    icon: ArrowRight,
    name: 'Swipe',
    description: 'Swipe right for true, left for false',
    color: 'bg-pink-500',
    free: false,
  },
  {
    icon: Pencil,
    name: 'Fill in the Blank',
    description: 'Type the missing word to complete a sentence',
    color: 'bg-teal-500',
    free: false,
  },
  {
    icon: Timer,
    name: 'Speed Round',
    description: 'Answer as many questions as possible against the clock',
    color: 'bg-red-500',
    free: false,
  },
  {
    icon: Shuffle,
    name: 'Anagram Solver',
    description: 'Unscramble letters to spell the correct word',
    color: 'bg-violet-500',
    free: false,
  },
];

const freeFeatures = [
  'Up to 3 custom games',
  'Flashcards, Pairs, and Multiple Choice game types',
  'Play any game as many times as you like',
];

const proFeatures = [
  { icon: Sparkles, label: 'AI generation from PDFs or text files (10 per day)' },
  { icon: BookOpen, label: 'All 8 game types — including Splat, Swipe, Fill in the Blank, Speed Round, and Anagram' },
  { icon: LayoutGrid, label: 'Unlimited games' },
  { icon: BarChart3, label: 'Progress tracking and personal best scores' },
  { icon: Share2, label: 'Shareable links — anyone can play, Pro users can clone' },
  { icon: Download, label: 'CSV export for all game types' },
];

export default function Features() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-cream">
        <div className="absolute top-20 left-[5%] w-32 h-32 rounded-full bg-secondary/10 blur-2xl" />
        <div className="absolute bottom-20 right-[10%] w-48 h-48 rounded-full bg-accent/15 blur-3xl" />

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border text-foreground text-sm font-medium mb-6 shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span>8 game modes · AI generation · Real progress tracking</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Study tools that actually{' '}
              <span className="text-secondary">work for you</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Build games from your own notes, upload a document and let AI do the work,
              or pick from 8 game formats to study in the way that suits you best.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 rounded-full shadow-lg font-semibold"
                asChild
              >
                <Link href="/sign-up">
                  Get started free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-foreground/20 text-foreground bg-white hover:bg-muted rounded-full"
                asChild
              >
                <Link href="/pricing">View pricing</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Generation — Pro centrepiece */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">Pro feature</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Generate games from any document
              </h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                Upload a PDF or text file and AI creates flashcards, pairs, multiple choice, fill-in-the-blank,
                and speed round questions in seconds. Review everything before saving — edit, remove, or add your own.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'PDF and plain-text file support',
                  'Optional topic focus to guide the AI',
                  'All 5 supported game types generated in one go',
                  '10 generations per day',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild className="rounded-full">
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes */}
      <section className="py-24 bg-cream">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              8 game modes
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find the format that clicks
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three game types are free. All eight are available on Pro.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {gameModes.map((mode, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="relative p-5 rounded-2xl bg-white border border-border hover:shadow-md transition-all"
              >
                {!mode.free && (
                  <div className="absolute top-3 right-3">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
                <div
                  className={`w-10 h-10 rounded-xl ${mode.color} flex items-center justify-center mb-3 shadow-sm`}
                >
                  <mode.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{mode.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{mode.description}</p>
                {mode.free && (
                  <span className="mt-2 inline-block text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    Free
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Free vs Pro */}
      <section className="py-24 bg-white">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Free vs Pro</h2>
            <p className="text-lg text-muted-foreground">
              Start free. Upgrade when you want more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="rounded-2xl border border-border p-8">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-muted-foreground text-sm mb-6">Everything you need to get started.</p>
              <ul className="space-y-3">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full mt-6 rounded-full" asChild>
                <Link href="/sign-up">Get started free</Link>
              </Button>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-primary bg-primary/5 p-8">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold">Pro</h3>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-6">The full StudyBug experience.</p>
              <ul className="space-y-3">
                {proFeatures.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-start gap-2 text-sm">
                    <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {label}
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6 rounded-full" asChild>
                <Link href="/pricing">
                  Upgrade to Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-secondary relative overflow-hidden">
        <div className="absolute top-10 left-[10%] w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-10 right-[15%] w-64 h-64 rounded-full bg-primary/10 blur-2xl" />

        <div className="container text-center relative">
          <Sparkles className="w-12 h-12 text-white/60 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to study smarter?
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
            Create your first game for free — no card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-secondary hover:bg-white/90 rounded-full shadow-lg"
              asChild
            >
              <Link href="/sign-up">
                Get started free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 rounded-full"
              asChild
            >
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
