"use client";

import { forwardRef, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useUpgradeModal } from "./upgrade-modal-provider";

interface UpgradeToProButtonProps extends ComponentProps<typeof Button> {
  /** Contextual feature name passed to the modal headline, e.g. "Worksheets". */
  feature?: string;
}

/**
 * Drop-in button that opens the shared upgrade modal. Use this in place of any
 * `<Link href="/pricing">`-style upgrade CTA so every entry point funnels
 * through the same "what's in Pro" pop-up.
 */
export const UpgradeToProButton = forwardRef<
  HTMLButtonElement,
  UpgradeToProButtonProps
>(function UpgradeToProButton({ feature, children, onClick, ...props }, ref) {
  const { openUpgrade } = useUpgradeModal();
  return (
    <Button
      ref={ref}
      onClick={(e) => {
        openUpgrade(feature);
        onClick?.(e);
      }}
      {...props}
    >
      {children ?? "Upgrade to Pro"}
    </Button>
  );
});

interface UpgradeTriggerProps {
  /** Contextual feature name passed to the modal headline. */
  feature?: string;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}

/**
 * Unstyled `<button>` that opens the shared upgrade modal. Use where a full
 * `<Button>` doesn't fit — inline text links or custom-styled rows.
 */
export function UpgradeTrigger({
  feature,
  className,
  children,
  "aria-label": ariaLabel,
}: UpgradeTriggerProps) {
  const { openUpgrade } = useUpgradeModal();
  return (
    <button
      type="button"
      onClick={() => openUpgrade(feature)}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
