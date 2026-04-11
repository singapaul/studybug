import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-32">
      {/* Subtle gradient background */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-blue-400 opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center">
            <span className="rounded-full border bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
              Production-ready from day one
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Build your SaaS{" "}
            <span className="text-primary">faster</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl max-w-2xl mx-auto">
            The production-ready Next.js starter with auth, billing, and error
            monitoring pre-wired. Ship in days, not months.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/sign-up">Get started free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8">
              <Link href="/#pricing">View pricing</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required. Free plan available.
          </p>
        </div>

        {/* Dashboard preview mockup */}
        <div className="mt-16 flow-root sm:mt-24">
          <div className="relative rounded-xl bg-muted/30 border ring-1 ring-border/50 p-2 lg:-m-4 lg:rounded-2xl lg:p-4">
            <div className="rounded-lg bg-card border shadow-2xl overflow-hidden">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto flex items-center gap-2 rounded-md border bg-background px-3 py-1 text-xs text-muted-foreground">
                  <span>app.studybug.io/dashboard</span>
                </div>
              </div>
              {/* Fake dashboard content */}
              <div className="bg-background p-6 min-h-[300px] flex gap-6">
                {/* Sidebar */}
                <div className="w-48 shrink-0 space-y-2">
                  <div className="h-8 w-32 rounded bg-muted animate-pulse" />
                  <div className="h-8 rounded bg-muted/60" />
                  <div className="h-8 rounded bg-primary/10" />
                  <div className="h-8 rounded bg-muted/60" />
                </div>
                {/* Main */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
                        <div className="h-3 w-16 rounded bg-muted" />
                        <div className="h-6 w-24 rounded bg-muted/70" />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-3 rounded bg-muted" style={{ width: `${60 + i * 10}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
