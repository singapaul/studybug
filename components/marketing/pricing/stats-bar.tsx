'use client';

import { Building2, Users, TrendingUp } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';
import { motion } from 'framer-motion';

export function StatsBar() {
  const stats = [
    {
      icon: Building2,
      value: '500+',
      label: 'UK Schools',
      color: 'bg-accent',
      iconColor: 'text-white',
    },
    {
      icon: Users,
      value: '50,000+',
      label: 'Students',
      color: 'bg-secondary',
      iconColor: 'text-white',
    },
    {
      icon: TrendingUp,
      value: '92%',
      label: 'Improvement',
      color: 'bg-coral',
      iconColor: 'text-white',
    },
  ];

  return (
    <section className="py-10 bg-white border-y border-border">
      <div className="container">
        <StaggerContainer className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-4 text-center md:text-left cursor-default"
              >
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                  className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center shadow-md`}
                >
                  <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                </motion.div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-foreground font-display">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
