'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  GraduationCap,
  School,
  FileText,
  Video,
  MessageCircle,
  Download,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const teacherResources = [
  {
    icon: FileText,
    title: 'Getting Started Guide',
    description: 'Complete guide to setting up your classroom',
    link: '#',
    type: 'PDF',
  },
  {
    icon: BookOpen,
    title: 'Lesson Plan Templates',
    description: 'Ready-to-use lesson plans with Studybug',
    link: '#',
    type: 'PDF',
  },
  {
    icon: FileText,
    title: 'Case Studies',
    description: 'Success stories from schools across the UK',
    link: '#',
    type: 'PDF',
  },
];

const studentResources = [
  {
    icon: BookOpen,
    title: 'Study Tips & Techniques',
    description: 'Evidence-based strategies for effective revision',
    link: '#',
  },
  {
    icon: Video,
    title: 'How to Use Each Game Mode',
    description: 'Video tutorials for every game type',
    link: '#',
  },
  {
    icon: FileText,
    title: 'Revision Best Practices',
    description: 'Get the most out of your study sessions',
    link: '#',
  },
];

const supportLinks = [
  {
    icon: MessageCircle,
    title: 'Help Center',
    description: 'Browse FAQs and troubleshooting guides',
    link: '/help',
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Step-by-step video guides',
    link: '#',
  },
  {
    icon: MessageCircle,
    title: 'Contact Support',
    description: 'Get help from our team',
    link: '/contact',
  },
];

export default function Resources() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-background">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Resources &amp; Support
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to get the most out of Studybug.
          </p>
        </div>
      </section>

      {/* For Teachers */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <School className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">For Teachers</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {teacherResources.map((resource, index) => (
              <a
                key={index}
                href={resource.link}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <resource.icon className="w-6 h-6 text-primary" />
                  </div>
                  {resource.type && (
                    <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      {resource.type}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                <div className="flex items-center text-sm text-primary font-medium">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* For Students */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">For Students</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {studentResources.map((resource, index) => (
              <a
                key={index}
                href={resource.link}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-accent/50 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <resource.icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                <div className="flex items-center text-sm text-primary font-medium">
                  Read more
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Support</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {supportLinks.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-secondary/50 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <item.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <div className="flex items-center text-sm text-primary font-medium">
                  Visit
                  <ExternalLink className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-cream">
        <div className="container text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-muted-foreground mb-6">Our team is here to help you get started.</p>
          <Button size="lg" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
