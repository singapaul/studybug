'use client';

import { ArrowRight } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';
import { motion } from 'framer-motion';
import {
  UploadIllustration,
  GamesIllustration,
  AnalyticsIllustration,
} from '@/components/ui/animated-illustrations';

const steps = [
  {
    Illustration: UploadIllustration,
    heading: 'Upload your revision topics',
    description:
      'Turn your notes into interactive challenges. Add your own topics or pick from our growing library of prebuilt subjects - ready to revise instantly.',
    smallText: 'Save time by importing from Docs or PDF',
    color: 'bg-secondary',
  },
  {
    Illustration: GamesIllustration,
    heading: 'Choose your preferred game modes',
    description:
      'Play your way - from flashcards and quizzes to speed games and memory matches. Studybug adapts to how you learn best.',
    smallText: '8 game modes and counting',
    color: 'bg-accent',
  },
  {
    Illustration: AnalyticsIllustration,
    heading: 'Track your results and improvements',
    description:
      'Every game feeds into your personal dashboard. See your strongest topics, identify gaps, and track your improvement over time.',
    smallText: 'See your strongest and weakest topics',
    color: 'bg-warning',
  },
];

export function HowItWorksHome() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Decorative shapes */}
      <div className="absolute top-20 right-[5%] w-32 h-32 rounded-full bg-accent/15 blur-2xl" />
      <div className="absolute bottom-20 left-[10%] w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />

      <div className="container relative">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Studybug brings your revision to life
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform how you learn
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-8 relative" staggerDelay={0.15}>
          {/* Connection lines (desktop only) */}
          <div className="hidden md:block absolute top-24 left-1/3 w-1/3 h-0.5 bg-border" />
          <div className="hidden md:block absolute top-24 right-1/3 w-1/3 h-0.5 bg-border" />

          {steps.map((step, index) => (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ y: -6 }}
                className="relative bg-white rounded-3xl border border-border p-8 shadow-sm hover:shadow-xl transition-all h-full"
              >
                {/* Step number */}
                <div
                  className={`absolute -top-4 left-8 w-8 h-8 rounded-full ${step.color} flex items-center justify-center font-bold text-sm shadow-lg text-white`}
                >
                  {index + 1}
                </div>

                {/* Illustration */}
                <div className="flex justify-center mb-6">
                  <step.Illustration size="lg" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">{step.heading}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">{step.description}</p>
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  {step.smallText}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
