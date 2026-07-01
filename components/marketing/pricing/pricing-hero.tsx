'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check, Star, Zap, ArrowRight, Play, Sparkles } from 'lucide-react';

interface PricingHeroProps {
  onStartTrial: () => void;
  onLearnMore: () => void;
}

export function PricingHero({ onStartTrial, onLearnMore }: PricingHeroProps) {
  const router = useRouter();

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-cream">
      {/* Subtle decorative shapes */}
      <div className="absolute top-20 left-[5%] w-32 h-32 rounded-full bg-secondary/10 blur-2xl" />
      <div className="absolute bottom-20 right-[10%] w-48 h-48 rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute top-1/2 right-[20%] w-24 h-24 rounded-full bg-coral/10 blur-xl" />

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Trust badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border text-foreground text-sm font-medium mb-6 shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex -space-x-1">
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Star className="w-3 h-3 text-accent-foreground fill-accent-foreground" />
                </div>
                <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                  <Star className="w-3 h-3 text-white fill-white" />
                </div>
                <div className="w-5 h-5 rounded-full bg-coral flex items-center justify-center">
                  <Star className="w-3 h-3 text-coral-foreground fill-coral-foreground" />
                </div>
              </div>
              <span>Trusted by 10,000+ students & teachers</span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Learning That <span className="text-secondary">Feels Like Play.</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Studybug transforms boring flashcards into engaging games. Students learn faster,
              retain more, and actually enjoy studying.
            </motion.p>

            {/* Key benefits */}
            <motion.div
              className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              {['20+ Game Modes', 'Progress Tracking', 'Works Offline'].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{benefit}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button
                size="lg"
                onClick={() => router.push('/sign-up')}
                className="bg-primary text-white hover:bg-primary/90 px-8 font-semibold rounded-full shadow-lg hover-lift text-base"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onLearnMore}
                className="border-2 border-foreground/20 text-foreground bg-white hover:bg-muted rounded-full"
              >
                <Play className="w-4 h-4 mr-2" />
                See How It Works
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
          </motion.div>

          {/* Game Mockup */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative">
              {/* Main game card */}
              <motion.div
                className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-sm mx-auto border border-border"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Game header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-foreground">Speed Round</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-coral fill-coral" />
                    <span>8/10</span>
                  </div>
                </div>

                {/* Question card */}
                <div className="bg-secondary rounded-2xl p-6 mb-4 text-center">
                  <p className="text-xs text-white/70 uppercase tracking-wide mb-2">Question 9</p>
                  <h3 className="text-2xl font-bold text-white">What is 12 × 7?</h3>
                </div>

                {/* Answer options */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {['72', '84', '96', '78'].map((answer) => (
                    <motion.button
                      key={answer}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`py-3 px-4 rounded-xl font-semibold text-lg transition-all ${
                        answer === '84'
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {answer}
                    </motion.button>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '80%' }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                </div>
              </motion.div>

              {/* Floating success card */}
              <motion.div
                className="absolute -top-4 -right-6 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2 border border-border"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Correct!</div>
                  <div className="text-xs text-muted-foreground">+10 points</div>
                </div>
              </motion.div>

              {/* Floating streak card */}
              <motion.div
                className="absolute -bottom-3 -left-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2 border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent-foreground" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">7 Day Streak!</div>
                  <div className="text-xs text-muted-foreground">Keep it up</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
