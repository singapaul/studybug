"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started and exploring the platform.",
    features: [
      "Up to 3 projects",
      "Email/password authentication",
      "Community support",
      "1 GB storage",
      "Basic analytics",
    ],
    cta: "Get started",
    ctaHref: "/sign-up",
    highlighted: false,
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For teams and power users who need more.",
    features: [
      "Unlimited projects",
      "Google OAuth + credentials",
      "Priority support",
      "50 GB storage",
      "Advanced analytics",
      "Custom domain",
      "Team collaboration",
      "API access",
    ],
    cta: "Upgrade to Pro",
    ctaHref: null, // Handled by click handler
    highlighted: true,
    variant: "default" as const,
  },
];

export function Pricing() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleUpgrade() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401) {
        // Not signed in — redirect to sign-up
        window.location.href = "/sign-up";
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to start checkout:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Pricing
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Start free and upgrade when you need more. No hidden fees, cancel
            anytime.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlighted
                  ? "relative border-2 border-primary shadow-lg"
                  : "relative border"
              }
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </span>
                </div>
              )}

              <CardHeader className="pb-8">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {plan.description}
                </CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check
                        className="h-4 w-4 flex-shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {plan.ctaHref ? (
                  <Button asChild variant={plan.variant} className="w-full">
                    <Link href={plan.ctaHref}>{plan.cta}</Link>
                  </Button>
                ) : (
                  <Button
                    variant={plan.variant}
                    className="w-full"
                    onClick={handleUpgrade}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : plan.cta}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          All plans include a 14-day free trial. No credit card required to
          start.
        </p>
      </div>
    </section>
  );
}
