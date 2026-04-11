'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building2, ArrowRight, Download, Users, Clock, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export function SchoolHero() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-cream">
      {/* Decorative shapes */}
      <div className="absolute top-20 left-[5%] w-32 h-32 rounded-full bg-secondary/10 blur-2xl" />
      <div className="absolute bottom-20 right-[10%] w-48 h-48 rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute top-1/2 right-[20%] w-24 h-24 rounded-full bg-coral/10 blur-xl" />

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border text-foreground text-sm font-medium mb-6 shadow-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Building2 className="w-4 h-4 text-secondary" />
            <span>For Schools & Institutions</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
          >
            Engage Every Student with{' '}
            <span className="text-secondary">Interactive Revision Games</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Trusted by schools across the UK to improve exam results and make learning memorable.
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
              <Link href="/schools/demo">
                Request a Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-foreground/20 text-foreground bg-white hover:bg-muted rounded-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Brochure
            </Button>
          </motion.div>

          <motion.p
            className="text-sm text-muted-foreground mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Free pilot available • No commitment required
          </motion.p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: Building2,
              value: '500+',
              label: 'UK Schools',
              color: 'bg-accent',
              iconColor: 'text-accent-foreground',
            },
            {
              icon: Users,
              value: '100K+',
              label: 'Students',
              color: 'bg-secondary',
              iconColor: 'text-white',
            },
            {
              icon: Clock,
              value: '12 min',
              label: 'Avg. session',
              color: 'bg-warning',
              iconColor: 'text-foreground',
            },
            {
              icon: BarChart3,
              value: '40%',
              label: 'Grade boost',
              color: 'bg-coral',
              iconColor: 'text-coral-foreground',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-3xl bg-white border border-border shadow-sm"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-md`}
              >
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </motion.div>
              <div className="text-2xl md:text-3xl font-bold text-foreground font-display">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
