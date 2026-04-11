'use client';

import { TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: TrendingUp,
    title: 'Boost Engagement',
    description:
      'Students love the game-based approach - average session time: 12 minutes vs 4 minutes for traditional flashcards.',
    color: 'bg-primary',
  },
  {
    icon: Clock,
    title: 'Save Teacher Time',
    description:
      'Access 500+ pre-built curriculum-aligned decks. No prep needed. Teachers can also share decks school-wide.',
    color: 'bg-secondary',
  },
  {
    icon: BarChart3,
    title: 'Track Progress',
    description:
      'Admin dashboard shows usage across your school. See which subjects students are revising and where they need support.',
    color: 'bg-coral',
  },
];

const steps = [
  {
    step: 1,
    title: 'Book a Demo',
    description: 'Schedule a 20-minute call with our education team',
    color: 'bg-primary',
  },
  {
    step: 2,
    title: 'Custom Proposal',
    description: "We'll create a tailored pricing plan for your school size",
    color: 'bg-secondary',
  },
  {
    step: 3,
    title: 'Easy Onboarding',
    description: "We'll help you set up SSO and import your users",
    color: 'bg-coral',
  },
  {
    step: 4,
    title: 'Teacher Training',
    description: 'Live training session for your staff (included free)',
    color: 'bg-warning',
  },
];

export function SchoolBenefits() {
  return (
    <section className="py-24 bg-cream">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Why Schools Choose Studybug</h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -6 }}
              className="p-6 rounded-3xl bg-white border border-border hover:shadow-xl transition-all"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                className={`w-12 h-12 rounded-xl ${benefit.color} flex items-center justify-center mb-4 shadow-md`}
              >
                <benefit.icon className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground">How It Works</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`w-12 h-12 rounded-full ${item.color} text-white font-bold flex items-center justify-center mx-auto mb-4 shadow-lg`}
              >
                {item.step}
              </motion.div>
              <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
