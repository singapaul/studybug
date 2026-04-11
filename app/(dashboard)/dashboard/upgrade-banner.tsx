"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, RefreshCw } from "lucide-react";

export function UpgradeBanner({ currentPlan }: { currentPlan: string }) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (currentPlan === "pro") {
    return (
      <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <p className="font-medium text-green-800">
            You&apos;re now on Pro — enjoy all the features!
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

  function handleRefresh() {
    setRefreshing(true);
    router.refresh();
  }

  return (
    <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-green-800">
          Payment successful! Your plan is being activated.
        </p>
        <p className="text-sm text-green-700 mt-0.5">
          Click refresh to update your plan status.
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleRefresh}
        disabled={refreshing}
        className="border-green-300 text-green-800 hover:bg-green-100"
      >
        <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
        {refreshing ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );
}
