'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PricingHero } from '@/components/marketing/pricing/pricing-hero';
import { StatsBar } from '@/components/marketing/pricing/stats-bar';
import { HowItWorksHome } from '@/components/marketing/pricing/how-it-works-home';
import { FeaturesGrid } from '@/components/marketing/pricing/features-grid';
import { PricingCard } from '@/components/marketing/pricing/pricing-card';
import { TrustBadges } from '@/components/marketing/pricing/trust-badges';
import { FeatureComparison } from '@/components/marketing/pricing/feature-comparison';
import { FAQSection } from '@/components/marketing/pricing/faq-section';
import { InteractiveDemo } from '@/components/marketing/interactive-demo';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';
import { PLANS } from '@/types/signup';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const pricingRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const handleSelectPlan = (planId: string) => {
    router.push(`/sign-up?plan=${planId}`);
  };

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Hero Section */}
      <PricingHero onStartTrial={scrollToPricing} onLearnMore={scrollToHowItWorks} />

      {/* Stats Bar */}
      <StatsBar />

      {/* How It Works */}
      <div ref={howItWorksRef}>
        <HowItWorksHome />
      </div>

      {/* Interactive Demo */}
      <InteractiveDemo />

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-20 bg-background">
        <div className="container">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Choose the plan that&apos;s right for you. Pro is just £5/month, billed monthly.
            </p>
          </ScrollReveal>

          {/* Pricing Cards */}
          <StaggerContainer
            className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto"
            staggerDelay={0.1}
          >
            {PLANS.map((plan) => (
              <StaggerItem key={plan.id}>
                <PricingCard
                  plan={plan}
                  onSelect={() => handleSelectPlan(plan.id)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Sub-pricing text */}
          <ScrollReveal delay={0.5}>
            <p className="text-center text-sm text-muted-foreground mt-6">
              £5/month • Cancel anytime
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-y border-border bg-cream">
        <div className="container">
          <TrustBadges />
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-background">
        <div className="container">
          <FeatureComparison />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-secondary relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-10 left-[5%] w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-10 right-[10%] w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute top-1/2 left-[20%] w-24 h-24 rounded-full bg-coral/15 blur-xl" />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, white 2px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container text-center relative">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start Learning Smarter Today
            </h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
              Make revision fun and effective — start today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 rounded-full shadow-lg font-semibold"
                onClick={() => router.push('/sign-up')}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-foreground bg-white hover:bg-white/90 rounded-full"
                onClick={() => router.push('/schools')}
              >
                For Schools
              </Button>
            </div>
            <p className="text-sm text-white/70 mt-4">£5/month • Cancel anytime</p>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-cream relative overflow-hidden">
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Decorative shapes */}
        <div className="absolute top-20 right-[10%] w-40 h-40 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-20 left-[5%] w-32 h-32 rounded-full bg-secondary/8 blur-2xl" />

        <div className="container relative">
          <FAQSection />
        </div>
      </section>
    </>
  );
}
