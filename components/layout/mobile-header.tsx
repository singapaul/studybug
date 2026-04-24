"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, BookOpen } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar";

interface MobileHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    plan: string;
  };
}

export function MobileHeader({ user }: MobileHeaderProps) {
  const [open, setOpen] = useState(false);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <>
      <header className="md:hidden flex h-14 items-center justify-between border-b bg-card px-4 shrink-0 z-40">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shrink-0">
            <BookOpen className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-base font-bold text-foreground">StudyBug</span>
        </Link>

        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-white">{initials}</span>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarNav user={user} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
