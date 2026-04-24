"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Settings, LogOut, ChevronDown, Gamepad2, TrendingUp, Lock, Library, BookOpen } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface UserProps {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  plan: string;
}

interface SidebarProps {
  user: UserProps;
}

interface SidebarNavProps {
  user: UserProps;
  onNavigate?: () => void;
}

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    proOnly: false,
  },
  {
    label: "Games",
    href: "/games",
    icon: Gamepad2,
    proOnly: false,
  },
  {
    label: "Library",
    href: "/library",
    icon: Library,
    proOnly: false,
  },
  {
    label: "Progress",
    href: "/progress",
    icon: TrendingUp,
    proOnly: true,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    proOnly: false,
  },
];

export function SidebarNav({ user, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();

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
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shrink-0">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">StudyBug</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isLocked = item.proOnly && user.plan !== "pro";
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {isLocked && (
                <Lock className="h-3.5 w-3.5 shrink-0 opacity-50" aria-label="Pro feature" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent transition-colors cursor-pointer">
              {/* Gradient avatar */}
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                <span className="text-xs font-bold text-white">{initials}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name ?? "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge
                  variant={user.plan === "pro" ? "default" : "secondary"}
                  className="text-xs capitalize"
                >
                  {user.plan}
                </Badge>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name ?? "User"}</p>
                <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer" onClick={onNavigate}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

export function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="hidden md:flex h-full w-64 flex-col border-r bg-card">
      <SidebarNav user={user} />
    </aside>
  );
}
