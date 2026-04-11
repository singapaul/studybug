'use client';
import { TooltipProvider } from "@/components/ui/tooltip";
export function MarketingProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
