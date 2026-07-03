'use client';

import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';
import { motion } from 'framer-motion';
import {
  GameControllerIllustration,
  FlashcardStackIllustration,
  LibraryIllustration,
  ProgressChartIllustration,
  UploadIllustration,
  TeamIllustration,
} from '@/components/ui/animated-illustrations';

const features = [
  {
    illustration: GameControllerIllustration,
    title: '8 Interactive Game Modes',
    description:
      'From flashcards to memory matches, speed rounds to quizzes - find the perfect way to learn.',
  },
  {
    illustration: UploadIllustration,
    title: 'AI-Powered Deck Generation',
    description:
      'Paste a topic or upload a PDF and let AI build a ready-to-play deck in seconds.',
  },
  {
    illustration: FlashcardStackIllustration,
    title: 'Create Your Own Revision Tools',
    description:
      'Build custom decks with your own questions, images, and answers. Import from PDFs too.',
  },
  {
    illustration: LibraryIllustration,
    title: '40+ Prebuilt Revision Decks',
    description:
      'A growing library of curriculum-aligned decks across core GCSE subjects.',
  },
  {
    illustration: ProgressChartIllustration,
    title: 'Save & Track Your Progress',
    description:
      'See your improvement over time with detailed stats and performance insights.',
  },
  {
    illustration: TeamIllustration,
    title: 'Export & Share',
    description:
      'Export decks to PDF, CSV, or printable worksheets, and share any deck with a link.',
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-24 bg-cream relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232D2E2A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-secondary/10 blur-2xl" />
      <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-accent/15 blur-2xl" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-coral/10 blur-xl" />

      <div className="container relative">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to ace your exams
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for students and teachers
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group bg-white rounded-3xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full"
              >
                <div className="mb-5">
                  <feature.illustration size="lg" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
