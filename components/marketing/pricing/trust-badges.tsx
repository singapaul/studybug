'use client';

import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';
import { motion } from 'framer-motion';
import { Shield, Lock, ShieldCheck, Flag } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      label: 'GDPR Compliant',
      description: 'Your data is protected',
      color: 'bg-accent',
      iconColor: 'text-white',
    },
    {
      icon: Lock,
      label: 'Secure Payments',
      description: 'SSL encrypted',
      color: 'bg-secondary',
      iconColor: 'text-white',
    },
    {
      icon: ShieldCheck,
      label: 'Cancel Anytime',
      description: 'No contract, no lock-in',
      color: 'bg-warning',
      iconColor: 'text-white',
    },
    {
      icon: Flag,
      label: 'UK-Based Support',
      description: 'Fast responses',
      color: 'bg-coral',
      iconColor: 'text-white',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Trust message */}
      <ScrollReveal>
        <p className="text-center text-muted-foreground font-medium">
          Built in the UK for{' '}
          <span className="text-secondary font-semibold">GCSE revision</span>
        </p>
      </ScrollReveal>

      {/* Badges */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4" staggerDelay={0.1}>
        {badges.map((badge, index) => (
          <StaggerItem key={index}>
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-white border border-border h-full cursor-default shadow-sm"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
                className={`w-10 h-10 rounded-full ${badge.color} flex items-center justify-center mb-2`}
              >
                <badge.icon className={`w-5 h-5 ${badge.iconColor}`} />
              </motion.div>
              <span className="font-semibold text-foreground text-sm">{badge.label}</span>
              <span className="text-xs text-muted-foreground">{badge.description}</span>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
