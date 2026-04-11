'use client';

import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlanDetails, BillingCycle } from '@/types/signup';
import { motion } from 'framer-motion';

interface PricingCardProps {
  plan: PlanDetails;
  billingCycle: BillingCycle;
  onSelect: () => void;
}

export function PricingCard({ plan, billingCycle, onSelect }: PricingCardProps) {
  const isFree = plan.id === 'free';

  const monthlyPrice = plan.monthlyPrice;
  const annualMonthly = Math.round((plan.annualPrice / 12) * 100) / 100;
  const displayPrice = billingCycle === 'monthly' ? monthlyPrice : annualMonthly;
  const annualTotal = plan.annualPrice;

  const formatPrice = (price: number) => `£${price % 1 === 0 ? price : price.toFixed(2)}`;

  const getCardStyle = () => {
    if (plan.id === 'pro') {
      return 'border-2 border-primary bg-white shadow-xl ring-4 ring-primary/10';
    }
    return 'border border-border bg-white hover:shadow-lg';
  };

  const getBadgeStyle = () => {
    switch (plan.badgeColor) {
      case 'accent':
        return 'bg-coral text-white';
      case 'primary':
        return 'bg-primary text-white';
      case 'secondary':
        return 'bg-secondary text-white';
      default:
        return 'bg-primary text-white';
    }
  };

  const getButtonStyle = () => {
    if (plan.id === 'pro') {
      return 'bg-primary text-white hover:bg-primary/90 shadow-lg rounded-full';
    }
    return 'bg-muted text-foreground hover:bg-muted/80 rounded-full';
  };

  const getBadgeText = () => plan.badge ?? null;

  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`relative flex flex-col rounded-2xl p-6 transition-all h-full ${getCardStyle()}`}
    >
      {plan.badge && (
        <motion.div
          className="absolute -top-3 left-1/2 -translate-x-1/2"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span
            className={`inline-flex items-center justify-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold shadow-md whitespace-nowrap ${getBadgeStyle()}`}
          >
            {plan.id === 'pro' && <Sparkles className="w-3 h-3" />}
            {getBadgeText()}
          </span>
        </motion.div>
      )}

      <div className="mb-6 pt-2">
        <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
        <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
      </div>

      <div className="mb-6">
        {isFree ? (
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-foreground">£0</span>
            <span className="text-sm text-muted-foreground mt-1">Free forever</span>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-foreground">
                {formatPrice(displayPrice)}
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
            {billingCycle === 'annual' && (
              <span className="text-sm text-secondary mt-1 font-medium">
                Billed annually as {formatPrice(annualTotal)}
              </span>
            )}
          </div>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature, index) => (
          <motion.li
            key={index}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/15 flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3 text-success" strokeWidth={3} />
            </div>
            <span className="text-sm text-foreground">{feature}</span>
          </motion.li>
        ))}
        {plan.negativeFeatures?.map((feature, index) => (
          <li key={`neg-${index}`} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center mt-0.5">
              <X className="w-3 h-3 text-destructive" strokeWidth={2.5} />
            </div>
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button onClick={onSelect} className={`w-full ${getButtonStyle()}`} size="lg">
          {plan.ctaText}
        </Button>
      </motion.div>
    </motion.div>
  );
}
