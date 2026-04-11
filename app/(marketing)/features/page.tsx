'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Gamepad2,
  Zap,
  BookOpen,
  Timer,
  Brain,
  CheckCircle,
  Pencil,
  BarChart3,
  Trophy,
  WifiOff,
  Users,
  School,
  FileDown,
  Sparkles,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

const gameModes = [
  {
    icon: Gamepad2,
    name: 'Flip & Match',
    description: 'Classic memory matching game',
    color: 'bg-primary',
  },
  { icon: Zap, name: 'Splat!', description: 'Fast-paced card reactions', color: 'bg-secondary' },
  {
    icon: CheckCircle,
    name: 'Multiple Choice',
    description: 'Quiz-style assessments',
    color: 'bg-coral',
  },
  {
    icon: BookOpen,
    name: 'Flashcards',
    description: 'Traditional revision cards',
    color: 'bg-warning',
  },
  {
    icon: Timer,
    name: 'Speed Round',
    description: 'Beat the clock challenges',
    color: 'bg-accent',
  },
  {
    icon: Brain,
    name: 'Memory Challenge',
    description: 'Test your retention',
    color: 'bg-primary',
  },
  {
    icon: CheckCircle,
    name: 'True/False',
    description: 'Quick decision games',
    color: 'bg-secondary',
  },
  {
    icon: Pencil,
    name: 'Fill in the Blanks',
    description: 'Complete the sentence',
    color: 'bg-coral',
  },
];

const studentFeatures = [
  {
    icon: Pencil,
    title: 'Custom deck creation',
    description: 'Build your own revision materials tailored to your needs',
  },
  {
    icon: BarChart3,
    title: 'Progress tracking',
    description: 'See your improvement over time with detailed analytics',
  },
  {
    icon: Trophy,
    title: 'Achievement system',
    description: 'Earn badges and rewards as you progress',
  },
  {
    icon: WifiOff,
    title: 'Offline mode',
    description: 'Download decks and study without internet',
  },
];

const teacherFeatures = [
  {
    icon: Users,
    title: 'Classroom management',
    description: 'Organize students into classes and groups',
  },
  {
    icon: BarChart3,
    title: 'Student tracking',
    description: 'Monitor individual and class progress',
  },
  {
    icon: BookOpen,
    title: 'Pre-built curriculum decks',
    description: '400+ ready-to-use subject decks',
  },
  { icon: FileDown, title: 'Export/import tools', description: 'Share and backup your materials' },
];

export default function Features() {
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
              <span>20+ game modes to explore</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Everything You Need to Make{' '}
              <span className="text-secondary">Learning Engaging</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Discover all the features that make Studybug the most engaging revision platform for
              students and teachers.
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
                  Start Free Trial
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
              14-day free trial • Cancel anytime
            </motion.p>
          </div>
        </div>
      </section>

      {/* Game Modes */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Gamepad2 className="w-4 h-4" />
              20+ Game Modes
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Interactive Game Modes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from a variety of game types to keep learning fresh and engaging.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {gameModes.map((mode, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -6 }}
                className="p-6 rounded-3xl bg-white border border-border hover:shadow-xl transition-all group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  className={`w-12 h-12 rounded-xl ${mode.color} flex items-center justify-center mb-4 shadow-md`}
                >
                  <mode.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-1">{mode.name}</h3>
                <p className="text-sm text-muted-foreground">{mode.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Students */}
      <section className="py-24 bg-cream">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
                <GraduationCap className="w-4 h-4" />
                For Students
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Master Any Subject Your Way
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Create custom decks, track your progress, and earn achievements as you learn.
              </p>
              <div className="space-y-4">
                {studentFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 shadow-md">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="aspect-square max-w-md mx-auto rounded-3xl bg-secondary flex items-center justify-center shadow-2xl"
              >
                <GraduationCap className="w-32 h-32 text-white/40" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* For Teachers */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className="aspect-square max-w-md mx-auto rounded-3xl bg-primary flex items-center justify-center shadow-2xl"
              >
                <School className="w-32 h-32 text-white/40" />
              </motion.div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <School className="w-4 h-4" />
                For Teachers
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Powerful Classroom Tools
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Manage your classes, track student progress, and access hundreds of
                curriculum-aligned decks.
              </p>
              <div className="space-y-4">
                {teacherFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Try It?</h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
            Start your 14-day free trial and experience all features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-secondary hover:bg-white/90 rounded-full shadow-lg"
              asChild
            >
              <Link href="/sign-up">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 rounded-full"
              asChild
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
