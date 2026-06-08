"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Check, RefreshCw } from "lucide-react";

type UpgradeStatus = "success" | "cancelled";

export function UpgradeBanner({
  currentPlan,
  status,
}: {
  currentPlan: string;
  status: UpgradeStatus;
}) {
  const { data: session, refetch } = useSession();
  const [dismissed, setDismissed] = useState(false);
  const [refreshing, setRefreshing] = useState(status === "success");

  // The client session store is populated from before the upgrade, so it can
  // still say "free" even though the DB (and the server-rendered page) say
  // "pro". Refetch once on mount to sync the shared store — this unlocks every
  // usePlan() consumer (worksheets gate, header, premium-gate) without a reload.
  useEffect(() => {
    if (status !== "success") return;
    let active = true;
    Promise.resolve(refetch?.()).finally(() => {
      if (active) setRefreshing(false);
    });
    // Strip ?upgrade=success from the URL without a navigation, so the banner
    // stays for this view but never reappears on a later /dashboard visit.
    window.history.replaceState(null, "", "/dashboard");
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (dismissed) return null;

  if (status === "cancelled") {
    return (
      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
        <p className="font-medium text-amber-900">
          Checkout cancelled — you can upgrade to Pro anytime.
        </p>
        <button
          onClick={() => {
            window.history.replaceState(null, "", "/dashboard");
            setDismissed(true);
          }}
          className="text-xs text-amber-800 underline underline-offset-4"
        >
          Dismiss
        </button>
      </div>
    );
  }

  const sessionPlan =
    (session?.user as { plan?: string } | undefined)?.plan ?? currentPlan;
  const isPro = sessionPlan === "pro" || currentPlan === "pro";

  // Pro confirmed (by server render or by the client refetch).
  if (isPro && !refreshing) {
    return (
      <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <p className="font-medium text-green-800">
            You&apos;re now on Pro — enjoy all the features! 🎉
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-green-700 underline underline-offset-4"
        >
          Dismiss
        </button>
      </div>
    );
  }

  // Reconcile hasn't confirmed Pro yet (e.g. webhook still in flight). Show the
  // activating state with a manual retry that re-syncs the client session.
  return (
    <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-green-800">
          Payment successful! Your plan is being activated.
        </p>
        <p className="text-sm text-green-700 mt-0.5">
          This usually takes a few seconds.
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setRefreshing(true);
          Promise.resolve(refetch?.()).finally(() => setRefreshing(false));
        }}
        disabled={refreshing}
        className="border-green-300 text-green-800 hover:bg-green-100"
      >
        <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
        {refreshing ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );
}
