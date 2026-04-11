import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function SchoolDemoSuccess() {
  return (
    <div className="min-h-screen bg-muted/30 py-20">
      <div className="container max-w-lg text-center">
        <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Demo Request Received!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your interest in Studybug for schools. Our education team will contact you
          within 24 hours to schedule your personalized demo.
        </p>
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-4">What happens next?</h3>
          <ul className="space-y-3 text-left">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <span className="text-sm text-muted-foreground">
                We&apos;ll review your requirements
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Schedule a demo at your preferred time
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Get a custom proposal for your school
              </span>
            </li>
          </ul>
        </div>
        <Button className="bg-primary text-white hover:bg-primary/90" asChild>
          <Link href="/">
            Return Home
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
