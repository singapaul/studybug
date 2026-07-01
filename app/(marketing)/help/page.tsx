'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  BookOpen,
  GraduationCap,
  School,
  Settings,
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const categories = [
  { icon: BookOpen, title: 'Getting Started', count: 8 },
  { icon: GraduationCap, title: 'For Students', count: 12 },
  { icon: School, title: 'For Teachers', count: 10 },
  { icon: Settings, title: 'Account & Settings', count: 6 },
  { icon: CreditCard, title: 'Billing & Plans', count: 7 },
  { icon: MessageCircle, title: 'Troubleshooting', count: 9 },
];

const popularQuestions = [
  {
    question: 'How do I create my first deck?',
    answer:
      'Click "Create Deck" from your dashboard, add a title, then start adding cards. Each card has a front (question) and back (answer). You can also import content from documents.',
  },
  {
    question: 'Can I share decks with other students?',
    answer:
      'Yes! With a paid plan, you can share decks using a unique link. Recipients with a Studybug account can add your deck to their library.',
  },
  {
    question: 'How does billing work?',
    answer:
      "Pro is £5/month, billed monthly on a rolling basis — no contract and no long-term commitment. You're charged one month at a time and can cancel anytime from your account settings.",
  },
  {
    question: 'What game modes are available?',
    answer:
      'Studybug offers 20+ game modes including Flashcards, Flip & Match, Speed Round, Memory Challenge, Multiple Choice, True/False, and more. Each mode offers a different way to learn.',
  },
  {
    question: 'How do I upgrade to Pro?',
    answer:
      "Go to Account Settings > Billing and click \"Upgrade to Pro\". You'll be taken to our secure Stripe checkout to start your £5/month subscription, and Pro features unlock as soon as payment goes through.",
  },
];

export default function Help() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-cream">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Help Center</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Search our knowledge base or browse categories below.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Search for answers..." className="pl-12 h-12 text-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {categories.map((category, index) => (
              <button
                key={index}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.count} articles</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Questions */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Popular Questions
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            {popularQuestions.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="font-semibold text-foreground">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-muted-foreground mb-6">Our support team is ready to help.</p>
          <Button size="lg" asChild>
            <Link href="/contact">
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Support
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
