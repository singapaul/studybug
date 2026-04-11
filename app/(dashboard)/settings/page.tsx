"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, CreditCard, User } from "lucide-react";
import { Suspense } from "react";

function SettingsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "profile";

  const [profileState, setProfileState] = useState({
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [billingLoading, setBillingLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setProfileState({
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      });
    }
  }, [session?.user]);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileState.name,
          email: profileState.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileError(data.error ?? "Failed to update profile.");
        return;
      }

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      setProfileError("An unexpected error occurred.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleManageBilling() {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Failed to open billing portal.");
      }
    } catch {
      alert("An unexpected error occurred.");
    } finally {
      setBillingLoading(false);
    }
  }

  async function handleUpgrade() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Failed to start checkout.");
      }
    } catch {
      alert("An unexpected error occurred.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  const plan = (session?.user as { plan?: string } | undefined)?.plan ?? "free";
  const isPro = plan === "pro";

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and billing.
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Profile tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile information</CardTitle>
              <CardDescription>
                Update your name and email address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSave} className="space-y-6">
                {profileError && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                    {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Profile updated successfully.
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={profileState.name}
                    onChange={(e) =>
                      setProfileState((s) => ({ ...s, name: e.target.value }))
                    }
                    placeholder="Jane Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileState.email}
                    onChange={(e) =>
                      setProfileState((s) => ({ ...s, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Changing your email will require you to verify the new address.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing tab */}
        <TabsContent value="billing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current plan</CardTitle>
                <CardDescription>
                  Your current subscription and billing details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground capitalize">
                          {plan} plan
                        </p>
                        <Badge
                          variant={isPro ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {isPro ? "Active" : "Free"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isPro
                          ? "$29/month — renews automatically"
                          : "Free forever with limited features"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isPro ? (
              <Card>
                <CardHeader>
                  <CardTitle>Manage subscription</CardTitle>
                  <CardDescription>
                    Update your payment method, view invoices, or cancel your
                    subscription.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleManageBilling}
                    disabled={billingLoading}
                    variant="outline"
                  >
                    {billingLoading ? "Opening portal..." : "Open billing portal"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle>Upgrade to Pro</CardTitle>
                  <CardDescription>
                    Get access to all features with a Pro subscription.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {[
                      "Unlimited projects",
                      "Priority support",
                      "50 GB storage",
                      "Advanced analytics",
                      "Team collaboration",
                      "API access",
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        $29 / month
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cancel anytime
                      </p>
                    </div>
                    <Button
                      onClick={handleUpgrade}
                      disabled={checkoutLoading}
                    >
                      {checkoutLoading ? "Loading..." : "Upgrade to Pro"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
