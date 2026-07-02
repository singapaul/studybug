import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { UpgradeModalProvider } from "@/components/upgrade/upgrade-modal-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
    plan: (session.user as { plan?: string }).plan ?? "free",
  };

  return (
    <UpgradeModalProvider>
      <div data-app-shell className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
        <MobileHeader user={user} />
        <Sidebar user={user} />
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </UpgradeModalProvider>
  );
}
