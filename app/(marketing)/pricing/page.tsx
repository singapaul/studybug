'use client';

import { useRouter } from 'next/navigation';
import { PricingCard } from '@/components/marketing/pricing/pricing-card';
import { TrustBadges } from '@/components/marketing/pricing/trust-badges';
import { FeatureComparison } from '@/components/marketing/pricing/feature-comparison';
import { FAQSection } from '@/components/marketing/pricing/faq-section';
import { PLANS } from '@/types/signup';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pricing() {
  const router = useRouter();

  const handleSelectPlan = (planId: string) => {
    router.push(`/sign-up?plan=${planId}`);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-cream">
        {/* Decorative shapes */}
        <div className="absolute top-20 left-[5%] w-32 h-32 rounded-full bg-secondary/10 blur-2xl" />
        <div className="absolute bottom-20 right-[10%] w-48 h-48 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute top-1/2 right-[20%] w-24 h-24 rounded-full bg-coral/10 blur-xl" />

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border text-foreground text-sm font-medium mb-6 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Just £5/month — cancel anytime
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Simple, <span className="text-secondary">Transparent</span> Pricing
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Choose the plan that fits your learning journey. No hidden fees.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {PLANS.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PricingCard
                  plan={plan}
                  onSelect={() => handleSelectPlan(plan.id)}
                />
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            £5/month • Cancel anytime
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-y border-border bg-cream">
        <div className="container">
          <TrustBadges />
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-white">
        <div className="container">
          <FeatureComparison />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute top-10 left-[10%] w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-10 right-[15%] w-64 h-64 rounded-full bg-secondary/10 blur-2xl" />

        <div className="container text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
            Get started today for £5/month. Cancel anytime.
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 rounded-full shadow-lg font-semibold"
            onClick={() => router.push('/sign-up')}
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-cream">
        <div className="container">
          <FAQSection />
        </div>
      </section>
    </>
  );
}
