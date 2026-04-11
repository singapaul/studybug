"use client";

import { useState } from "react";
import { Lock, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/hooks/use-plan";
import { toast } from "sonner";

interface PremiumGateProps {
  feature: string;
  children: React.ReactNode;
  /** When true the gate is active. When false, children render normally (e.g. for free game types). */
  enabled?: boolean;
  /** Programmatically force the modal open (e.g. after a limit-reached API error). */
  forceOpen?: boolean;
  onClose?: () => void;
}

export function PremiumGate({
  feature,
  children,
  enabled = true,
  forceOpen = false,
  onClose,
}: PremiumGateProps) {
  const { isPro } = usePlan();
  const [open, setOpen] = useState(false);

  const isModalOpen = forceOpen || open;

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) throw new Error("Failed to start checkout");
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("Could not start checkout. Please try again.");
    }
  };

  // If gate is disabled (free feature) or user is pro, render children directly
  if (!enabled || isPro) {
    return (
      <>
        {children}
        {/* Still render the modal if forceOpen is true (e.g. limit reached after save) */}
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
          <UpgradeDialogContent feature={feature} onUpgrade={handleUpgrade} onClose={handleClose} />
        </Dialog>
      </>
    );
  }

  return (
    <>
      <div
        className="relative cursor-pointer"
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
        aria-label={`Unlock ${feature} with Pro`}
      >
        <div className="pointer-events-none opacity-60">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/50 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-1">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Pro</span>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <UpgradeDialogContent feature={feature} onUpgrade={handleUpgrade} onClose={handleClose} />
      </Dialog>
    </>
  );
}

function UpgradeDialogContent({
  feature,
  onUpgrade,
  onClose,
}: {
  feature: string;
  onUpgrade: () => void;
  onClose: () => void;
}) {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
        </div>
        <DialogTitle>Unlock {feature} with Pro</DialogTitle>
        <DialogDescription>
          Upgrade to Pro to access all game types, unlimited games, and progress
          tracking.
        </DialogDescription>
      </DialogHeader>

      <ul className="text-sm text-muted-foreground space-y-1.5 my-2">
        <li className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
          All 5 game types (including Splat &amp; Swipe)
        </li>
        <li className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
          Unlimited custom games
        </li>
        <li className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
          Progress tracking &amp; score history
        </li>
      </ul>

      <div className="flex flex-col gap-2 mt-2">
        <Button onClick={onUpgrade} className="w-full">
          Upgrade to Pro
        </Button>
        <Button variant="ghost" onClick={onClose} className="w-full">
          Maybe later
        </Button>
      </div>
    </DialogContent>
  );
}
