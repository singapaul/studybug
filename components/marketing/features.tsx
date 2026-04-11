import { Shield, CreditCard, Activity } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const features = [
  {
    name: "Authentication",
    description:
      "Email/password + Google OAuth, fully managed. Secure sessions with NextAuth v5, bcrypt password hashing, and JWT tokens.",
    icon: Shield,
  },
  {
    name: "Billing",
    description:
      "Stripe subscriptions with hosted checkout & portal. Webhooks keep your database in sync automatically.",
    icon: CreditCard,
  },
  {
    name: "Monitoring",
    description:
      "Sentry error tracking across client, server, and edge. Know exactly when and why things break in production.",
    icon: Activity,
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="py-24 sm:py-32 bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Everything included
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            All the hard parts are done
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Stop wiring up infrastructure and start building your product. Every
            critical piece is pre-configured and ready to go.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.name}
                className="relative border bg-card hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.name}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional features grid */}
        <div className="mx-auto mt-12 max-w-5xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
            {[
              "Next.js 14 App Router",
              "TypeScript",
              "Tailwind CSS",
              "shadcn/ui",
              "PostgreSQL",
              "Prisma ORM",
              "Resend Emails",
              "React Email",
            ].map((tech) => (
              <div
                key={tech}
                className="rounded-lg border bg-card px-3 py-2.5 text-sm font-medium text-foreground"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
