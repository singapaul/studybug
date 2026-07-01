'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Gamepad2,
  BarChart3,
  FileText,
  Library,
  Settings,
  Target,
  Trophy,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';

const steps = [
  {
    number: 1,
    icon: Upload,
    title: 'Upload your revision topics',
    description:
      'Turn your notes into interactive challenges. Add your own topics or pick from our growing library of prebuilt subjects.',
    tips: [
      { icon: FileText, text: 'Import from Word docs, PDFs, or spreadsheets' },
      { icon: Library, text: 'Browse 400+ pre-built curriculum decks' },
      { icon: Settings, text: 'Customize cards with images and hints' },
    ],
    color: 'bg-primary',
  },
  {
    number: 2,
    icon: Gamepad2,
    title: 'Choose your game mode',
    description:
      'Play your way - from flashcards and quizzes to speed games and memory matches. Studybug adapts to how you learn best.',
    tips: [
      { icon: Target, text: 'Select difficulty levels that match your skill' },
      { icon: Settings, text: 'Customize game settings and time limits' },
      { icon: Gamepad2, text: '20+ different game modes to choose from' },
    ],
    color: 'bg-secondary',
  },
  {
    number: 3,
    icon: BarChart3,
    title: 'Track your results',
    description:
      'Every game feeds into your personal dashboard. See your strongest topics, identify gaps, and celebrate your learning streaks.',
    tips: [
      { icon: BarChart3, text: 'Detailed performance analytics' },
      { icon: Trophy, text: 'Earn achievements and badges' },
      { icon: Target, text: 'Set goals and track milestones' },
    ],
    color: 'bg-coral',
  },
];

const faqs = [
  {
    question: 'How long does it take to create my first deck?',
    answer:
      'Most users create their first deck in under 5 minutes. You can start with a pre-built deck instantly, or create a simple custom deck in just a few clicks.',
  },
  {
    question: 'Can I import my existing notes?',
    answer:
      'Yes! You can import content from Word documents, PDFs, and spreadsheets. Our smart import feature will help format your content into interactive cards.',
  },
  {
    question: 'Which game mode should I start with?',
    answer:
      'We recommend starting with Flashcards to get familiar with the content, then moving to more challenging modes like Speed Round or Memory Challenge.',
  },
  {
    question: 'How does progress tracking work?',
    answer:
      'Every time you play, your results are recorded. The dashboard shows your accuracy, time spent, streak days, and which topics need more practice.',
  },
  {
    question: 'Can I use Studybug on my phone?',
    answer:
      'Yes! Studybug works on any device with a web browser. Paid plans also include offline mode so you can study without internet.',
  },
];

export default function HowItWorks() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-cream">
        {/* Decorative shapes */}
        <div className="absolute top-20 left-[5%] w-32 h-32 rounded-full bg-secondary/10 blur-2xl" />
        <div className="absolute bottom-20 right-[10%] w-48 h-48 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute top-1/2 right-[20%] w-24 h-24 rounded-full bg-coral/10 blur-xl" />

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border text-foreground text-sm font-medium mb-6 shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span>From signup to your first game in under 5 minutes</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Get Started in <span className="text-secondary">3 Simple Steps</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Studybug makes it easy to turn any subject into an engaging learning game. Here&apos;s
              how it works.
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
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-foreground/20 text-foreground bg-white hover:bg-muted rounded-full"
                asChild
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </motion.div>

            <motion.p
              className="text-sm text-muted-foreground mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              £5/month • Cancel anytime
            </motion.p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="space-y-24">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={index % 2 === 1 ? 'lg:order-2' : ''}
                >
                  {/* Step Number */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                    >
                      {step.number}
                    </div>
                    <div className="h-px flex-1 bg-border max-w-[100px]" />
                  </div>

                  <h2 className="text-3xl font-bold text-foreground mb-4">{step.title}</h2>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Tips */}
                  <div className="space-y-4">
                    {step.tips.map((tip, tipIndex) => (
                      <motion.div
                        key={tipIndex}
                        whileHover={{ x: 4 }}
                        className="flex items-start gap-3"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg ${step.color} flex items-center justify-center flex-shrink-0 shadow-md`}
                        >
                          <tip.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-muted-foreground">{tip.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Illustration */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={index % 2 === 1 ? 'lg:order-1' : ''}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.3 }}
                    className={`aspect-video rounded-3xl ${step.color} flex items-center justify-center shadow-2xl`}
                  >
                    <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center">
                      <step.icon className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-cream">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Common Getting Started Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know to get started with Studybug.
            </p>
          </div>

          <Accordion type="single" collapsible defaultValue="item-0" className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white border border-border rounded-2xl px-6 data-[state=open]:shadow-lg"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="font-semibold text-foreground">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-secondary relative overflow-hidden">
        <div className="absolute top-10 left-[10%] w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-10 right-[15%] w-64 h-64 rounded-full bg-primary/10 blur-2xl" />

        <div className="container text-center relative">
          <Sparkles className="w-12 h-12 text-white/60 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Try It?</h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
            Get started for £5/month and see how easy revision can be.
          </p>
          <Button
            size="lg"
            className="bg-white text-secondary hover:bg-white/90 rounded-full shadow-lg"
            asChild
          >
            <Link href="/sign-up">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
