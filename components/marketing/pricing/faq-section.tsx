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
    question: 'How does billing work?',
    answer:
      "Pro is £5/month, billed monthly on a rolling basis. There's no long-term contract — you're only ever charged one month at a time, and you can cancel anytime from your account settings.",
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      "Yes. You can cancel your Pro subscription at any time from your account settings. You'll keep Pro access until the end of the month you've already paid for, then drop back to the free plan.",
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards (Visa, Mastercard, American Express).',
  },
  {
    question: 'Is my data secure?',
    answer:
      "Yes. We're fully GDPR compliant and use industry-standard encryption to protect all user data. Student information is never sold to third parties. Read our privacy policy for more details.",
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
