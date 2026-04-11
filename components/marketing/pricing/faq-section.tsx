'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

const faqs = [
  {
    question: 'What happens after my free trial ends?',
    answer:
      "Your trial gives you full access to your chosen plan for 14 days. If you don't cancel, you'll be automatically charged at the end of the trial period. You can cancel anytime during the trial with no charge.",
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Absolutely! You can upgrade, downgrade, or cancel your plan at any time from your account settings. Changes take effect at your next billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards (Visa, Mastercard, American Express).',
  },
  {
    question: 'Is my data secure?',
    answer:
      "Yes. We're fully GDPR compliant and use bank-level encryption to protect all user data. Student information is never shared with third parties. Read our privacy policy for more details.",
  },
  {
    question: 'Can I use Studybug offline?',
    answer:
      "Paid plans include offline mode - download your decks and play without an internet connection. Your progress will automatically sync when you're back online.",
  },
];

export function FAQSection() {
  return (
    <div>
      <ScrollReveal className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about Studybug plans and billing
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible defaultValue="item-0" className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-xl px-6 bg-card data-[state=open]:bg-card data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5 font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollReveal>
    </div>
  );
}
