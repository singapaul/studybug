import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

export default function Blog() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-background">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent-foreground text-sm font-medium mb-6">
            <Clock className="w-4 h-4" />
            Coming Soon
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            The Studybug Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Tips, insights, and stories about effective learning and revision strategies. We&apos;re
            working on great content for you.
          </p>
        </div>
      </section>

      {/* Placeholder Content */}
      <section className="py-20 bg-background">
        <div className="container max-w-3xl text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            We&apos;re Writing Something Great
          </h2>
          <p className="text-muted-foreground mb-8">
            Our team is preparing articles about learning science, study tips, and success stories
            from schools using Studybug. Check back soon!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/resources">
                Browse Resources
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
