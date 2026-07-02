"use client";

import { useState } from "react";
import { Check, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Single source of truth for what Pro includes. Keep this in sync with the
 * marketing pricing page and the Settings billing tab copy.
 */
export const PRO_BENEFITS = [
  "Full pre-built revision library",
  "Worksheet generation & printing",
  "Progress tracking & score history",
  "All 5 game types (incl. Splat & Swipe)",
  "Unlimited custom games",
] as const;

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Contextual feature name for the headline, e.g. "Worksheets". */
  feature?: string;
}

/**
 * The shared "what's in Pro" pop-up. Opened from anywhere via
 * {@link useUpgradeModal}. "Proceed to checkout" starts a Stripe subscription
 * checkout session and redirects the browser to it.
 */
export function UpgradeModal({ open, onOpenChange, feature }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) throw new Error("Failed to start checkout");
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No checkout url returned");
    } catch {
      toast.error("Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  const title = feature ? `Unlock ${feature} with Pro` : "Upgrade to Pro";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Everything in StudyBug, unlocked. Here&apos;s what you get with Pro:
          </DialogDescription>
        </DialogHeader>

        <ul className="text-sm space-y-2 my-2">
          {PRO_BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-baseline justify-between rounded-lg bg-muted/50 px-4 py-3">
          <span className="text-sm text-muted-foreground">StudyBug Pro</span>
          <span>
            <span className="text-lg font-bold">£5</span>
            <span className="text-sm text-muted-foreground">/month</span>
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Button onClick={handleUpgrade} disabled={loading} className="w-full">
            {loading ? "Loading…" : "Proceed to checkout"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
