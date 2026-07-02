"use client";

import { useEffect } from "react";
import { Lock } from "lucide-react";
import { usePlan } from "@/hooks/use-plan";
import { useUpgradeModal } from "@/components/upgrade/upgrade-modal-provider";

interface PremiumGateProps {
  feature: string;
  children: React.ReactNode;
  /** When true the gate is active. When false, children render normally (e.g. for free game types). */
  enabled?: boolean;
  /** Programmatically force the modal open (e.g. after a limit-reached API error). */
  forceOpen?: boolean;
  onClose?: () => void;
}

/**
 * Blurs and locks its children for non-Pro users; clicking opens the shared
 * upgrade modal. Can also be forced open programmatically (e.g. after a
 * limit-reached API error) via {@link forceOpen}.
 */
export function PremiumGate({
  feature,
  children,
  enabled = true,
  forceOpen = false,
  onClose,
}: PremiumGateProps) {
  const { isPro } = usePlan();
  const { openUpgrade } = useUpgradeModal();

  // Programmatic trigger: when a parent forces the gate open (e.g. limit
  // reached after a save), open the shared modal and forward its dismissal so
  // the parent can reset its own state.
  useEffect(() => {
    if (forceOpen) {
      openUpgrade(feature, { onClose });
    }
    // Only react to forceOpen toggling; feature/onClose are stable per open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceOpen]);

  // If gate is disabled (free feature) or user is Pro, render children directly.
  if (!enabled || isPro) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative cursor-pointer"
      onClick={() => openUpgrade(feature)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && openUpgrade(feature)}
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
  );
}
