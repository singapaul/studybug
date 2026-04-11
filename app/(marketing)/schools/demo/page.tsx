import Link from 'next/link';
import { DemoRequestForm } from '@/components/marketing/schools/demo-request-form';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function SchoolDemo() {
  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container max-w-2xl">
        <Link
          href="/schools"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Schools
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Request a Demo</h1>
            <p className="text-muted-foreground">
              Fill in your details and we&apos;ll schedule a personalized demo for your school
            </p>
          </div>
          <DemoRequestForm />
        </div>
      </div>
    </div>
  );
}
