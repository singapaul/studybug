"use client";

import { useSession } from "@/lib/auth-client";

export function usePlan() {
  const { data: session } = useSession();
  const plan = (session?.user as { plan?: string } | undefined)?.plan ?? "free";
  return { plan, isPro: plan === "pro" };
}
